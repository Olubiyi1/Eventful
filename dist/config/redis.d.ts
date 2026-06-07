import { Redis } from "ioredis";
declare const redisConnection: Redis;
export declare const checkRedisConnection: () => Promise<void>;
export default redisConnection;
