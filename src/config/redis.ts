import { Redis } from "ioredis";
import Labels from "../utils/labels";

const redisLog = Labels.createLabel("REDIS");

const redisConnection = new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  redisLog.info("Redis connected");
});

redisConnection.on("error", (err) => {
  redisLog.error("Redis connection error", { err });
});

export const checkRedisConnection = async():Promise<void>=>{
    const ping = await redisConnection.ping();
    if(ping === "PONG"){
        redisLog.info("Redis connection verified")
    }
    else{
        throw new Error("Redis connection failed")
    }
}

export default redisConnection;