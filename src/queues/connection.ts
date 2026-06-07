// this file is used ny bullMq for queue

import { ConnectionOptions } from "bullmq";

const redisUrl = process.env.REDIS_URL;

export const redisConnectionOptions: ConnectionOptions = redisUrl
  ? { url: redisUrl, maxRetriesPerRequest: null }
  : { host: "localhost", port: 6379, maxRetriesPerRequest: null };