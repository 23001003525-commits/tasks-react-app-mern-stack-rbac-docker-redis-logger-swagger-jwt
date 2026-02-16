import express from 'express';

import adminRoutes from './adminRoutes.js';
import userRoutes from './userRoutes.js';
import taskRoutes from './taskRoutes.js';

const router = express.Router();

// Mount feature routes inside v1
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

export default router;
