import db from '../models/index.js';
const { Redacao, User, Turma, UserTurmas, Proposta } = db;

export const getAllRedacoes = async (req, res) => {
  try {
    const userRole = req.userData.role;
    const userId = req.userData.id;
    let whereRedacao = {}; let whereTurma = {}; 
    if (userRole === 'aluno') whereRedacao = { userId };
    else if (userRole === 'professor') whereTurma = { professorId: userId };

    const redacoes = await Redacao.findAll({
      where: whereRedacao,
      include: [
        { model: User, attributes: ['nome', 'email', 'avatar'] }, 
        { model: Turma, as: 'Turma', attributes: ['nome', 'professorId'], where: whereTurma },
        { model: Proposta, as: 'Proposta', attributes: ['id', 'titulo', 'prazo'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(redacoes);
  } catch (error) { 
      console.error("❌ Erro em getAllRedacoes:", error);
      res.status(500).json({ message: 'Erro ao buscar redações.' }); 
  }
};

export const getRedacaoById = async (req, res) => {
  try {
    const { id } = req.params;
    const redacao = await Redacao.findByPk(id, { 
        include: [
            { model: User, attributes: ['nome', 'avatar'] }, 
            { model: Turma, as: 'Turma', attributes: ['nome', 'professorId'] },
            { model: Proposta, as: 'Proposta', attributes: ['id', 'titulo', 'textoMotivador', 'prazo'] }
        ] 
    });
    if (!redacao) return res.status(404).json({ message: 'Redação não encontrada' });
    res.status(200).json(redacao);
  } catch (error) { 
      console.error("❌ Erro em getRedacaoById:", error);
      res.status(500).json({ message: 'Erro ao buscar detalhes.' }); 
  }
};

export const createRedacao = async (req, res) => {
  try {
    const userId = req.userData.id;
    const { turmaId, propostaId } = req.body;
    
    if (!req.file) return res.status(400).json({ message: 'Imagem obrigatória. O ficheiro não chegou ao servidor.' });

    // AQUI ESTÁ A CORREÇÃO: Pega o link da nuvem direto do Cloudinary
    const imagemUrl = req.file.path; 

    const novaRedacao = await Redacao.create({
      userId, turmaId, propostaId, imagemUrl, status: 'Enviada'
    });
    res.status(201).json(novaRedacao);
  } catch (error) { 
      console.error("❌ Erro em createRedacao:", error.message);
      res.status(500).json({ message: 'Erro ao enviar a redação.' }); 
  }
};

export const updateRedacaoImage = async (req, res) => {
    try {
        const { id } = req.params;
        const redacao = await Redacao.findByPk(id);
        if (!redacao) return res.status(404).json({ message: 'Não encontrada.' });

        const podeEditar = redacao.status === 'Enviada' || redacao.status === 'Reenvio Autorizado';
        if (!podeEditar) return res.status(400).json({ message: 'Edição não permitida para este status.' });

        if (!req.file) return res.status(400).json({ message: 'Nenhuma nova imagem foi enviada.' });

        // AQUI ESTÁ A CORREÇÃO: Atualiza a URL com o link novo do Cloudinary
        redacao.imagemUrl = req.file.path; 
        redacao.status = 'Enviada';
        redacao.editedAt = new Date();

        redacao.notaC1 = null;
        redacao.notaC2 = null;
        redacao.notaC3 = null;
        redacao.notaC4 = null;
        redacao.notaC5 = null;
        redacao.notaTotal = null;
        redacao.itensAnulatorios = [];
        redacao.descricoes = [];

        await redacao.save();

        res.status(200).json({ message: 'Redação atualizada e correções resetadas!', redacao });
    } catch (error) { 
        console.error("❌ Erro em updateRedacaoImage:", error.message);
        res.status(500).json({ message: 'Erro ao atualizar a imagem.' }); 
    }
};

export const deleteRedacao = async (req, res) => {
    try {
        const { id } = req.params;
        const redacao = await Redacao.findByPk(id);
        if (redacao.status === 'Corrigida') return res.status(400).json({ message: 'Não pode apagar corrigida.' });
        await redacao.destroy();
        res.status(200).json({ message: 'Apagada.' });
    } catch (error) { 
        console.error("❌ Erro em deleteRedacao:", error);
        res.status(500).json({ message: 'Erro ao apagar.' }); 
    }
};

export const corrigirRedacao = async (req, res) => {
  try {
    const { id } = req.params;
    
    let notasParsed = {};
    let itensAnulatoriosParsed = [];
    let descricoesParsed = [];
    
    try {
        if(req.body.notas) notasParsed = JSON.parse(req.body.notas);
        if(req.body.itensAnulatorios) itensAnulatoriosParsed = JSON.parse(req.body.itensAnulatorios);
        if(req.body.descricoes) descricoesParsed = JSON.parse(req.body.descricoes);
    } catch(e) {
        console.error("Erro ao fazer parse dos dados da correção", e);
    }

    const total = req.body.total;
    const status = req.body.status;

    const redacao = await Redacao.findByPk(id, { include: [{ model: Turma, as: 'Turma' }] });
    if (!redacao) return res.status(404).json({ message: 'Não encontrada.' });
    if (redacao.Turma.professorId !== req.userData.id) return res.status(403).json({ message: 'Sem permissão.' });

    if (notasParsed && Object.keys(notasParsed).length > 0) {
        redacao.notaC1 = notasParsed.c1; redacao.notaC2 = notasParsed.c2; redacao.notaC3 = notasParsed.c3;
        redacao.notaC4 = notasParsed.c4; redacao.notaC5 = notasParsed.c5;
    }
    
    redacao.notaTotal = total;
    redacao.itensAnulatorios = itensAnulatoriosParsed; 
    redacao.descricoes = descricoesParsed;             
    redacao.status = status || 'Corrigida';
    
    if (req.file) {
        // AQUI ESTÁ A CORREÇÃO: Caso o professor edite a imagem, salva a versão do Cloudinary
        redacao.imagemUrl = req.file.path;
    }

    await redacao.save();
    res.status(200).json({ message: 'Correção salva!', redacao });
  } catch (error) { 
      console.error("❌ Erro em corrigirRedacao:", error);
      res.status(500).json({ message: 'Erro ao salvar.' }); 
  }
};

export const solicitarReenvio = async (req, res) => {
    try {
        const { id } = req.params;
        const redacao = await Redacao.findByPk(id);
        redacao.status = 'Solicitado Reenvio';
        await redacao.save();
        res.status(200).json({ message: 'Solicitação enviada!' });
    } catch (error) { 
        console.error("❌ Erro em solicitarReenvio:", error);
        res.status(500).json({ message: 'Erro ao solicitar.' }); 
    }
};

export const autorizarReenvio = async (req, res) => {
    try {
        const { id } = req.params;
        const redacao = await Redacao.findByPk(id);
        redacao.status = 'Reenvio Autorizado';
        await redacao.save();
        res.status(200).json({ message: 'Reenvio autorizado!' });
    } catch (error) { 
        console.error("❌ Erro em autorizarReenvio:", error);
        res.status(500).json({ message: 'Erro ao autorizar.' }); 
    }
};