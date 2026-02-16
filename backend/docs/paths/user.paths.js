const userPaths = (commonErrors) => ({

  /* ======================================================
     AUTHENTICATION
  ====================================================== */

  '/users/auth': {
    post: {
      tags: ['User'],
      summary: 'Authenticate user',
      description: 'Login user and set JWT cookie.',
      operationId: 'authUser',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  example: 'john@example.com'
                },
                password: {
                  type: 'string',
                  example: 'password123'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Authentication successful',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/UserAuthResponse' }   //to-do completed :does not provide full user schema....but refactor it later
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

  '/users': {
    post: {
      tags: ['User'],
      summary: 'Register new user',
      description: 'Create a new user account and set JWT cookie.',
      operationId: 'registerUser',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: {
                  type: 'string',
                  example: 'John Doe'
                },
                email: {
                  type: 'string',
                  example: 'john@example.com'
                },
                password: {
                  type: 'string',
                  example: '6least'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/UserAuthResponse' }
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

  '/users/logout': {
    post: {
      tags: ['User'],
      summary: 'Logout user',
      description: 'Clear authentication cookie.',
      operationId: 'logoutUser',
      responses: {
        200: {
          description: 'Logout successful',
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
     PROFILE MANAGEMENT
  ====================================================== */

  '/users/profile': {
    get: {
      tags: ['User'],
      summary: 'Get user profile',
      description: 'Retrieve currently authenticated user profile.',
      operationId: 'getUserProfile',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/UserAuthResponse' }
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

    put: {
      tags: ['User'],
      summary: 'Update user profile',
      description: 'Update name, email, or password of authenticated user.',
      operationId: 'updateUserProfile',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'John Updated'
                },
                email: {
                  type: 'string',
                  example: 'john.updated@example.com'
                },
                password: {
                  type: 'string',
                  example: 'newpassword123'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'User profile updated successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    properties: {
                      data: { $ref: '#/components/schemas/UserAuthResponse' }
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

export default userPaths;
