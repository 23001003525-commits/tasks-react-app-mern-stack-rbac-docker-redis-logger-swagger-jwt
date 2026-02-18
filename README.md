
<div align="center">

#  TaskKing - MERN Task Manager

</div>

A **full-stack Task Management Web Application** built with **MERN stack** (MongoDB, Express, React, Node.js) featuring **JWT authentication**, **protected dashboard**, and **complete CRUD functionality** for user-specific tasks.

## ✨ **Live Demo**
[https://tasks-react-app-mern-stack-rbac-doc.vercel.app/](https://devfront1023.pythonanywhere.com/task-app) 

(To use LiveDemo: Make sure to allow third party cookies, as frontend is hosted on Vercel while backend is hosted on render,
Backend sets cookie for frontend(different site, so 3rd party cookies needs to be enabled for jwt cookies to work).</br>
Note#1: For accessing Admin Dashboard, Use following account:</br>
admin@email.com</br>
adminpassword</br>
Note#2: All user tasks are visible to this admin account, so this live version is to be used with that note in mind.

## ✨ Features

### **Authentication & Security**
- User registration & login with JWT tokens
- **RBAC (Role-Based Access Control)** - User/Admin/SuperAdmin roles
- Protected routes with `authMiddleware.js`
- Password hashing (bcrypt)
- JWT tokens in secure HTTP-only cookies
- Centralized error handling (`errorMiddleware.js`, `apiError.js`)

### **User Dashboard**
- View/update user profile
- Persistent login (Redux + localStorage)
- Secure logout (cookie invalidation)

### **Admin Dashboard**
- Complete **user management** (CRUD operations) (Paginated)
- **Task oversight** across all users (Read & Delete) (Paginated)
- **Audit log monitoring** with pagination
- Role assignment and user deletion/suspension
- Admin-only protected routes (`AdminRoute.jsx`)

### **Task Management (Full CRUD)**
- Private tasks scoped to individual users
- Create, read, update, delete tasks
- **User data isolation** by ownership (Admins can see everything...) 
- Responsive task list views (`TaskList.jsx`)

### **Modern Frontend**
- React 18 + Vite (fast builds)
- Redux Toolkit + RTK Query (caching)
- React Bootstrap (responsive)
- Component-based architecture
- Toast notifications

### **Production Backend**
- **RESTful API** with Swagger documentation
- **MongoDB + Mongoose** ODM
- **Redis caching** (`cacheMiddleware.js`, `cache.js`)
- **Event-driven caching** (`cacheEvents.js`, `cacheListeners.js`)
- Clean **MVC architecture** (controllers, models, routes)

### **DevOps & Deployment**
- **Docker multi-container** setup (`docker-compose.yml`)
- Production-ready **Dockerfile**
- **Environment-based config** (`.env`, `env.js`)
- **Structured logging** (`logger.js`)
- Vercel deployment config (`vercel.json`)

### **API Documentation**
- **Interactive Swagger UI** (`/api-docs`) (Admin accessible only)
- OpenAPI specs (`docs/paths/*.js`)
- Comprehensive request/response examples

### **Developer Experience**
- **Seeder scripts** (`seedAdmin.js`, `unseedAdmin.js`) (For ROOT SuperAdmin Account)
- Pre-configured **ESLint** (`.eslintrc.cjs`)
- Modular route structure (`routes/v1/*.js`)
- Utility functions (`generateToken.js`, `apiError.js`, `cache.js`)

## Tech Stack

| Frontend            | Backend        | DevOps & Infrastructure |
| ------------------- | -------------- | ----------------------- |
| React 18            | Node.js        | Docker                  |
| Vite                | Express        | Docker Compose          |
| Redux Toolkit       | MongoDB        | Redis                   |
| RTK Query           | Mongoose       | Vercel                  |
| React Router        | JWT            | ESLint                  |
| React Bootstrap     | bcrypt         | Swagger OpenAPI         |
| React Toastify      | Winston+Morgon | Dockerfile              |


## Project Structure

```
task-management-app/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── redis.js
│   │   ├── logger.js
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── docs/
│   │   ├── components/
│   │   │   ├── schema.js
│   │   │   └── responses.js
│   │   └── paths/
│   │       ├── admin.paths.js
│   │       ├── user.paths.js
│   │       └── task.path.js
│   ├── events/
│   │   ├── cacheEvents.js
│   │   └── cacheListeners.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── cacheMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── auditLogModel.js
│   │   ├── taskModel.js
│   │   └── userModel.js
│   ├── routes/
│   │   └── v1/
│   │       ├── adminRoutes.js
│   │       ├── index.js
│   │       ├── taskRoutes.js
│   │       └── userRoutes.js
│   ├── seeder/
│   │   ├── seedAdmin.js
│   │   └── unseedAdmin.js
│   ├── utils/
│   │   ├── apiError.js
│   │   ├── cache.js
│   │   └── generateToken.js
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── AuditLogsManagement.jsx
│   │   │   ├── FormContainer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TasksManagement.jsx
│   │   │   └── UsersManagement.jsx
│   │   ├── screens/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── HomeOrTasks.jsx
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── ProfileScreen.jsx
│   │   │   ├── RegisterScreen.jsx
│   │   │   └── UnauthorizedScreen.jsx
│   │   ├── slices/
│   │   │   ├── adminApiSlice.js
│   │   │   ├── apiSlice.js
│   │   │   ├── authSlice.js
│   │   │   ├── authThunks.js
│   │   │   ├── tasksApiSlice.js
│   │   │   └── usersApiSlice.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── store.js
│   ├── .eslintrc.cjs
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
├── .dockerignore
├── .env
├── docker-compose.yml
├── Dockerfile
├── package-lock.json
└── package.json
```

##  API Endpoints

| Method          | Endpoint                     | Description                | Access Level |
| --------------- | ---------------------------- | -------------------------- | ------------ |
| Authentication  |                              |                            |              |
| POST            | /api/v1/auth/register        | User registration          | Public       |
| POST            | /api/v1/auth/login           | User login                 | Public       |
| POST            | /api/v1/auth/logout          | User logout                | Protected    |
| GET             | /api/v1/auth/profile         | Get user profile           | Protected    |
| User Endpoints  |                              |                            |              |
| GET             | /api/v1/users/profile        | Get current user details   | Protected    |
| PUT             | /api/v1/users/profile        | Update user profile        | Protected    |
| GET             | /api/v1/tasks                | Get user's tasks           | Protected    |
| POST            | /api/v1/tasks                | Create new task            | Protected    |
| GET             | /api/v1/tasks/:id            | Get single task            | Protected    |
| PUT             | /api/v1/tasks/:id            | Update task                | Protected    |
| DELETE          | /api/v1/tasks/:id            | Delete task                | Protected    |
| Admin Endpoints |                              |                            |              |
| GET             | /api/v1/admin/users          | Get all users (paginated)  | Admin        |
| GET             | /api/v1/admin/users/:id      | Get specific user          | Admin        |
| PUT             | /api/v1/admin/users/:id      | Update user (role change)  | Admin        |
| DELETE          | /api/v1/admin/users/:id      | Delete user                | Admin        |
| GET             | /api/v1/admin/tasks          | Get all tasks (admin view) | Admin        |
| DELETE          | /api/v1/admin/tasks/:id      | Admin delete any task      | Admin        |
| GET             | /api/v1/admin/audit-logs     | Get audit logs (paginated) | Admin        |
| GET             | /api/v1/admin/audit-logs/:id | Get specific audit log     | Admin        |
| Swagger         |                              |                            |              |
| GET             | /api-docs                    | Swagger UI                 | Admin        |



## Quick Start
Installation Video + Project Demonstration: https://devfront1023.pythonanywhere.com/task-app-installation

### 1. Clone & Backend Setup
```bash
git clone <your-repo-url>
cd <project-folder>

# Backend
npm install
# Create file → .env
docker compose up --build
```


**`.env` example:**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://your_db_user:yourpasswordaa@cluster0.343qweawrsef.mongodb.net/?appName=Cluster0
JWT_SECRET=abc123
ADMIN_EMAIL=yoursuperadminemail@email.com
ADMIN_PASSWORD=yoursuperadminpassword
REDIS_URL='redis://redis:6379'
PROD_TYPE=docker
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Production Ready

✅ **Deployed**: Vercel (frontend) + Render (backend) + Livecell.io (Redis)  
✅ **Secure**: HTTP-only cookies + HTTPS  
✅ **Scalable**: MVC structure, RTK Query caching, Redis-Caching
✅ **Extendable**:  Every feature is loosely coupled

**Future upgrades**: rate-limiting, more granular redis-caching, task search, categories

## Status

✅ **Complete & Live Version Available**  
⭐ **Star this repo** if you find it useful!


<div align="center">
  <sub>Made with MERN Stack</sub>
</div>
