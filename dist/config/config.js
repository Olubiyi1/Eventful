"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    port: Number(process.env.PORT),
    secret_key: process.env.SECRET_KEY,
    host: process.env.EMAIL_HOST,
    email_port: Number(process.env.EMAIL_PORT),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    paystack_secret: process.env.PAYSTACK_SECRET_KEY,
    paystack_public_key: process.env.PAYSTACK_PUBLIC_KEY,
    app_url: process.env.APP_URL
};
//# sourceMappingURL=config.js.map