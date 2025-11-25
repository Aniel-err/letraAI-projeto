const { Redacao, User, Turma } = require('../models');

exports.uploadRedacao = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo de imagem enviado.' });
    }
    const userId = req.userData.id;
    const { tema } = req.body;
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const novaRedacao = await Redacao.create({
      imagemUrl: imageUrl,
      status: 'Enviada',
      tema: tema || 'Tema não informado',
      userId: userId,
      notaC1: 0, notaC2: 0, notaC3: 0, notaC4: 0, notaC5: 0,
      notaTotal: 0,
      itensAnulatorios: [],
      descricoes: []
    });

    res.status(201).json({
      message: 'Redação enviada com sucesso!',
      redacao: novaRedacao
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao enviar redação.', error: error.message });
  }
};

exports.getRedacoes = async (req, res) => {
  try {
    const userRole = req.userData.role;
    const userId = req.userData.id;

    let queryOptions = {
      include: [
        {
          model: User,
          attributes: ['nome'],
          include: [{ model: Turma, attributes: ['nome'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    };

   
    if (userRole === 'aluno') {
      queryOptions.where = { userId: userId };
    }

    const redacoes = await Redacao.findAll(queryOptions);
    res.status(200).json(redacoes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar redações.', error: error.message });
  }
};

exports.getRedacaoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.userData.role;
    const userId = req.userData.id;

    const redacao = await Redacao.findOne({
      where: { id: id },
      include: [{ model: User, attributes: ['nome'] }]
    });

    if (!redacao) {
      return res.status(404).json({ message: 'Redação não encontrada.' });
    }

    if (userRole === 'aluno' && redacao.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Esta redação não é sua.' });
    }

    res.status(200).json(redacao);

  } catch (error) {
    console.error('Erro ao buscar redação:', error);
    res.status(500).json({ message: 'Erro ao buscar redação.', error: error.message });
  }
};

exports.corrigirRedacao = async (req, res) => {
  try {
    if (req.userData.role !== 'professor') {
      return res.status(403).json({ message: 'Acesso negado. Apenas professores podem corrigir.' });
    }

    const { id } = req.params;
    const { notas, total, itensAnulatorios, descricoes } = req.body;
    const redacao = await Redacao.findByPk(id);

    if (!redacao) {
      return res.status(404).json({ message: 'Redação não encontrada.' });
    }

    redacao.status = 'Corrigida';
    redacao.notaC1 = notas.c1;
    redacao.notaC2 = notas.c2;
    redacao.notaC3 = notas.c3;
    redacao.notaC4 = notas.c4;
    redacao.notaC5 = notas.c5;
    redacao.notaTotal = total;
    redacao.itensAnulatorios = itensAnulatorios;
    redacao.descricoes = descricoes;

    await redacao.save();

    res.status(200).json({ message: 'Correção salva com sucesso!', redacao });

  } catch (error) {
    console.error('Erro ao salvar correção:', error);
    res.status(500).json({ message: 'Erro ao salvar correção.', error: error.message });
  }
};