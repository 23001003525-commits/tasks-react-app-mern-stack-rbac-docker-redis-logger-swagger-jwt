import { getCache, setCache } from '../utils/cache.js';
import qs from 'qs';
import logger from '../config/logger.js';

export const cacheMiddleware = ({
  keyGenerator,
  ttl = 60,
}) => async (req, res, next) => {
  try {
    const key = keyGenerator(req);

    const cached = await getCache(key);
    if (cached) {
      logger.debug("CACHE HIT")
      return res.status(200).json(cached);
    }
    logger.debug("CACHE MISS")
    // Monkey patch res.json to capture response
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(key, body, ttl).catch(err =>
          logger.error('Cache set failed', err)
        );
      }

      return originalJson(body);
    };

    next();
  } catch (err) {
    next(); // fail-safe
  }
};



export const userTaskListCache = (version="v1") =>
  cacheMiddleware({
    ttl: 60,
    keyGenerator: (req) =>
      `users:${version}:tasks:${req.user._id.toString()}:${qs.stringify(req.query, { sort: (a,b)=>a.localeCompare(b) })}`
  });

export const adminListCache = (resource,version="v1") =>
  cacheMiddleware({
    ttl: 60,
    keyGenerator: (req) =>
      `admin:${version}:${resource}:${req.method}:${req.user.role}:${qs.stringify(req.query, { sort: (a,b)=>a.localeCompare(b) })}`
  });
