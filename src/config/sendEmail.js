
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env para process.env
dotenv.config();

// Configuração do transporte de e-mail (use credenciais reais)
const transporterEmail = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465', // true para porta 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // senha de aplicativo ou token
  },
});

export default transporterEmail;