import db from '../models/index.js';

const { Notificacao, Redacao } = db;

export const getNotificacoes = async (req, res) => {
  try {
    const userId = req.userData.id;

    const notificacoes = await Notificacao.findAll({
      where: { userId },
      include: [
        {
          model: Redacao,
          attributes: ['id', 'status', 'propostaId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(notificacoes);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar notificações.' });
  }
};

export const marcarComoLida = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userData.id;

    const notificacao = await Notificacao.findByPk(id);
    if (!notificacao) {
      return res.status(404).json({ message: 'Notificação não encontrada.' });
    }

    if (notificacao.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    await Notificacao.update(
      { lida: true },
      { where: { id, userId } }
    );

    const notificacaoAtualizada = await Notificacao.findByPk(id);
    return res.status(200).json({ success: true, notificacao: notificacaoAtualizada });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao marcar notificação.' });
  }
};

export const marcarTodasComoLidas = async (req, res) => {
  try {
    const userId = req.userData.id;

    await Notificacao.update(
      { lida: true },
      { where: { userId } }
    );

    res.status(200).json({ message: 'Todas as notificações marcadas como lidas.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao marcar notificações.' });
  }
};

export const getContadorNaoLidas = async (req, res) => {
  try {
    const userId = req.userData.id;

    const count = await Notificacao.count({
      where: { userId, lida: false }
    });

    res.status(200).json({ naoLidas: count });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao contar notificações.' });
  }
};
