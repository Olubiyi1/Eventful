import config from "../config/config";
import nodemailer from "nodemailer"
import Labels from "../utils/labels";

const mailerLog = Labels.createLabel("MAILER")

const emailTransporter = nodemailer.createTransport({
    host:config.host,
    port:config.email_port,
    auth:{
        user:config.user,
        pass:config.pass
    }
})

emailTransporter.verify((error) => {
  if (error) {
    mailerLog.error("Mailer connection failed", { error });
  } else {
    mailerLog.info("Mailer ready to send emails");
  }
});

export default emailTransporter;

