import express from 'express';
import { protect, admin } from '../../middleware/authMiddleware.js';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  toggleSuspendUser,
  getAllTasks,
  deleteAnyTask,
  getSystemStats,
  getAuditLogs
} from '../../controllers/adminController.js';
import { adminListCache } from '../../middleware/cacheMiddleware.js';
import logger from '../../config/logger.js';

/*
Routes:

| Method | Endpoint                  | Description       |
| ------ | ------------------------- | ----------------- |
| GET    | /admin/users              | Paginated users   |
| GET    | /admin/users/{id}         | Get single user   |
| PUT    | /admin/users/{id}/role    | Update role       |
| PUT    | /admin/users/{id}/suspend | Toggle suspension |
| DELETE | /admin/users/{id}         | Delete user       |
| GET    | /admin/tasks              | Paginated tasks   |
| DELETE | /admin/tasks/{id}         | Delete task       |
| GET    | /admin/stats              | System stats      |
| GET    | /admin/logs               | Audit logs        |
*/




const router = express.Router();

/**
 * Apply middleware globally to all admin routes
 * This ensures every route below requires:
 * 1. Valid authentication ( Valid JWT via protect )
 * 2. Admin role ( role === 'admin' via admin)
 */
router.use(protect, admin);






/* ======================================================
   USER MANAGEMENT ROUTES
   Base: /api/admin/users
====================================================== */

// GET /api/admin/users
router.get('/users', adminListCache('users', 'v1'), getAllUsers);

// GET /api/admin/users/:id
router.get('/users/:id', getUserById);

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', updateUserRole);

// PUT /api/admin/users/:id/suspend
router.put('/users/:id/suspend', toggleSuspendUser);

// DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

/* ======================================================
   TASK MODERATION ROUTES
   Base: /api/admin/tasks
====================================================== */

// GET /api/admin/tasks
router.get('/tasks', adminListCache('tasks', 'v1') , getAllTasks);

// DELETE /api/admin/tasks/:id
router.delete('/tasks/:id', deleteAnyTask);

/* ======================================================
   SYSTEM MANAGEMENT ROUTES
====================================================== */

// GET /api/admin/stats
router.get('/stats', adminListCache('stats', 'v1'), getSystemStats);

// GET /api/admin/logs
router.get('/logs', adminListCache('logs', 'v1'), getAuditLogs);

export default router;
