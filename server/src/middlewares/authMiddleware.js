import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  try {
    console.log('--- Auth Middleware ---');
    console.log('Headers recebidos:', req.headers.authorization);

    if (!req.headers.authorization) {
      throw new Error('Cabeçalho Authorization ausente');
    }

    const token = req.headers.authorization.split(' ')[1];
    
    if (!token) {
      throw new Error('Token não encontrado no cabeçalho');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SEU_SEGREDO_SUPER_SECRETO');
    req.userData = decoded;
    next();
    
  } catch (error) {
    console.error('Erro de Autenticação:', error.message); 
    return res.status(401).json({ message: 'Falha na autenticação' });
  }
};