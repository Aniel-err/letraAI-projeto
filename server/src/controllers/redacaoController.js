import db from '../models/index.js';
const { Redacao, User, Turma, UserTurmas } = db;

export const getAllRedacoes = async (req, res) => {
  try {
    const userRole = req.userData.role;
    const userId = req.userData.id;
    
    let whereRedacao = {};
    let whereTurma = {}; 

    if (userRole === 'aluno') {
      whereRedacao = { userId };
    } else if (userRole === 'professor') {
      whereTurma = { professorId: userId };
    }

    const redacoes = await Redacao.findAll({
      where: whereRedacao,
      include: [
        { model: User, attributes: ['nome', 'email', 'avatar'] }, 
        { 
            model: Turma, 
            as: 'Turma', 
            attributes: ['nome', 'tema', 'prazo', 'professorId'],
            where: whereTurma 
        } 
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(redacoes);
  } catch (error) { 
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar redações.' }); 
  }
};

export const getRedacaoById = async (req, res) => {
  try {
    const { id } = req.params;
    const redacao = await Redacao.findByPk(id, { 
        include: [
            { model: User, attributes: ['nome', 'avatar'] }, 
            { model: Turma, as: 'Turma', attributes: ['nome', 'tema', 'prazo', 'professorId'] }
        ] 
    });
    
    if (!redacao) return res.status(404).json({ message: 'Redação não encontrada' });
    
    if (req.userData.role === 'aluno' && redacao.userId !== req.userData.id) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    if (req.userData.role === 'professor' && redacao.Turma.professorId !== req.userData.id) {
        return res.status(403).json({ message: 'Essa redação não pertence a suas turmas.' });
    }
    
    res.status(200).json(redacao);
  } catch (error) { res.status(500).json({ message: 'Erro ao buscar detalhes.' }); }
};

export const createRedacao = async (req, res) => {
  try {
    const userId = req.userData.id;
    const { turmaId } = req.body;

    if (!turmaId) return res.status(400).json({ message: 'Selecione a turma.' });
    
    const turma = await Turma.findByPk(turmaId);
    if (!turma) return res.status(404).json({ message: 'Turma não encontrada.' });

    if (turma.prazo) {
        if (new Date() > new Date(turma.prazo)) {
            return res.status(400).json({ message: 'O prazo de envio para esta turma já encerrou.' });
        }
    }

    if (!req.file) return res.status(400).json({ message: 'Imagem obrigatória.' });

    const jaEnviou = await Redacao.findOne({ where: { userId, turmaId } });
    if (jaEnviou) return res.status(400).json({ message: 'Você já enviou para esta turma. Edite a existente.' });
    
    const matricula = await UserTurmas.findOne({ where: { userId, turmaId, status: 'aprovado' } });
    if (!matricula) return res.status(403).json({ message: 'Sem permissão na turma.' });

    const imagemUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const novaRedacao = await Redacao.create({
      userId,
      turmaId, 
      tema: turma.tema,
      imagemUrl,
      status: 'Enviada'
    });

    res.status(201).json(novaRedacao);
  } catch (error) { res.status(500).json({ message: 'Erro ao enviar.' }); }
};

export const updateRedacaoImage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userData.id;
        if (!req.file) return res.status(400).json({ message: 'Nova imagem obrigatória.' });

        const redacao = await Redacao.findByPk(id, { include: [{ model: Turma, as: 'Turma' }] });
        if (!redacao) return res.status(404).json({ message: 'Não encontrada.' });
        
        if (redacao.userId !== userId) return res.status(403).json({ message: 'Acesso negado.' });
        
        if (redacao.status === 'Corrigida') return res.status(400).json({ message: 'Não pode editar corrigida.' });

        if (redacao.Turma && redacao.Turma.prazo) {
            if (new Date() > new Date(redacao.Turma.prazo)) {
                return res.status(400).json({ message: 'Prazo encerrado. Não é possível editar.' });
            }
        }

        redacao.imagemUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        redacao.editedAt = new Date(); 
        await redacao.save();

        res.status(200).json({ message: 'Atualizada!', redacao });
    } catch (error) { res.status(500).json({ message: 'Erro ao editar.' }); }
};

export const deleteRedacao = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userData.id;
        const redacao = await Redacao.findByPk(id);
        
        if (!redacao) return res.status(404).json({ message: 'Não encontrada.' });
        if (redacao.userId !== userId) return res.status(403).json({ message: 'Não é sua.' });
        if (redacao.status === 'Corrigida') return res.status(400).json({ message: 'Não pode apagar corrigida.' });

        await redacao.destroy();
        res.status(200).json({ message: 'Apagada.' });
    } catch (error) { res.status(500).json({ message: 'Erro ao apagar.' }); }
};

export const corrigirRedacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { notas, total, itensAnulatorios, descricoes, status } = req.body;
    
    const redacao = await Redacao.findByPk(id, { include: [{ model: Turma, as: 'Turma' }] });
    
    if (!redacao) return res.status(404).json({ message: 'Não encontrada.' });

    if (redacao.Turma.professorId !== req.userData.id) {
        return res.status(403).json({ message: 'Você não tem permissão para corrigir redações desta turma.' });
    }

    if (notas) {
        redacao.notaC1 = notas.c1; redacao.notaC2 = notas.c2; redacao.notaC3 = notas.c3;
        redacao.notaC4 = notas.c4; redacao.notaC5 = notas.c5;
    }
    redacao.notaTotal = total;
    redacao.itensAnulatorios = itensAnulatorios; 
    redacao.descricoes = descricoes;             
    redacao.status = status || 'Corrigida';
    
    await redacao.save();
    res.status(200).json({ message: 'Correção salva!', redacao });
  } catch (error) { res.status(500).json({ message: 'Erro ao salvar.' }); }
};