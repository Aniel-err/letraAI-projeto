import db from '../models/index.js';

const { Redacao, User, Turma, Proposta } = db;

const uploadToImgBB = async (file) => {
    if (!file || !file.buffer) throw new Error("O ficheiro não chegou na memória (buffer).");

    if (!process.env.IMGBB_API_KEY) {
        throw new Error("A chave IMGBB_API_KEY não foi encontrada no Render.");
    }

    try {
        console.log("Preparando arquivo binário para o ImgBB...");

        const blob = new Blob([file.buffer], { type: file.mimetype });

        const form = new FormData();
        form.append('image', blob, file.originalname);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
            method: 'POST',
            body: form
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ O ImgBB recusou o arquivo:", data);
            throw new Error("O ImgBB rejeitou o formato ou tamanho da imagem.");
        }

        console.log("✅ Upload ImgBB Concluído com sucesso:", data.data.url);
        return data.data.url;

    } catch (error) {
        console.error("❌ Falha fatal ao contactar ImgBB:", error.message);
        throw new Error("Falha no upload para a nuvem.");
    }
};

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
        res.status(500).json({ message: 'Erro ao buscar detalhes.' });
    }
};

export const createRedacao = async (req, res) => {
    try {
        const userId = req.userData.id;
        const { turmaId, propostaId } = req.body;

        if (!req.file) return res.status(400).json({ message: 'Imagem obrigatória.' });

        const imagemUrl = await uploadToImgBB(req.file);

        const novaRedacao = await Redacao.create({
            userId, turmaId, propostaId, imagemUrl, status: 'Enviada'
        });
        res.status(201).json(novaRedacao);
    } catch (error) {
        console.error("Erro upload ImgBB:", error.message);
        res.status(500).json({ message: `Erro do Servidor: ${error.message}` });
    }
};

export const updateRedacaoImage = async (req, res) => {
    try {
        const { id } = req.params;
        const redacao = await Redacao.findByPk(id);
        if (!redacao) return res.status(404).json({ message: 'Não encontrada.' });

        if (!req.file) return res.status(400).json({ message: 'Nenhuma nova imagem foi enviada.' });

        const imagemUrl = await uploadToImgBB(req.file);

        redacao.imagemUrl = imagemUrl;
        redacao.status = 'Enviada';
        redacao.editedAt = new Date();

        redacao.notaC1 = null; redacao.notaC2 = null; redacao.notaC3 = null;
        redacao.notaC4 = null; redacao.notaC5 = null; redacao.notaTotal = null;
        redacao.itensAnulatorios = []; redacao.descricoes = [];

        await redacao.save();
        res.status(200).json({ message: 'Redação atualizada e correções resetadas!', redacao });
    } catch (error) {
        console.error("Erro reenviar ImgBB:", error.message);
        res.status(500).json({ message: `Erro do Servidor: ${error.message}` });
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
        res.status(500).json({ message: 'Erro ao apagar.' });
    }
};

export const corrigirRedacao = async (req, res) => {
    try {
        const { id } = req.params;
        let notasParsed = {}; let itensAnulatoriosParsed = []; let descricoesParsed = [];

        try {
            if (req.body.notas) notasParsed = JSON.parse(req.body.notas);
            if (req.body.itensAnulatorios) itensAnulatoriosParsed = JSON.parse(req.body.itensAnulatorios);
            if (req.body.descricoes) descricoesParsed = JSON.parse(req.body.descricoes);
        } catch (e) { console.error("Erro de parse", e); }

        const redacao = await Redacao.findByPk(id, { include: [{ model: Turma, as: 'Turma' }] });
        if (!redacao) return res.status(404).json({ message: 'Não encontrada.' });

        if (notasParsed && Object.keys(notasParsed).length > 0) {
            redacao.notaC1 = notasParsed.c1; redacao.notaC2 = notasParsed.c2; redacao.notaC3 = notasParsed.c3;
            redacao.notaC4 = notasParsed.c4; redacao.notaC5 = notasParsed.c5;
        }

        redacao.notaTotal = req.body.total;
        redacao.itensAnulatorios = itensAnulatoriosParsed;
        redacao.descricoes = descricoesParsed;
        redacao.status = req.body.status || 'Corrigida';

        if (req.file) {
            redacao.imagemUrl = await uploadToImgBB(req.file);
        }

        await redacao.save();
        res.status(200).json({ message: 'Correção salva!', redacao });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar.' });
    }
};

export const solicitarReenvio = async (req, res) => {
    const { id } = req.params;
    const redacao = await Redacao.findByPk(id);
    redacao.status = 'Solicitado Reenvio';
    await redacao.save();
    res.status(200).json({ message: 'Solicitação enviada!' });
};

export const autorizarReenvio = async (req, res) => {
    const { id } = req.params;
    const redacao = await Redacao.findByPk(id);
    redacao.status = 'Reenvio Autorizado';
    await redacao.save();
    res.status(200).json({ message: 'Reenvio autorizado!' });
};