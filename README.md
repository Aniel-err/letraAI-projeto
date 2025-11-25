# 📝 LetraAi - Plataforma de Correção de Redações

> **LetraAi** é um sistema web desenvolvido para modernizar o envio e a correção de redações escolares. A plataforma conecta alunos e professores, permitindo o upload de atividades e fornecendo correções detalhadas baseadas em competências.

## 🎯 Objetivo

Facilitar o fluxo de entrega de redações em sala de aula, substituindo o papel por um histórico digital organizado, onde professores podem gerenciar turmas e alunos recebem feedbacks estruturados.

## 🚀 Funcionalidades

### 👨‍🏫 Para Professores

  * **Gestão de Turmas:** Criação e visualização de turmas.
  * **Gestão de Alunos:** Adicionar ou remover alunos das turmas.
  * **Correção Profissional:** Interface de correção com:
      * Notas por Competências (C1 a C5).
      * Checklist de Itens Anulatórios.
      * Feedback descritivo.
  * **Visão Global:** Acesso às redações de todos os alunos vinculados.

### 👨‍🎓 Para Alunos

  * **Upload Simples:** Envio de fotos (JPG/PNG) da redação.
  * **Dashboard:** Painel com o status das correções (Enviada/Corrigida).
  * **Feedback:** Acesso detalhado à nota e aos comentários do professor.

## 🛠️ Tecnologias

  * **Frontend:** React, Vite, Bootstrap, Axios.
  * **Backend:** Node.js, Express, Sequelize (ORM).
  * **Banco de Dados:** PostgreSQL.
  * **Segurança:** Autenticação JWT e Bcrypt.

## 📂 Estrutura do Projeto

O repositório é dividido em duas partes principais:

  * `/client`: Código do Frontend (React).
  * `/server`: Código do Backend (API Node.js).

## 🔧 Como Rodar o Projeto

Para testar o sistema na sua máquina, siga os passos abaixo:

### 1\. Preparação

Certifique-se de ter o **Node.js** e o **PostgreSQL** instalados.
Clone o repositório:

```bash
git clone https://github.com/Aniel-err/LetraAi.git
cd LetraAi
```

### 2\. Configurando o Backend

Abra um terminal e entre na pasta do servidor:

```bash
cd server
npm install
```

Configure o acesso ao seu banco de dados PostgreSQL (no arquivo `src/config/config.json` ou criando um `.env`):

```env
# Exemplo de variáveis necessárias
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_NAME=letraai_db
JWT_SECRET=segredo_do_token
```

Crie as tabelas no banco e inicie o servidor:

```bash
npx sequelize-cli db:migrate
npm run dev
```

*O servidor rodará na porta 3001.*

### 3\. Configurando o Frontend

Abra um **novo terminal**, volte à raiz do projeto e entre na pasta do cliente:

```bash
cd client
npm install
npm run dev
```

*O frontend rodará na porta 5173.*

### 4\. Acesso

Acesse `http://localhost:5173` no navegador.

  * Crie uma conta como **Professor** ou **Aluno**.
  * Explore as funcionalidades\!

-----

*Desenvolvido por Aniel Antonio.*
