import path from 'path';
import express from 'express';
import './config/env.js'; 
//import dotenv from 'dotenv';
//dotenv.config();
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';   //req.cookies will now be available and not undefined due to this middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
//import userRoutes from './routes/userRoutes.js';
//import taskRoutes from './routes/taskRoutes.js';
import cors from 'cors';
//import adminRoutes from './routes/adminRoutes.js';
import v1Routes from './routes/v1/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { protect, admin } from './middleware/authMiddleware.js';
import logger from './config/logger.js';
import morgan from 'morgan';
import { connectRedis,testRedisFully } from './config/redis.js';
import './events/cacheListeners.js';

const port = process.env.PORT || 5000; //Hosting platforms inject their own port, use those if found

await connectDB();
await connectRedis();


if (!await testRedisFully()) {
  logger.error('Redis not fully functional');
  process.exit(1);
}

const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || "localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

/*Logger*/
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );
}


/* ======================
   Swagger
====================== */

// Option A (NOT USED CAUSE IT IS PORTFOLIO PROJECT, OTHERS NEED TO SEE IT)
//if (process.env.NODE_ENV !== 'production') {
//  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//}

//Option B (Admin protected)
app.use('/api-docs', protect, admin, swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/* ======================
   API Routes
====================== */
app.use('/api/v1', v1Routes);
//app.use('/api/users', userRoutes);
//app.use('/api/tasks', taskRoutes);
//app.use('/api/admin', adminRoutes);




/* ======================
   Frontend (Production)
====================== */
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => logger.info(`Server started on port ${port}`) );
