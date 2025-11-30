import db from '../models/index.js';
const { User } = db;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';



export const register = async (req, res) => {
  try {
    const { nome, email, password, role } = req.body;

    
    if (role === 'professor') {
      if (!email.endsWith('@ifma.edu.br')) {
        return res.status(400).json({ message: 'Erro: Professor deve usar email @ifma.edu.br' });
      }
    }

    if (role === 'aluno') {
      if (!email.endsWith('@acad.ifma.edu.br')) {
        return res.status(400).json({ message: 'Erro: Aluno deve usar email @acad.ifma.edu.br' });
      }
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Senha curta. Mínimo 8 caracteres.' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ message: 'Este email já tem cadastro.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await User.create({
      nome,
      email,
      password: hashedPassword,
      role,
      isVerified: false, 
      verificationToken
    });


    const link = `http://localhost:5173/verificar-email?token=${verificationToken}`;

    console.log("\n==================================================");
    console.log("⚡ NOVO CADASTRO REALIZADO!");
    console.log(`👤 Usuário: ${nome} (${role})`);
    console.log("📧 Email:", email);
    console.log("🔗 LINK DE ATIVAÇÃO (Clique aqui para validar):");
    console.log(link);
    console.log("==================================================\n");

    res.status(201).json({
      message: 'Cadastro aceito! O link de ativação foi enviado (verifique o terminal do servidor).'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar conta.' });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) return res.status(400).json({ message: 'Link inválido ou expirado.' });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nome: user.nome },
      process.env.JWT_SECRET || 'SEU_SEGREDO_SUPER_SECRETO',
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Email verificado com sucesso!',
      token: jwtToken,
      user: { id: user.id, email: user.email, role: user.role, nome: user.nome }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao verificar email.' });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Conta inativa. Use o link de verificação.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Senha incorreta.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nome: user.nome },
      process.env.JWT_SECRET || 'SEU_SEGREDO_SUPER_SECRETO',
      { expiresIn: '8h' }
    );

    res.status(200).json({ message: 'Login ok', token, user: { id: user.id, email: user.email, role: user.role, nome: user.nome } });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};


export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Email não encontrado.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Esta conta já está verificada. Faça login.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    const link = `http://localhost:5173/verificar-email?token=${verificationToken}`;

    console.log("\n==================================================");
    console.log("🔄 REENVIO SOLICITADO!");
    console.log("📧 Para:", email);
    console.log("🔗 NOVO LINK DE ATIVAÇÃO:");
    console.log(link);
    console.log("==================================================\n");

    res.status(200).json({ message: 'Novo link gerado! Verifique o terminal do servidor.' });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao reenviar.' });
  }
};