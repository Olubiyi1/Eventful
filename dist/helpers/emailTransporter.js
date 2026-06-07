"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config/config"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const labels_1 = __importDefault(require("../utils/labels"));
const tls_1 = __importDefault(require("tls"));
const mailerLog = labels_1.default.createLabel("MAILER");
const emailTransporter = nodemailer_1.default.createTransport({
    host: config_1.default.host,
    port: 465,
    secure: true,
    auth: {
        user: config_1.default.user,
        pass: config_1.default.pass,
    },
    createConnection: (options, callback) => {
        const socket = tls_1.default.connect({
            host: options.host,
            port: options.port,
            family: 4,
        });
        callback(null, socket);
        return socket;
    },
});
emailTransporter.verify((error) => {
    if (error) {
        console.log(error);
        mailerLog.error("Mailer connection failed", { error });
    }
    else {
        mailerLog.info("Mailer ready to send emails");
    }
});
exports.default = emailTransporter;
//# sourceMappingURL=emailTransporter.js.map