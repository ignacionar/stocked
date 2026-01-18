import { Redis } from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("[Redis] connected");
});

redis.on("ready", () => {
  console.log("[Redis] ready");
});

redis.on("error", (err) => {
  console.error("[Redis] error", err);
});
