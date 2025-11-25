const { Turma, User } = require('../models');

exports.createTurma = async (req, res) => {
  if (req.userData.role !== 'professor') {
    return res.status(403).json({ message: 'Acesso negado. Apenas professores podem criar turmas.' });
  }

  try {
    const { nome } = req.body;
    const professorId = req.userData.id;

    if (!nome) {
      return res.status(400).json({ message: 'O nome da turma é obrigatório.' });
    }

    const turmaExistente = await Turma.findOne({ where: { nome: nome } });
    if (turmaExistente) {
      return res.status(409).json({ message: 'Já existe uma turma com este nome no sistema.' });
    }
    // ----------------------------------------------------------------

    const novaTurma = await Turma.create({
      nome,
      professorId
    });

    res.status(201).json({ message: 'Turma criada com sucesso!', turma: novaTurma });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar turma.', error: error.message });
  }
};

exports.getMinhasTurmas = async (req, res) => {
  try {
    const userId = req.userData.id;
    const userRole = req.userData.role;
    let turmas = [];

    if (userRole === 'professor') {
      turmas = await Turma.findAll({
        include: [{
          model: User,
          as: 'Professor', 
          attributes: ['nome'] 
        }],
        order: [['nome', 'ASC']] 
      });
    } else {
      const aluno = await User.findByPk(userId, {
        include: [{ model: Turma }]
      });
      if (aluno && aluno.Turma) {
        turmas = [aluno.Turma];
      }
    }

    res.status(200).json(turmas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar turmas.', error: error.message });
  }
};

exports.addAlunoToTurma = async (req, res) => {
  if (req.userData.role !== 'professor') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  try {
    const { turmaId } = req.params;
    const { emailAluno } = req.body;

    const aluno = await User.findOne({ where: { email: emailAluno, role: 'aluno' } });
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    const turma = await Turma.findByPk(turmaId);
    if (!turma) {
      return res.status(404).json({ message: 'Turma não encontrada.' });
    }

    if (aluno.turmaId && aluno.turmaId !== turma.id) {
      return res.status(409).json({ message: 'Este aluno já está matriculado em outra turma.' });
    }

    if (aluno.turmaId === turma.id) {
       return res.status(409).json({ message: 'Aluno já está nesta turma.' });
    }

    aluno.turmaId = turma.id;
    await aluno.save();

    res.status(200).json({ message: `Aluno ${aluno.nome} adicionado à turma ${turma.nome}.` });

  } catch (error)
  {
    res.status(500).json({ message: 'Erro ao adicionar aluno.', error: error.message });
  }
};

exports.getTurmaById = async (req, res) => {
  if (req.userData.role !== 'professor') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  try {
    const { id } = req.params;

    const turma = await Turma.findOne({
      where: { id: id }, 
      include: [{
        model: User,
        attributes: ['id', 'nome', 'email'] 
      }]
    });

    if (!turma) {
      return res.status(404).json({ message: 'Turma não encontrada.' });
    }

    const response = turma.toJSON();
    response.Alunos = response.Users || [];
    delete response.Users;

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar detalhes da turma.', error: error.message });
  }
};

exports.removeAlunoFromTurma = async (req, res) => {
  if (req.userData.role !== 'professor') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  try {
    const { turmaId, alunoId } = req.params;

    const turma = await Turma.findByPk(turmaId);
    if (!turma) {
      return res.status(404).json({ message: 'Turma não encontrada.' });
    }

    const aluno = await User.findByPk(alunoId);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    aluno.turmaId = null;
    await aluno.save();

    res.status(200).json({ message: 'Aluno removido da turma com sucesso.' });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover aluno.', error: error.message });
  }
};