import redisClient from '../config/redis.js';

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
export const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    // Fail silently
  }
};

/**
 * Delete cache by key
 */
export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {}
};

/**
 * Delete by pattern (used for invalidation)
 */
export const deleteByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(keys);
  } catch (error) {}
};
