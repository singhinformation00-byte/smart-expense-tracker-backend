import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  await resend.emails.send({
    from: "Expenza AI <noreply@expenza-ai.online>",
    to,
    subject,
    html,
  });
};

export default sendEmail;