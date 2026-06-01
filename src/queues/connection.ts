import {Redis} from "ioredis";
import Labels from "../utils/labels";


const redisLog = Labels.createLabel("REDIS")

const redisConnection = new Redis(process.env.REDIS_URL as string,{
    maxRetriesPerRequest:null,
})

redisConnection.on("connect",()=>{
    redisLog.info("redis connected")
})
redisConnection.on("error",(err)=>{
    redisLog.error("Redis connection",{err})
})

// test redis connection
export const checkRedicConnection = async():Promise<void>=>{
    const ping = await redisConnection.ping();
    if(ping === "PONG"){
        redisLog.info("REdic connection verified")
    }
    else{
        throw new Error("Redis connection failed")
    }
}
export default redisConnection;