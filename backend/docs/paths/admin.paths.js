const adminPaths = (commonErrors) => ({

  /* ======================================================
     USER MANAGEMENT
  ====================================================== */

  '/admin/users': {
    get: {
      tags: ['Admin'],
      summary: 'Get paginated users',
      description: 'Retrieve a paginated list of users with optional filters.',
      operationId: 'getAdminUsers',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
//        { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, default: 10 } },
        { in: 'query', name: 'keyword', schema: { type: 'string' } },
        {
          in: 'query',
          name: 'role',
          schema: {
            type: 'string',
            enum: ['user', 'admin']
          }
        },
        {
          in: 'query',
          name: 'suspended',
          schema: { 
            type: 'string',
            enum: ["", 'true', 'false'],
            default: "", 
          } 
        }
      ],
      responses: {
        200: {
          description: 'Paginated users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/PaginatedUsers' }
                    }
                  }
                ]
              }
            }
          }
        },
        ...commonErrors
      }
    }
  },

  '/admin/users/{id}': {
    get: {
      tags: ['Admin'],
      summary: 'Get single user',
      operationId: 'getUserByIdForAdmin',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'User details retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                ]
              }
            }
          }
        },
        ...commonErrors
      }
    },

    delete: {
      tags: ['Admin'],
      summary: 'Delete user',
      operationId: 'deleteUserByIdForAdmin',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'User deleted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        ...commonErrors
      }
    }
  },

  '/admin/users/{id}/role': {
    put: {
      tags: ['Admin'],
      summary: 'Update user role',
      operationId: 'updateAdminUserRole',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['role'],
              properties: {
                role: {
                  type: 'string',
                  enum: ['user', 'admin', 'superadmin']
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'User role updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        ...commonErrors
      }
    }
  },

  '/admin/users/{id}/suspend': {
    put: {
      tags: ['Admin'],
      summary: 'Toggle user suspension status',
      operationId: 'toggleUserSuspendForAdmin',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'User suspension status updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        ...commonErrors
      }
    }
  },


  /* ======================================================
     TASK MODERATION
  ====================================================== */

  '/admin/tasks': {
    get: {
      tags: ['Admin'],
      summary: 'Get paginated tasks',
      description: 'Retrieve a paginated list of all tasks in the system.',
      operationId: 'getAllTasksForAdmin',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
//        { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, default: 10 } }, //limit not implemented yet, todo
//        { in: 'query', name: 'keyword', schema: { type: 'string' } }  //this also not implemented yet in admin controller, todo
      ],
      responses: {
        200: {
          description: 'Paginated tasks retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/PaginatedTasks' }
                    }
                  }
                ]
              }
            }
          }
        },
        ...commonErrors
      }
    }
  },

  '/admin/tasks/{id}': {
    delete: {
      tags: ['Admin'],
      summary: 'Delete task',
      operationId: 'deleteTaskByIdForAdmin',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'Task deleted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        ...commonErrors
      }
    }
  },


  /* ======================================================
     SYSTEM MANAGEMENT
  ====================================================== */

  '/admin/stats': {
    get: {
      tags: ['Admin'],
      summary: 'Get system statistics',
      operationId: 'getSystemStatsForAdmin',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'System statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/SystemStats' }
                    }
                  }
                ]
              }
            }
          }
        },
        ...commonErrors
      }
    }
  },

  '/admin/logs': {
    get: {
      tags: ['Admin'],
      summary: 'Get audit logs',
      operationId: 'getAuditLogsForAdmin',
      security: [{ cookieAuth: [] }],
      parameters: [   //to-do completed... implement these instead of returning logs with limit of 100 
        { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
//        { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, default: 20 } }
      ],
      responses: {
        200: {
          description: 'Audit logs retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/PaginatedAuditLogs' }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        ...commonErrors
      }
    }
  }

});

export default adminPaths;
