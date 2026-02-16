import { createClient } from 'redis';
import logger from './logger.js';


//NOTE - redis has to be run using docker compose up redis while inside project root during development> This is to be done if you do not want to run whole backed(backend + redis) using docker. So this way you can run npm run server + docker compose up redis to still work during development without doing docker compose up --build
const redisClient = createClient({
  url: process.env.NODE_ENV == 'development' ? 'redis://redis:6379' : process.env.REDIS_URL, // service name from docker-compose
  socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis reconnect attempts exhausted');
          return new Error('Redis reconnect failed');
        }
        return Math.min(retries * 100, 3000);
      },
    },
});

redisClient.on('error', (err) => {
  logger.error('Redis Error:', err);
});

export const connectRedis = async () => {
  await redisClient.connect();
  logger.info('Redis Connected');
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
    logger.info("Value of redis->" + value + ":" + value2 + " REDIS_URL: " + process.env.REDIS_URL)
    return true;
  } catch (error) {
    logger.error('Redis functional test failed:', error);
    return false;
  }
};

export default redisClient;
