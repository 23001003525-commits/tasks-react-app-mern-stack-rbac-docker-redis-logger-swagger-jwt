/*
const commonErrorResponses = {
  400: { ... },
  401: { ... },
  403: { ... },
  404: { ... },
  500: { ... }
};
*/


const commonErrorResponses = {
  400: {
    description: 'Bad Request',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  },
  401: {
    description: 'Unauthorized (Invalid or expired token)',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  },
  403: {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  },
  404: {
    description: 'Resource Not Found',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  },
  500: {
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  }
};

export default commonErrorResponses;
