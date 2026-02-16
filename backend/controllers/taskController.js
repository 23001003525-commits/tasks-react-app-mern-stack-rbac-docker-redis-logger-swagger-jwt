import asyncHandler from 'express-async-handler';
import Task from '../models/taskModel.js';
import { ApiError } from '../utils/apiError.js';
import cacheEvents from '../events/cacheEvents.js';

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    throw new ApiError(400, 'Task title is required', 'TITLE_REQUIRED');
  }
  if (title !== undefined && !title.trim()) {
   throw new ApiError(400, 'Task title cannot be empty', 'INVALID_TITLE');
  }


  const task = await Task.create({
    user: req.user._id,
    title,
  });
  cacheEvents.emit('TASK_UPDATED', req.user._id);
  res.status(201).json({
    success: true,
    data: task,
  });
});


/**
 * @desc    Get all tasks for logged-in user
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: tasks,
  });
});


/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
//could combine the task find and task ownership check if one db query....like this const task = await Task.findOne({
//  _id: req.params.id,
//  user: req.user._id,
//});
//but better this way... can send proper responses
  if (!task) {
    throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND');
  }

  // Authorization check (user owns task)
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this task', 'FORBIDDEN');
  }

  task.title = req.body.title ?? task.title;  //If req.body.title is null or undefined -> keep old title
  task.completed = req.body.completed ?? task.completed;

  if (!task.title.trim()) {
   throw new ApiError(400, 'Task title cannot be empty', 'INVALID_TITLE');
  }

  const updatedTask = await task.save();
  cacheEvents.emit('TASK_UPDATED', req.user._id);
  res.status(200).json({
    success: true,
    data: updatedTask,
  });
});


/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND');
  }

  // Authorization check (user owns task)
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this task', 'FORBIDDEN');
  }

  await task.deleteOne();
  cacheEvents.emit('TASK_UPDATED', req.user._id);
  res.status(200).json({
    success: true,
    data: {
      message: 'Task removed',
    },
  });
});

export { createTask, getTasks, updateTask, deleteTask };
