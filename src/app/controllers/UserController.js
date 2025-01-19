import User from "../models/User";
import authConfig from '../../config/auth';
import transporterEmail from "../../config/sendEmail";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env para process.env
dotenv.config();

class UserController {

  async store(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validações básicas
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios: name, email, password.' });
      }

      // Verificar se o e-mail já está em uso
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: 'E-mail já está em uso!' });
      }

      // Criar usuário
      const user = await User.create({ name, email, password });

      // Retornar resposta com os dados do usuário criado
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar o usuário', details: error.message });
    }
  }


  async index(req, res) {
    try {
      // Buscar usuários no banco de dados, excluindo o campo `password_hash`
      const users = await User.findAll({
        attributes: { exclude: ['password_hash'] },
        order: [['createdAt', 'DESC']], // Ordenação dos resultados
      });

      // Retornar lista de usuários
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
    }
  }


  async update(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o usuário existe
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(400).json({ error: 'Usuário não existe!' });
      }

      // Atualizar o usuário
      await User.update(req.body, { where: { id } });

      // Buscar os dados atualizados do usuário, mas não a senha.
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] }
      });

      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar o usuário', details: error.message });
    }
  }


  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o usuário existe
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
      }

      // Excluir o usuário
      await user.destroy();

      return res.status(200).json({ message: 'Usuário excluído com sucesso!' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir usuário', details: error.message });
    }
  }

  // Solicitar recuperação de senha
  async forgotPassword(req, res) {
    try {

      const { email } = req.body;

      // Validação do e-mail
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "E-mail inválido." });
      }

      // Verificar se o e-mail existe no banco de dados
      const userEmail = await User.findOne({ where: { email } });
      if (!userEmail) {
        return res.status(400).json({ error: 'Usuário não encontrado no banco de dados' });
      }

      // Gerar token de recuperação
      const token = jwt.sign({ email }, authConfig.secret, { expiresIn: authConfig.expiresIn });

      // Criar link de redefinição
      const resetLink = `${process.env.RESET_PASSWORD_URL}?token=${token}`;
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "Recuperação de senha",
        text: `Clique no link para redefinir sua senha: ${resetLink}`,
      };

      // Enviar e-mail
      await transporterEmail.sendMail(mailOptions);

      return res.json({ message: "E-mail de recuperação enviado com sucesso." });

    } catch (err) {
      console.error("Erro ao processar solicitação de recuperação:", err);
      return res.status(500).json({ message: "Erro interno ao enviar e-mail de recuperação." });
    }
  }

  // Atualiza senha
  async resetPassword(req, res) {

    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      // Verifica se o token é válido
      const decoded = jwt.verify(token, authConfig.secret);

      // Busca o usuário pelo e-mail decodificado
      const user = await User.findOne({ where: { email: decoded.email } });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      // Valida a nova senha
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          message: "A nova senha deve ter pelo menos 6 caracteres.",
        });
      }

      // Atualiza e salva a senha
      const hashedPassword = bcrypt.hashSync(newPassword, 8);
      user.password_hash = hashedPassword;

      // Persistindo as mudanças no banco de dados
      await user.save();

      res.json({ message: "Senha redefinida com sucesso." });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Token inválido ou expirado." });
    }
  }
}

export default new UserController();