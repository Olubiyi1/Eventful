import nodemailer from "nodemailer";
declare const emailTransporter: nodemailer.Transporter<import("nodemailer/lib/smtp-pool").SentMessageInfo, import("nodemailer/lib/smtp-pool").Options>;
export default emailTransporter;
