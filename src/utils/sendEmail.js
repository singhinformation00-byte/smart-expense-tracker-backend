import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    tls: {
      rejectUnauthorized: false,
    },

    connectionTimeout: 10000,
  });

  await transporter.verify();

  await transporter.sendMail({
    from: `"Expenza AI" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
