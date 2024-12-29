import User from "../models/User";

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
  

}

export default new UserController();