const tasksPaths = (commonErrors) => ({

  /* ======================================================
     USER TASK MANAGEMENT
  ====================================================== */

  '/tasks': {
    post: {
      tags: ['Tasks'],
      summary: 'Create a new task',
      description: 'Create a new task for the logged-in user.',
      operationId: 'createTask',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title'],
              properties: {
                title: {
                  type: 'string',
                  example: 'Complete API documentation'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Task created successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/Task' }
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

    get: {
      tags: ['Tasks'],
      summary: 'Get all tasks for logged-in user',
      description: 'Retrieve all tasks belonging to the authenticated user.',
      operationId: 'getTasks',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Tasks retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Task' }
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
  },

  '/tasks/{id}': {

    put: {
      tags: ['Tasks'],
      summary: 'Update a task',
      description: 'Update title or completion status of a task owned by the logged-in user.',
      operationId: 'updateTask',
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
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  example: 'Updated task title'
                },
                completed: {
                  type: 'boolean',
                  example: true
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Task updated successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/Task' }
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
      tags: ['Tasks'],
      summary: 'Delete a task',
      description: 'Delete a task owned by the logged-in user.',
      operationId: 'deleteTask',
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
  }

});

export default tasksPaths;
