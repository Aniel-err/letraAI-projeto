import db from '../models/index.js';
const { Proposta, Turma } = db;

export const createProposta = async (req, res) => {
  try {
    if (req.userData.role !== 'professor') return res.status(403).json({ message: 'Apenas professores podem criar propostas.' });

    const { titulo, textoMotivador, prazo, turmaId } = req.body;

    if (!titulo || !turmaId) return res.status(400).json({ message: 'Título e ID da Turma são obrigatórios.' });

    const turma = await Turma.findByPk(turmaId);
    if (!turma) return res.status(404).json({ message: 'Turma não encontrada.' });
    if (turma.professorId !== req.userData.id) return res.status(403).json({ message: 'Sem permissão.' });

    const novaProposta = await Proposta.create({
      titulo,
      textoMotivador,
      prazo: prazo || null,
      turmaId
    });

    res.status(201).json({ message: 'Proposta criada com sucesso!', proposta: novaProposta });
  } catch (error) { res.status(500).json({ message: 'Erro ao criar proposta.' }); }
};

export const getPropostasByTurma = async (req, res) => {
  try {
    const { turmaId } = req.params;
    const propostas = await Proposta.findAll({ where: { turmaId }, order: [['createdAt', 'DESC']] });
    res.status(200).json(propostas);
  } catch (error) { res.status(500).json({ message: 'Erro ao buscar propostas.' }); }
};

export const getPropostaById = async (req, res) => {
  try {
    const { id } = req.params;
    const proposta = await Proposta.findByPk(id);
    if (!proposta) return res.status(404).json({ message: 'Proposta não encontrada.' });
    res.status(200).json(proposta);
  } catch (error) { res.status(500).json({ message: 'Erro ao buscar proposta.' }); }
};

export const updateProposta = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, textoMotivador, prazo } = req.body;
    
    const proposta = await Proposta.findByPk(id, { include: [{ model: Turma, as: 'Turma' }] });
    
    if (!proposta) return res.status(404).json({ message: 'Proposta não encontrada.' });
    if (req.userData.role !== 'professor' || proposta.Turma.professorId !== req.userData.id) {
      return res.status(403).json({ message: 'Sem permissão para editar.' });
    }

    proposta.titulo = titulo || proposta.titulo;
    proposta.textoMotivador = textoMotivador !== undefined ? textoMotivador : proposta.textoMotivador;
    proposta.prazo = prazo !== undefined ? (prazo || null) : proposta.prazo;
    
    await proposta.save();
    res.status(200).json({ message: 'Proposta atualizada!', proposta });
  } catch (error) { res.status(500).json({ message: 'Erro ao atualizar.' }); }
};

export const deleteProposta = async (req, res) => {
  try {
    const { id } = req.params;
    const proposta = await Proposta.findByPk(id, { include: [{ model: Turma, as: 'Turma' }] });
    
    if (!proposta) return res.status(404).json({ message: 'Proposta não encontrada.' });
    if (req.userData.role !== 'professor' || proposta.Turma.professorId !== req.userData.id) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    await proposta.destroy();
    res.status(200).json({ message: 'Proposta excluída.' });
  } catch (error) { res.status(500).json({ message: 'Erro ao excluir.' }); }
};