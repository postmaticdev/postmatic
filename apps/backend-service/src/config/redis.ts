import { RedisOptions } from "ioredis";
import IORedis from "ioredis";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "../constant/redis";

const redisQueue: RedisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

export const redisClient = new IORedis(redisQueue);
