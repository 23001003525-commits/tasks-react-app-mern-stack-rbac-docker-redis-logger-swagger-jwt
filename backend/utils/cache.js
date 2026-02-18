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
 * Delete by pattern 
 */
export const deleteByPattern = async (pattern, maxRetries = 10) => {
let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(keys);
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
logger.warn(`Cache Pattern delete failed after ${maxRetries} attempts: ${lastError?.message}`);
};
