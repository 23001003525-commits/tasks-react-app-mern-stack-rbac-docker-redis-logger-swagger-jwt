/*
const schemas = {
  SuccessResponse: { ... },
  ErrorResponse: { ... },
  User: { ... },
  UserAuthResponse: { ... },
  Task: { ... },
  AuditLog: { ... },
  PaginatedUsers: { ... },
  PaginatedTasks: { ... },
  SystemStats: { ... }
};
*/


const schemas = {
  SuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' }
    }
  },

  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'USER_NOT_FOUND' },
          message: { type: 'string', example: 'User not found' },
          details: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  },

  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '65f8a9c1d2f3a4b5c6d7e8f9' },
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', example: 'john@example.com' },
      role: {
        type: 'string',
        enum: ['user', 'admin', 'superadmin'],
        example: 'admin'
      },
      isSuspended: { type: 'boolean', example: false },
      isActive: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },

  UserAuthResponse: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      role: {
        type: 'string',
        enum: ['user', 'admin', 'superadmin']
      }
    }
  },

  Task: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      title: { type: 'string', example: 'Complete project documentation' },
      completed: { type: 'boolean', example: false },
      user: { $ref: '#/components/schemas/User' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },

  AuditLog: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      action: { type: 'string', example: 'DELETE_USER' },
      performedBy: { type: 'string' },
      targetUser: { type: 'string' },
      targetTask: { type: 'string' },
      ip: { type: 'string', example: '192.168.1.1' },

      performedBySnapshot: {
        type: 'object',
        properties: {
          userEmail: { type: 'string' },
          userName: { type: 'string' }
        }
      },

      targetUserSnapshot: {
        type: 'object',
        properties: {
          targetUserEmail: { type: 'string' },
          targetUserName: { type: 'string' }
        }
      },

      targetTaskSnapshot: {
        type: 'object',
        properties: {
          targetUserEmail: { type: 'string' },
          targetUserName: { type: 'string' },
          targetTaskTitle: { type: 'string' }
        }
      },

      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },

  PaginatedUsers: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: { $ref: '#/components/schemas/User' }
      },
      page: { type: 'integer', example: 1 },
      pages: { type: 'integer', example: 3 },
      total: { type: 'integer', example: 25 }
    }
  },

  PaginatedTasks: {
    type: 'object',
    properties: {
      tasks: {
        type: 'array',
        items: { $ref: '#/components/schemas/Task' }
      },
      page: { type: 'integer' },
      pages: { type: 'integer' },
      total: { type: 'integer' }
    }
  },

  SystemStats: {
    type: 'object',
    properties: {
      totalUsers: { type: 'integer', example: 150 },
      totalTasks: { type: 'integer', example: 340 },
      admins: { type: 'integer', example: 5 },
      suspendedUsers: { type: 'integer', example: 2 }
    }
  },
  PaginatedAuditLogs: {
    type: 'object',
    properties: {
      tasks: {
        type: 'array',
        items: { $ref: '#/components/schemas/AuditLog' }
      },
      page: { type: 'integer' },
      pages: { type: 'integer' },
      total: { type: 'integer' }
    }
  },
};

export default schemas;
