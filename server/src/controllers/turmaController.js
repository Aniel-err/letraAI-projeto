import db from '../models/index.js';
const { Turma, User, UserTurmas } = db; 

// --- CRIAR TURMA ---
export const createTurma = async (req, res) => {
  if (req.userData.role !== 'professor') return res.status(403).json({ message: 'Acesso negado.' });
  try {
    const { nome, tema, prazo } = req.body;

    // Validação de Data Futura
    if (prazo) {
        if (new Date(prazo) <= new Date()) {
            return res.status(400).json({ message: 'O prazo deve ser uma data no futuro.' });
        }
    }

    const novaTurma = await Turma.create({ 
        nome, 
        tema: tema || 'Tema Livre', 
        prazo: prazo || null, 
        professorId: req.userData.id 
    });
    res.status(201).json({ message: 'Turma criada!', turma: novaTurma });
  } catch (error) { res.status(500).json({ message: 'Erro ao criar turma.' }); }
};

// --- LISTAR ---
export const getMinhasTurmas = async (req, res) => {
  try {
    const userId = req.userData.id;
    const userRole = req.userData.role;
    let turmas = [];

    if (userRole === 'professor') {
      turmas = await Turma.findAll({ where: { professorId: userId }, order: [['createdAt', 'DESC']] });
    } else {
      turmas = await Turma.findAll({ 
          include: [{ model: User, as: 'Professor', attributes: ['nome'] }], 
          order: [['createdAt', 'DESC']] 
      });
      const vinculos = await UserTurmas.findAll({ where: { userId } });
      turmas = turmas.map(t => {
          const tJson = t.toJSON();
          const vinculo = vinculos.find(v => v.turmaId === t.id);
          tJson.meuStatus = vinculo ? vinculo.status : null;
          return tJson;
      });
    }
    res.status(200).json(turmas);
  } catch (error) { res.status(500).json({ message: 'Erro ao buscar turmas.' }); }
};

// --- SOLICITAR ENTRADA (COM BLOQUEIO DE PRAZO) ---
export const solicitarEntrada = async (req, res) => {
    try {
        const userId = req.userData.id;
        const { turmaId } = req.body;

        // 1. Busca a Turma
        const turma = await Turma.findByPk(turmaId);
        if (!turma) return res.status(404).json({ message: 'Turma não encontrada.' });

        // 2. Verifica se o prazo encerrou
        if (turma.prazo && new Date(turma.prazo) < new Date()) {
            return res.status(400).json({ message: 'Inscrições encerradas. O prazo desta turma expirou.' });
        }

        const existe = await UserTurmas.findOne({ where: { userId, turmaId } });
        if(existe) return res.status(400).json({ message: 'Já solicitado.' });

        await UserTurmas.create({ userId, turmaId, status: 'pendente' });
        res.status(200).json({ message: 'Solicitação enviada!' });
    } catch (error) { res.status(500).json({ message: 'Erro ao solicitar.' }); }
};

// --- APROVAR ALUNO (COM BLOQUEIO DE PRAZO) ---
export const tratarSolicitacao = async (req, res) => {
    try {
        const { alunoId, turmaId, acao } = req.body;
        
        // 1. Busca a turma para validar o prazo
        const turma = await Turma.findByPk(turmaId);
        if (!turma) return res.status(404).json({ message: 'Turma não encontrada.' });

        // Se o prazo passou, não pode aprovar mais ninguém
        if (turma.prazo && new Date(turma.prazo) < new Date()) {
             // Se for recusar, até pode (para limpar a lista), mas aprovar não.
             if (acao === 'aprovar') {
                return res.status(400).json({ message: 'Não é possível aprovar: O prazo da turma encerrou.' });
             }
        }

        const solicitacao = await UserTurmas.findOne({ where: { userId: alunoId, turmaId } });
        if (!solicitacao) return res.status(404).json({ message: 'Solicitação não encontrada.' });

        if (acao === 'aprovar') {
            solicitacao.status = 'aprovado';
            await solicitacao.save();
            res.status(200).json({ message: 'Aprovado!' });
        } else {
            await solicitacao.destroy();
            res.status(200).json({ message: 'Recusado.' });
        }
    } catch (error) { res.status(500).json({ message: 'Erro ao processar.' }); }
};

// --- ADICIONAR MANUALMENTE (COM BLOQUEIO DE PRAZO) ---
export const addAlunoToTurma = async (req, res) => {
    try {
        const { email } = req.body;
        const turmaId = req.params.id; 

        const turma = await Turma.findByPk(turmaId);
        if (!turma) return res.status(404).json({ message: 'Turma não encontrada.' });

        // Verifica prazo
        if (turma.prazo && new Date(turma.prazo) < new Date()) {
            return res.status(400).json({ message: 'Prazo encerrado. Não é possível adicionar alunos.' });
        }

        const aluno = await User.findOne({ where: { email } });
        if (!aluno) return res.status(404).json({ message: 'Email não encontrado.' });
        if (aluno.role !== 'aluno') return res.status(400).json({ message: 'Não é um aluno.' });

        const existe = await UserTurmas.findOne({ where: { userId: aluno.id, turmaId } });
        if (existe) {
            if (existe.status === 'aprovado') return res.status(400).json({ message: 'Já está na turma.' });
            existe.status = 'aprovado';
            await existe.save();
            return res.status(200).json({ message: 'Aluno aceito.' });
        }

        await UserTurmas.create({ userId: aluno.id, turmaId, status: 'aprovado' });
        res.status(200).json({ message: 'Aluno adicionado!' });
    } catch (error) { res.status(500).json({ message: 'Erro ao adicionar.' }); }
};

// ... Resto das funções iguais (update, delete, getById) ...
export const getTurmaById = async (req, res) => {
  try {
    const { id } = req.params;
    const turma = await Turma.findOne({
      where: { id },
      include: [{ 
          model: User, as: 'Users', attributes: ['id', 'nome', 'email', 'avatar'],
          through: { attributes: ['status'] } 
      }]
    });
    if (!turma) return res.status(404).json({ message: 'Turma não encontrada.' });
    const response = turma.toJSON();
    response.Alunos = response.Users.map(u => ({
        id: u.id, nome: u.nome, email: u.email, avatar: u.avatar, 
        turmaStatus: u.UserTurmas ? u.UserTurmas.status : 'pendente'
    }));
    delete response.Users;
    res.status(200).json(response);
  } catch (error) { res.status(500).json({ message: 'Erro ao buscar detalhes.' }); }
};

export const updateTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, tema, prazo } = req.body;
        const turma = await Turma.findByPk(id);
        if (!turma) return res.status(404).json({ message: 'Turma não encontrada.' });
        if (turma.professorId !== req.userData.id) return res.status(403).json({ message: 'Sem permissão.' });

        if (prazo && new Date(prazo) <= new Date()) {
            return res.status(400).json({ message: 'Para alterar, escolha uma data futura.' });
        }

        turma.nome = nome || turma.nome;
        turma.tema = tema || turma.tema;
        turma.prazo = prazo; 
        await turma.save();
        res.status(200).json({ message: 'Turma atualizada!', turma });
    } catch (error) { res.status(500).json({ message: 'Erro ao atualizar.' }); }
};

export const deleteTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const turma = await Turma.findByPk(id);
        if (!turma) return res.status(404).json({ message: 'Não encontrada.' });
        if (turma.professorId !== req.userData.id) return res.status(403).json({ message: 'Sem permissão.' });
        await turma.destroy();
        res.status(200).json({ message: 'Turma excluída.' });
    } catch (error) { res.status(500).json({ message: 'Erro ao excluir.' }); }
};

export const removeAlunoFromTurma = async (req, res) => res.status(200).send();