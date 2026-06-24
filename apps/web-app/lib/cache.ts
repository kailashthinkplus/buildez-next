import Redis from "redis";
import { promisify } from "util";

// Create Redis client
const client = Redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

client.on("error", (err) => {
  console.log("Redis error:", err);
});

// Promisify Redis methods
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

export const cache = {
  async get(key: string) {
    const data = await getAsync(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, value: any, ttl: number = 3600) {  // default TTL is 1 hour
    await setAsync(key, JSON.stringify(value), "EX", ttl);
  },

  async del(key: string) {
    await client.del(key);
  },
};
