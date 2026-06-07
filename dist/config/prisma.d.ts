import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
declare const prisma: PrismaClient<{
    adapter: PrismaPg;
    log: ("info" | "warn" | "error" | "query")[];
}, "info" | "warn" | "error" | "query", import("../../generated/prisma/runtime/client.js").DefaultArgs>;
export default prisma;
