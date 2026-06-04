export default {
  port: Number(process.env.PORT),
  secret_key: process.env.SECRET_KEY as string,
  host: process.env.EMAIL_HOST as string,
  email_port: Number(process.env.EMAIL_PORT),
  user: process.env.EMAIL_USER as string,
  pass: process.env.EMAIL_PASS as string,
  paystack_secret: process.env.PAYSTACK_SECRET_KEY as string,
  paystack_public_key:process.env.PAYSTACK_PUBLIC_KEY,
  app_url:process.env.APP_URL
};
