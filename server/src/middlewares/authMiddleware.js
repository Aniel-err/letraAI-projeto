import jwt from 'jsonwebtoken';

export const checkAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Falha na autenticação: Token ausente.' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Token malformatado.' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    const secret = process.env.JWT_SECRET || 'SEU_SEGREDO';
    
    const decoded = jwt.verify(token, secret);
    
    req.userData = decoded;
    
    next();

  } catch (error) {
    console.error('Erro de Autenticação:', error.message);
    return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
  }
};