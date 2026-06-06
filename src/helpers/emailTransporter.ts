import config from "../config/config";
import nodemailer from "nodemailer";
import Labels from "../utils/labels";
import tls from "tls";

const mailerLog = Labels.createLabel("MAILER");

const emailTransporter = nodemailer.createTransport({
  host: config.host,
  port: 465,
  secure: true,
  auth: {
    user: config.user,
    pass: config.pass,
  },
  createConnection: (options: any, callback: any) => {
    const socket = tls.connect({
      host: options.host,
      port: options.port,
      family: 4,
    } as any);
    callback(null, socket);
    return socket;
  },
} as any);

emailTransporter.verify((error) => {
  if (error) {
    console.log(error);
    mailerLog.error("Mailer connection failed", { error });
  } else {
    mailerLog.info("Mailer ready to send emails");
  }
});

export default emailTransporter;