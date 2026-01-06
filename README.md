# 📝 LetraAi - Plataforma de Correção de Redações

> **LetraAi** é um sistema web desenvolvido para modernizar o envio e a correção de redações escolares. A plataforma conecta alunos e professores, permitindo o gerenciamento de múltiplas turmas, upload de atividades e correções detalhadas baseadas nas competências do ENEM.

## 🎯 Objetivo

Facilitar o fluxo de entrega de redações em sala de aula, substituindo o papel por um histórico digital organizado. O sistema permite que professores gerenciem múltiplas turmas e que alunos acompanhem sua evolução através de feedbacks estruturados e notas detalhadas.

## 🚀 Funcionalidades

### 👨‍🏫 Para Professores
* **Gestão de Múltiplas Turmas:** Criação de turmas com temas específicos.
* **Controle de Acesso:** Sistema de aceitar ou recusar solicitações de entrada de alunos nas turmas.
* **Correção Profissional:**
    * **Ferramenta de Zoom:** Visualização ampliada para imagens de redações manuscritas.
    * **Notas por Competências:** Avaliação detalhada (C1 a C5) com cálculo automático da nota total.
    * **Critérios de Anulação:** Checklist para anulação automática baseada em regras (ex: Fuga ao tema).
    * **Feedback:** Campo para comentários descritivos.
* **Visão Global:** Lista de alunos com avatares e status de entrega.

### 👨‍🎓 Para Alunos
* **Múltiplas Matrículas:** Possibilidade de solicitar entrada em diversas turmas simultaneamente.
* **Envio Organizado:** O envio da redação é vinculado especificamente ao tema da turma selecionada.
* **Edição e Reenvio:** Permite corrigir o envio caso a redação ainda não tenha sido corrigida pelo professor.
* **Dashboard Visual:**
    * Status colorido das notas (Vermelho < 500 / Azul ≥ 500).
    * Feedback detalhado das competências.
* **Perfil:** Personalização de dados e foto de perfil (Avatar).

### 🔐 Segurança & Autenticação
* **Login e Cadastro:** Com validação de e-mails institucionais (Opcional).
* **Recuperação de Senha:** Fluxo de "Esqueci minha senha" com token via e-mail.
* **Proteção de Rotas:** Middleware de autenticação via **JWT (JSON Web Tokens)**.

## 🛠️ Tecnologias

O projeto foi desenvolvido seguindo o padrão moderno **ES6 Modules**.

* **Frontend:** React, Vite, Bootstrap, Axios.
* **Backend:** Node.js, Express.
* **Banco de Dados:** PostgreSQL com Sequelize (ORM).
* **Uploads:** Multer (Gerenciamento de imagens).
* **Segurança:** Bcrypt (Hash de senhas) e JWT.

## 📂 Estrutura do Projeto

O repositório é dividido em duas partes principais:

* `/client`: Código do Frontend (React + Vite).
* `/server`: Código do Backend (API Node.js ES6).

## 🔧 Como Rodar o Projeto

Para testar o sistema na sua máquina, siga os passos abaixo:

### 1. Preparação

Certifique-se de ter o **Node.js** e o **PostgreSQL** instalados.
Clone o repositório:

```bash
git clone [https://github.com/Aniel-err/LetraAi.git](https://github.com/Aniel-err/LetraAi.git)
cd LetraAi

```

### 2. Configurando o Backend

Abra um terminal e entre na pasta do servidor:

```bash
cd server
npm install

```

Configure o acesso ao seu banco de dados PostgreSQL (no arquivo `src/config/config.json` ou criando um arquivo `.env` na raiz da pasta `server`):

```env
# Exemplo de .env na pasta server
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_NAME=letraai_db
DB_HOST=127.0.0.1
JWT_SECRET=seu_segredo_super_secreto
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app

```

Crie as tabelas no banco e inicie o servidor:

```bash
# Criação das tabelas (Migrate não é estritamente necessário se usar o sync do server.js, mas recomendado)
# Para rodar o servidor:
npm run dev

```

*O servidor rodará na porta **3001**.*

### 3. Configurando o Frontend

Abra um **novo terminal**, volte à raiz do projeto e entre na pasta do cliente:

```bash
cd client
npm install
npm run dev

```

*O frontend rodará na porta **5173**.*

### 4. Acesso

Acesse `http://localhost:5173` no navegador.

1. Crie uma conta como **Professor** para criar turmas.
2. Crie uma conta como **Aluno** em outra aba.
3. Com o aluno, solicite entrada na turma.
4. Com o professor, aceite o aluno e comece o ciclo de envio e correção!

---

*Desenvolvido por Aniel Antonio.*
