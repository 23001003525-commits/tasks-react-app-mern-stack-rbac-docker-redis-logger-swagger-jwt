import { createClient } from 'redis';
import logger from './logger.js';

//NOTE - redis has to be run using docker compose up redis while inside project root during development> This is to be done if you do not want to run whole backed(backend + redis) using docker. So this way you can run npm run server + docker compose up redis to still work during development without doing docker compose up --build


const isProduction = process.env.NODE_ENV === 'production' && process.env.REDIS_LOCAL != true;

/**
 * ---------------------------------------
 * Build Redis Configuration Dynamically
 * ---------------------------------------
 */
const redisConfig = isProduction
  ? {
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        tls: true, 
        reconnectStrategy: (retries) => {
          const delay = Math.min(2 ** retries * 50, 5000);
          logger.warn(`Redis reconnect attempt #${retries}, retrying in ${delay}ms`);
          return delay;
        },
      },
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    }
  : {
      url: process.env.REDIS_URL_DEV, // ex: 'redis://localhost:6379' or 'redis://redis:6379' 
    };

/**
 * ---------------------------------------
 * Create Client
 * ---------------------------------------
 */
const redisClient = createClient(redisConfig);

/**
 * ---------------------------------------
 * Event Listeners
 * ---------------------------------------
 */
redisClient.on('error', (err) => {
  logger.error( err);
});

redisClient.on('connect', () => {
  logger.info('Redis connecting...');
});

redisClient.on('ready', () => {
  logger.info('Redis ready');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});

redisClient.on('end', () => {
  logger.error('Redis connection closed');
});

/**
 * ---------------------------------------
 * Connect Function
 * ---------------------------------------
 */
export const connectRedis = async () => {
  await redisClient.connect();

  if (isProduction) {
    logger.info(
      `Redis Connected (PROD) -> ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    );
  } else {
    logger.info(`Redis Connected (DEV) -> ${process.env.REDIS_URL_DEV}`);
  }
};



export const testRedisFully = async () => {
  const testKey = 'health:test';
  const testValue = 'working';

  try {
    // 1. Write
    await redisClient.set(testKey, testValue);

    // 2. Read
    const value = await redisClient.get(testKey);

    if (value !== testValue) {
      throw new Error('Redis read/write mismatch');
    }

    // 3. Cleanup
    await redisClient.del(testKey);

    const value2 = await redisClient.get(testKey);
    logger.info("Value of redis->" + value + ":" + value2);
    return true;
  } catch (error) {
    logger.error('Redis functional test failed:', error);
    return false;
  }
};

export default redisClient;
