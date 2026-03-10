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
    if (!req.file) return res.status(400).json({ message: 'Imagem da redação não recebida.' });

    const imagemUrl = req.file.path; 

    const novaRedacao = await Redacao.create({
      userId, turmaId, propostaId, imagemUrl, status: 'Enviada'
    });
    res.status(201).json(novaRedacao);
  } catch (error) { 
      console.error("❌ Erro em createRedacao:", error);
      res.status(500).json({ message: 'Erro ao salvar redação na nuvem.' }); 
  }
};

export const updateRedacaoImage = async (req, res) => {
    try {
        console.log("--- [DEBUG] INÍCIO DO PROCESSO DE UPLOAD ---");
        const { id } = req.params;
        console.log("ID recebido na URL:", id);

        // 1. Verifica se o arquivo chegou do Multer/Cloudinary
        if (!req.file) {
            console.log("❌ ERRO: req.file está undefined. Verifique se o frontend está enviando o campo como 'imagem'.");
            return res.status(400).json({ message: 'Arquivo não recebido pelo servidor.' });
        }
        console.log("Arquivo recebido pelo Multer:", req.file.originalname);
        console.log("URL gerada pelo Cloudinary (path):", req.file.path);

        // 2. Busca a redação no banco
        const redacao = await Redacao.findByPk(id);
        if (!redacao) {
            console.log(`❌ ERRO: Nenhuma redação encontrada com o ID ${id} no banco.`);
            return res.status(404).json({ message: `Redação ID ${id} não encontrada.` });
        }

        // 3. Atualização dos campos
        redacao.imagemUrl = req.file.path; // Usa o path da nuvem
        redacao.status = 'Enviada';
        redacao.editedAt = new Date();

        // Reset de notas para nova correção
        redacao.notaC1 = null; redacao.notaC2 = null; redacao.notaC3 = null;
        redacao.notaC4 = null; redacao.notaC5 = null; redacao.notaTotal = null;
        redacao.itensAnulatorios = []; redacao.descricoes = [];

        await redacao.save();
        console.log("✅ SUCESSO: Banco de dados atualizado com o link da nuvem!");

        res.status(200).json({ message: 'Redação enviada!', redacao });

    } catch (error) { 
        // Força o erro a aparecer como texto claro no log do Render
        console.log("--- [DEBUG] ERRO FATAL DETECTADO ---");
        console.log("Mensagem do Erro:", error.message);
        console.error("Stack do Erro:", error.stack);
        res.status(500).json({ message: error.message }); 
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
        redacao.imagemUrl = req.file.path ? req.file.path : `/uploads/${req.file.filename}`;
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