const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nome, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nome,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      userId: newUser.id
    });

  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Este email já está cadastrado.' });
    }
    res.status(500).json({ message: 'Erro ao registrar usuário.', error: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha inválida.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        nome: user.nome
      },
      'SEU_SEGREDO_SUPER_SECRETO',
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nome: user.nome
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao fazer login.', error: error.message });
  }
};