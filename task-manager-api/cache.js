const NodeCache = require("node-cache");

// Practical 9: In-Memory Caching & Query Optimization
// stdTTL: 60 seconds (keys expire after 60s)
// checkperiod: 120 seconds (automatic cleanup of expired keys)
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

// Metrics counter for hit/miss tracking (Supplementary Problem)
let cacheMetrics = {
  hits: 0,
  misses: 0,
};

/**
 * Retrieve an item from the cache and track hit/miss
 * @param {string} key
 * @returns {{ data: any, hit: boolean }}
 */
const getCache = (key) => {
  const data = cache.get(key);
  if (data !== undefined) {
    cacheMetrics.hits++;
    return { data, hit: true };
  }
  cacheMetrics.misses++;
  return { data: null, hit: false };
};

/**
 * Store an item in the cache
 * @param {string} key
 * @param {any} val
 * @param {number} ttl
 * @returns {boolean}
 */
const setCache = (key, val, ttl = 60) => {
  return cache.set(key, val, ttl);
};

/**
 * Delete a specific key
 * @param {string} key
 * @returns {number}
 */
const delCache = (key) => {
  return cache.del(key);
};

/**
 * Invalidate all task lists and optionally single task cache on write operations (POST, PUT, DELETE)
 * @param {string|null} taskId
 */
const invalidateTaskCache = (taskId = null) => {
  // Invalidate general all_tasks
  cache.del("all_tasks");

  // Invalidate any user-specific or dynamic task list keys
  const allKeys = cache.keys();
  const taskKeys = allKeys.filter(
    (k) => k.startsWith("tasks_") || k.startsWith("task_")
  );
  taskKeys.forEach((k) => cache.del(k));

  if (taskId) {
    cache.del(`task_${taskId}`);
  }
};

/**
 * Get cache hit/miss statistics and active keys
 */
const getMetrics = () => {
  return {
    hits: cacheMetrics.hits,
    misses: cacheMetrics.misses,
    totalRequests: cacheMetrics.hits + cacheMetrics.misses,
    hitRatio:
      cacheMetrics.hits + cacheMetrics.misses > 0
        ? `${((cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) * 100).toFixed(1)}%`
        : "0%",
    activeKeys: cache.keys(),
    nodeCacheStats: cache.getStats(),
  };
};

/**
 * Reset cache and metrics
 */
const resetMetrics = () => {
  cacheMetrics = { hits: 0, misses: 0 };
  cache.flushAll();
};

module.exports = {
  cache,
  getCache,
  setCache,
  delCache,
  invalidateTaskCache,
  getMetrics,
  resetMetrics,
};
