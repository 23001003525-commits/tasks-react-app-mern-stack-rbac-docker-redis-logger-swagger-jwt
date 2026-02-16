import swaggerJSDoc from 'swagger-jsdoc';
import adminPaths from '../docs/paths/admin.paths.js';
import userPaths from '../docs/paths/user.paths.js';
import taskPaths from '../docs/paths/task.path.js';

import schemas from '../docs/components/schema.js';
import commonErrorResponses from '../docs/components/responses.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'ENTERPRISE-gradeD RBAC Task Management API'
    },
    servers: [{ url: '/api/v1' }],
    tags: [
      { name: 'Admin', description: 'Administrative management endpoints (RBAC protected)' },
      { name: 'User', description: 'User authentication & profile' },
      { name: 'Tasks', description: 'Task management endpoints' }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt'
        }
      },
      schemas
    },
    paths: {
      ...adminPaths(commonErrorResponses),
      ...userPaths(commonErrorResponses),
      ...taskPaths(commonErrorResponses)
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
