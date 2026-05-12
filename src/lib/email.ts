import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

export async function enviarCodigoEmail(email: string, codigo: string) {
  console.log("MANDANDO EMAIL PARA:", email);

  const info = await transporter.sendMail({
    from: `"LG TRAMBICAGENS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Código de verificação",

    html: `
      <div style="font-family: Arial">
        <h1>LG TRAMBICAGENS</h1>

        <p>Seu código:</p>

        <h2>${codigo}</h2>
      </div>
    `,
  });

  console.log("EMAIL ENVIADO:", info.messageId);
}
