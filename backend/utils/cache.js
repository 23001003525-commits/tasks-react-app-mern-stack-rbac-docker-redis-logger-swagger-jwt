import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

const DEFAULT_TTL = 60; // 1 minute (adjust per endpoint)

/**
 * Get cached value
 */
export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null; // Fail safe
  }
};

/**
 * Set cached value
 */
export const setCache = async (key, value, ttl = DEFAULT_TTL, maxRetries = 10) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return; // Success
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries - 1) break; // Last try
      
      // Exponential backoff: 100ms * 2^attempt
      const delay = 100 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  //Log final failure (don't throw to keep fire-and-forget)
logger.warn(`Cache set failed after ${maxRetries} attempts: ${lastError?.message}`);
};

/**
 * Delete cache by key
 */
export const deleteCache = async (key, maxRetries = 10) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await redisClient.del(key);
      return; // Success
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries - 1) break; // Last try
      
      // Exponential backoff: 100ms * 2^attempt
      const delay = 100 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  //Log final failure (don't throw to keep fire-and-forget)
logger.warn(`Cache delete failed after ${maxRetries} attempts: ${lastError?.message}`);
};






/**
 * Retry operation utility function
 */
const retryOperation = async (operation, maxRetries = 3) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation(); // Execute the operation
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries - 1) {
        logger.error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
         break;
        }
      // Exponential backoff: 100ms * 2^attempt
      const delay = 100 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
throw lastError; 
};

/**
 * Delete by pattern using SCAN (KEYS disabled on Leapcell)
 */
export const deleteByPattern = async (pattern, maxRetries = 10) => {
  let totalDeleted = 0;
  
  const scanAndDelete = async () => {
    let cursor = '0';
    
    do {
      try {
        const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        
        if (keys.length) {
          // Per-batch retry for this DEL only
          const batchDeleted = await retryOperation(async () => {
            return await redisClient.del(keys);
          }, 3); // 3 tries per batch
            
          totalDeleted += batchDeleted;
          logger.debug(`Deleted ${batchDeleted} keys (total: ${totalDeleted})`);
        }
      } catch (batchError) {
        logger.warn(`Batch failed at cursor ${cursor}: ${batchError.message}`);
        // Continue to next batch regardless
      }
    } while (cursor !== '0');
  };
  
  // Full operation retry (rare connection issues)
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await scanAndDelete();
      logger.info(`✅ COMPLETED: Deleted ${totalDeleted} keys matching "${pattern}"`);
      return totalDeleted;
    } catch (error) {
      if (attempt === maxRetries - 1) break;
      const delay = 100 * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  logger.error(`❌ FAILED: Only deleted ${totalDeleted}`);
};

