"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../generated/prisma/index.js");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new index_js_1.PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"]
});
exports.default = prisma;
//# sourceMappingURL=prisma.js.map