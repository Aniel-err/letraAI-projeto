import db from '../models/index.js';
const { User, Turma } = db;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { Resend } from 'resend'; 

const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://letraai.online';

export const register = async (req, res) => {
  try {
    const { nome, email, password, role } = req.body;

    if (role === 'professor' && !email.endsWith('@ifma.edu.br')) {
        return res.status(400).json({ message: 'Erro: Professor deve usar email @ifma.edu.br' });
    }
    if (role === 'aluno' && !email.endsWith('@acad.ifma.edu.br')) {
        return res.status(400).json({ message: 'Erro: Aluno deve usar email @acad.ifma.edu.br' });
    }

    if (password.length < 8) return res.status(400).json({ message: 'Senha curta. Mínimo 8 caracteres.' });

    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(409).json({ message: 'Este email já tem cadastro.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await User.create({
      nome, email, password: hashedPassword, role,
      isVerified: true, 
      verificationToken
    });

    const link = `${FRONTEND_URL}/verificar-email?token=${verificationToken}`;
    console.log(`\nLINK ATIVAÇÃO: ${link}\n`);

    try {
        await resend.emails.send({
            from: 'LetrAI <nao-responder@letraai.online>', 
            to: email,
            subject: 'Bem-vindo ao LetrAI! A sua conta foi criada',
            html: `
              <h2>Olá, ${nome}!</h2>
              <p>Obrigado por se cadastrar no LetrAI. A sua conta já se encontra ativa e pronta a utilizar!</p>
              <p>Guarde este link de verificação para os seus registos:</p>
              <a href="${link}" style="display:inline-block; padding:10px 20px; background-color:#0d6efd; color:#fff; text-decoration:none; border-radius:5px;">Aceder ao LetrAI</a>
            `
        });
    } catch (e) { 
        console.error("Erro na API da Resend:", e); 
    }

    return res.status(201).json({ message: 'Cadastro realizado com sucesso! Já pode fazer login.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar conta.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    if (!user.isVerified) return res.status(403).json({ message: 'Conta inativa. Verifique seu email.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Senha incorreta.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nome: user.nome, avatar: user.avatar },
      process.env.JWT_SECRET || 'SEU_SEGREDO',
      { expiresIn: '8h' }
    );

    return res.status(200).json({ 
        message: 'Login realizado com sucesso!', token, 
        user: { id: user.id, email: user.email, role: user.role, nome: user.nome, avatar: user.avatar } 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
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

        return res.status(200).json({ message: 'Email verificado com sucesso!' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao verificar email.' });
    }
};

export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if(!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
        if(user.isVerified) return res.status(400).json({ message: 'Conta já verificada.' });

        const newToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = newToken;
        await user.save();

        const link = `${FRONTEND_URL}/verificar-email?token=${newToken}`;
        
        try {
            await resend.emails.send({
                from: 'LetrAI <nao-responder@letraai.online>',
                to: email,
                subject: 'Reenvio - Ativação LetrAI',
                html: `<a href="${link}">Clique aqui para verificar o seu email</a>`
            });
        } catch (e) { console.error("Erro Resend Reenvio:", e); }

        return res.status(200).json({ message: 'Novo link enviado para o seu email.' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao reenviar.' });
    }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'Email não encontrado.' });

    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();
    now.setHours(now.getHours() + 1); 

    user.resetPasswordToken = token;
    user.resetPasswordExpires = now;
    await user.save();

    const link = `${FRONTEND_URL}/redefinir-senha?token=${token}`;

    try {
        await resend.emails.send({
            from: 'LetrAI <nao-responder@letraai.online>',
            to: email,
            subject: 'Redefinição de Senha - LetrAI',
            html: `<p>Solicitou a troca de senha. Clique abaixo para redefinir:</p><br><a href="${link}">MUDAR SENHA</a>`
        });
    } catch(e) { console.error("Erro Resend Recuperação:", e); }

    return res.status(200).json({ message: 'Link de recuperação enviado para o seu email.' });

  } catch (error) {
    return res.status(500).json({ message: 'Erro ao processar.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ 
        where: { resetPasswordToken: token, resetPasswordExpires: { [Op.gt]: new Date() } } 
    });

    if (!user) return res.status(400).json({ message: 'Link inválido ou expirado.' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Senha muito curta.' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userData.id; 
    const { nome, password } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    if (nome) user.nome = nome;
    if (password && password.trim() !== '') {
        user.password = await bcrypt.hash(password, 10);
    }
    
    if (req.file) { user.avatar = req.file.path; }

    await user.save();

    return res.status(200).json({ 
        message: 'Perfil atualizado!', 
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    console.error("Erro no updateProfile:", error);
    return res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.userData.id, {
            attributes: ['id', 'nome', 'email', 'role', 'avatar'],
            include: [{ 
                model: Turma, as: 'Turmas', attributes: ['id', 'nome'], through: { attributes: ['status'] }
            }] 
        });
        
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
        
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
};