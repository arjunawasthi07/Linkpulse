const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 5) {
        console.warn('[Redis] Max retries reached. Operating in bypass/fallback mode.');
        return null;
      }
      return Math.min(times * 100, 2000);
    },
    enableOfflineQueue: false,
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('⚡ [Redis] Connected successfully to cache server');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    // Log as warning rather than crashing process
    console.warn(`⚠️ [Redis] Connection notice: ${err.message}`);
  });
} catch (error) {
  console.warn('⚠️ [Redis] Failed to initialize Redis client, falling back to direct DB mode:', error.message);
}

const safeRedis = {
  get: async (key) => {
    if (!isRedisConnected || !redisClient) return null;
    try {
      return await redisClient.get(key);
    } catch {
      return null;
    }
  },
  set: async (key, value, mode, duration) => {
    if (!isRedisConnected || !redisClient) return null;
    try {
      if (mode && duration) {
        return await redisClient.set(key, value, mode, duration);
      }
      return await redisClient.set(key, value);
    } catch {
      return null;
    }
  },
  del: async (key) => {
    if (!isRedisConnected || !redisClient) return null;
    try {
      return await redisClient.del(key);
    } catch {
      return null;
    }
  },
  isConnected: () => isRedisConnected,
  raw: redisClient,
};

module.exports = safeRedis;
