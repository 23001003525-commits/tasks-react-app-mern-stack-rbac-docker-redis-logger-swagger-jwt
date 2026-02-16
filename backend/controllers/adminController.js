import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import AuditLog from '../models/auditLogModel.js';
import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';
import logger from '../config/logger.js';
import cacheEvents from '../events/cacheEvents.js';

const ROOT_SUPERADMIN_EMAIL = 'superadmin@email.com';

// ================================

// USER MANAGEMENT

// ================================


//Get All Users (Pagination + Search + Filtering)


export const getAllUsers = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { email: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const roleFilter = req.query.role ? req.query.role === 'admin' ? {$or : [ {role: req.query.role}, {role: 'superadmin'} ] } : { role: req.query.role } : {}; //front end does not allow sending supereadmin as role, but our backend support sending it, should we add it in frontend? currently swagger does not allow sending superadmin either, matches frontend

  const isSuspendedFilter = // {isSuspended : false}
    req.query.suspended === ""
      ? {}
      : (req.query.suspended === undefined) ? {} : { isSuspended: req.query.suspended === 'true' };

  const filter = {
    ...keyword,
    ...roleFilter,
    ...isSuspendedFilter,
  };
//console.log("filter:", filter, 'req', req.query.suspended)

  const count = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select('-password')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

//console.log("count", count, "users", users)
  res.status(200).json({
    success: true,
    data: {
      users,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    },
  });
});



// Get Single User


export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});






export const deleteUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  const currentUser = req.user;

  if (!['admin', 'superadmin'].includes(currentUser.role)) {
    throw new ApiError(403, 'Not authorized', 'FORBIDDEN');
  }
// Prevent self deletion
  if (currentUser._id.toString() === targetUser._id.toString()) {
    throw new ApiError(400, 'You cannot delete yourself', 'SELF_DELETE_FORBIDDEN');
  }
  // ADMIN rules: IF admin tries to delete any 'role'' other than user, throw error
  if (currentUser.role === 'admin' && targetUser.role !== 'user') {
    throw new ApiError(403, 'Admins can only delete regular users', 'FORBIDDEN');
  }

  // SUPERADMIN rules: if super admin tries to delete any other superadmin then he must be the root superadmin
  if (
    currentUser.role === 'superadmin' &&
    targetUser.role === 'superadmin' &&
    currentUser.email !== ROOT_SUPERADMIN_EMAIL
  ) {
    throw new ApiError(
      403,
      'Only root superadmin can delete other superadmins',
      'ROOT_REQUIRED'
    );
  }

  //if we reach here, then it means we did not perform anything illegal/not-allowed, so we can now delete the user
  await targetUser.deleteOne();
  cacheEvents.emit('USER_UPDATED');
  await AuditLog.create({
    action: 'DELETE_USER',
    performedBy: req.user._id,
    targetUser: targetUser._id,
    ip: req.ip,
    performedBySnapshot: {
      userEmail: req.user.email,
      userName: req.user.name,
    },
    targetUserSnapshot: {
      targetUserEmail: targetUser.email,
      targetUserName: targetUser.name,
    },
  });

  logger.info({
    action: 'DELETE_USER',
    performedBy: req.user.email,
    targetUser: targetUser.email,
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    data: { message: 'User deleted successfully' },
  });
});



// Change Role (Promote / Demote)

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role: newRole } = req.body;
  const currentUser = req.user;
  const targetUserId = req.params.id;

  if (!['user', 'admin', 'superadmin'].includes(newRole)) {
    throw new ApiError(400, 'Invalid role', 'INVALID_ROLE');
  }

  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  // Prevent self-role modification
  if (currentUser._id.toString() === targetUser._id.toString()) {
    throw new ApiError(400, 'You cannot change your own role', 'SELF_ROLE_CHANGE');
  }

  const currentRole = currentUser.role;
  const targetRole = targetUser.role;
  const oldRole = targetUser.role;

  if (targetRole === newRole) {
    //if target user's current role is same as the new role, no need to update it, just return Target User already hav that role.
    throw new ApiError(400, 'Target user already has that role', 'ROLE_UNCHANGED');
  }


//


  // ============================
  //  ADMIN RULES
  // ============================

  if (currentRole === 'admin') {
    // Admin can ONLY promote user → admin and nothing else, no user to superadmin, no admin to superadmin ,no admin to admin
    if (targetRole === 'user' && newRole === 'admin') {
      targetUser.role = newRole;
    } else {throw new ApiError(403, 'Not authorized to change role', 'FORBIDDEN');}

  }


  // ============================
  // SUPERADMIN RULES
  // ============================

  if (currentRole === 'superadmin') {
    //this if, check if you are a superadmin and you want to demote another superadmin, then you must be root superadmin.
    //remember he still can not change itself, as we already checked for that condition at the starting
    if (targetRole === 'superadmin' && newRole !== 'superadmin' && currentUser.email !== ROOT_SUPERADMIN_EMAIL) {
      throw new ApiError(
        403,
        'Only root superadmin can demote other superadmins',
        'ROOT_REQUIRED'
      );
    }
    // All superadmin transitions allowed except protected cases above
    targetUser.role = newRole; //todo move this and above role assignment out side of the functions as we took care of else part, then remove the check of targetUser.role === newRole , which is done below, as not needed anymore
  }

  let promoteOrDemote = "UPDATE_ROLE_UNKNOWN";
  if (oldRole === 'user' && newRole === 'admin') {promoteOrDemote = "PROMOTED_TO_ADMIN"}
  else if (oldRole === 'user' && newRole === 'superadmin') {promoteOrDemote = "PROMOTED_TO_SUPERADMIN"}
  else if (oldRole === 'admin' && newRole === 'superadmin') {promoteOrDemote = "PROMOTED_TO_SUPERADMIN"}
  else if (oldRole === 'admin' && newRole === 'user') {promoteOrDemote = "DEMOTED_TO_USER"}
  else if (oldRole === 'superadmin' && newRole === 'admin') {promoteOrDemote = "DEMOTED_TO_ADMIN"}
  else if (oldRole === 'superadmin' && newRole === 'user') {promoteOrDemote = "DEMOTED_TO_USER"}
  else { promoteOrDemote = "UPDATE_ROLE_UNKNOWN"}

  if (targetUser.role === newRole){
   //if we were able to sucessfully change the role then we save the role and audit it, otherwise user tried something that's not allowed
    await targetUser.save();
    cacheEvents.emit('USER_UPDATED');
    await AuditLog.create({
      action: promoteOrDemote,
      performedBy: req.user._id,
      targetUser: targetUser._id,
      ip: req.ip,
      performedBySnapshot: {
        userEmail: req.user.email,
        userName: req.user.name,
      },
      targetUserSnapshot: {
        targetUserEmail: targetUser.email,
        targetUserName: targetUser.name,
      },
    });
    
    logger.info({
      action: promoteOrDemote,
      performedBy: req.user.email,
      targetUser: targetUser.email,
      ip: req.ip,
    });  

    res.status(200).json({
      success: true,
      data: { message: `User role updated to ${newRole}` },
    });

  } else{  throw new ApiError(403, 'Not authorized to change role', 'FORBIDDEN');  }
});




//toggle

//Toggle Suspension of users/admins/superadmins, just in case a superadmin decided to take leave, we allow root superadmint to temp suspend them
export const toggleSuspendUser = asyncHandler(async (req, res) => {
  const actor = req.user;
  const targetId = req.params.id;
  const targetUser = await User.findById(targetId);

  if (!targetUser) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }


  if (actor._id.toString() === targetUser._id.toString()) {
    throw new ApiError(403, 'You cannot suspend your own account', 'SELF_SUSPEND_FORBIDDEN');
  }


  const actorRole = actor.role;
  const targetRole = targetUser.role;

  // Only SUPER_ADMIN or ADMIN can perform suspension
  if (!['superadmin', 'admin'].includes(actorRole)) {
    throw new ApiError(403, 'Not authorized to suspend users', 'FORBIDDEN');
  }

  // ADMIN restrictions
  if (actorRole === 'admin') {
    if (targetRole !== 'user') {
      throw new ApiError(403, 'Admins can only suspend regular users', 'FORBIDDEN');
    }
  }

  // SUPER_ADMIN restrictions
  if (actorRole === 'superadmin') {
    if (targetRole === 'superadmin' && actor.email !== ROOT_SUPERADMIN_EMAIL ) {
      throw new ApiError(
        403,
        'Only root superadmin can suspend other superadmins',
        'ROOT_REQUIRED'
      );
    }
  }



  const previousState = targetUser.isSuspended;
  targetUser.isSuspended = !previousState;
  await targetUser.save();
  cacheEvents.emit('USER_UPDATED');

  await AuditLog.create({
    action: previousState ? 'UNSUSPEND_USER' : 'SUSPEND_USER',
    performedBy: actor._id,
    targetUser: targetUser._id,
    ip: req.ip,
    performedBySnapshot: {
      userEmail: req.user.email,
      userName: req.user.name,
    },
    targetUserSnapshot: {
      targetUserEmail: targetUser.email,
      targetUserName: targetUser.name,
    },
  });

  
  logger.info({
    action: previousState ? 'UNSUSPEND_USER' : 'SUSPEND_USER',
    performedBy: req.user.email,
    targetUser: targetUser.email,
    ip: req.ip,
  });  

  res.status(200).json({
    success: true,
    data: {
      message: `User has been ${targetUser.isSuspended ? 'suspended' : 'unsuspended'} successfully`,
    },
  });


});

// ================================

// TASK MANAGEMENT

// ================================



export const getAllTasks = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Task.countDocuments();

  const tasks = await Task.find()
    .populate('user', 'name role email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    success: true,
    data: {
      tasks,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    },
  });
});


//Delete A Task

export const deleteAnyTask = asyncHandler(async (req, res) => {
//  try {
//      // Intentionally causing a runtime error, checking if stack trace included in logger,
//      let result = undefinedVariable; // This will result in a ReferenceError
//  } catch (error) {
//      logger.error(error); 
//  }
  const task = await Task.findById(req.params.id); //.populate('user', 'name email');

  if (!task) {
    throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND');
  }

  const targetUserId = task.user?.toString(); // safe
  //tostring cause just in case we change our db later, and auto string conversion is not provided.
  await task.populate('user', 'role email name');  //after populate, NOT SAFE to get user id cause maybe the user got deleted so it will return null user


  const actor = req.user;
  const targetUser = task.user;

  const actorRole = actor.role;
  let targetRole = 'user';
  if (!targetUser) {
    logger.warn( `USER#${targerUserId} NOT FOUND: Task#${task._id.toString()} has no associated user` );
    targetRole = 'user'; //asume it as user so it can be deleted .. we still want the admins to delete tasks of deleted users., writing it even tho we can leave it as we have default as user
  }else{
    targetRole = targetUser.role;
  }

  const isSelfDelete = actor._id.toString() == targetUser._id.toString() ? true : false;

  // ======================
  // ADMIN RULE
  // ======================
  if (actorRole === 'admin' && !isSelfDelete) {
    if (targetRole !== 'user') {
      throw new ApiError(
        403,
        'Admins can only delete tasks of regular users',
        'FORBIDDEN'
      );
    }
  }

  // ======================
  // SUPERADMIN RULE
  // ======================
  if (actorRole === 'superadmin' && !isSelfDelete) {
    if (
      targetRole === 'superadmin' &&
      actor.email !== ROOT_SUPERADMIN_EMAIL
    ) {
      throw new ApiError(
        403,
        'Only root superadmin can delete other superadmin tasks',
        'ROOT_REQUIRED'
      );
    }
  }

  await task.deleteOne();
  cacheEvents.emit('TASK_UPDATED', targetUserId);
  await AuditLog.create({
    action: 'DELETE_TASK',
    performedBy: req.user._id,
    targetTask: task._id,
    ip: req.ip,
    performedBySnapshot: {
      userEmail: req.user.email,
      userName: req.user.name,
    },
    targetTaskSnapshot: {
      targetUserEmail: task.user.email,
      targetUserName: task.user.name,
      targetTaskTitle: task.title,
    },
  });

  logger.info({
    action:  'DELETE_TASK',
    performedBy: req.user.email,
    targetUser: task.user.email,
    ip: req.ip,
  });  

  res.status(200).json({
    success: true,
    data: { message: 'Task removed' },
  });
});

// ================================

// SYSTEM MANAGEMENT

// ================================


// System Statistics

export const getSystemStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalTasks = await Task.countDocuments();
  const admins = await User.countDocuments({ role: 'admin' });
  const superadmins = await User.countDocuments({ role: 'superadmin' });
  const suspendedUsers = await User.countDocuments({ isSuspended: true });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalTasks,
      admins: admins+superadmins,
      suspendedUsers,
    },
  });
});


// View Logs

export const getAuditLogs = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.page) || 1;

  const count = await AuditLog.countDocuments();

  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  const response = {
    success: true,
    data: {
      logs,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    },
  };
  res.status(200).json(response);


});
