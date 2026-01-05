# 📝 LetraAi - Plataforma de Gestão e Correção de Redações

> **LetraAi** é uma aplicação web Fullstack desenvolvida para modernizar o fluxo de entrega e correção de redações no ambiente acadêmico. O sistema conecta professores e alunos com segurança, validação institucional e feedback detalhado por competências.

## 🎯 Objetivo

Facilitar a vida de docentes e discentes do IFMA, substituindo a entrega de papel por um sistema digital onde:

  * **Alunos** enviam fotos de suas redações e acompanham o status.
  * **Professores** corrigem via plataforma, atribuindo notas por competência e comentários.

## 🚀 Funcionalidades Principais

### 🔒 Segurança e Autenticação

  * **Validação de Domínio:**
      * **Professores:** Cadastro restrito a e-mails `@ifma.edu.br`.
      * **Alunos:** Cadastro restrito a e-mails `@acad.ifma.edu.br`.
  * **Verificação de Conta:** Sistema de ativação via link enviado por e-mail (com modo de teste via terminal).
  * **Proteção de Rotas:** Acesso exclusivo via Token JWT.

### 👨‍🏫 Módulo do Professor

  * **Gestão de Turmas:** Criação e visualização global de turmas.
  * **Correção Profissional:** Ferramenta de correção baseada nas 5 competências (0-200 pontos).
  * **Feedback:** Inserção de comentários e marcação de itens anulatórios.

### 👨‍🎓 Módulo do Aluno

  * **Upload Simplificado:** Envio de redações (JPG/PNG) diretamente pelo Dashboard via Modal.
  * **Acompanhamento:** Visualização de notas, status (Enviada/Corrigida) e feedback detalhado.
  * **UX Otimizada:** verificação de e-mail e redirecionamentos inteligentes.

## 🛠️ Tecnologias Utilizadas

### Frontend (Client)

  * **React.js + Vite:** Performance e desenvolvimento ágil.
  * **React Bootstrap:** Interface responsiva e componentes modulares.
  * **Axios:** Comunicação com API e interceptação de tokens.
  * **React Router Dom:** Navegação SPA (Single Page Application).

### Backend (Server)

  * **Node.js (ES Modules):** Arquitetura moderna utilizando `import/export`.
  * **Express:** Framework para API RESTful.
  * **Sequelize (ORM):** Gerenciamento e migrações do banco de dados PostgreSQL.
  * **Nodemailer:** Envio de e-mails transacionais.
  * **Multer:** Upload e validação de arquivos.

## ⚙️ Configuração e Instalação

### Pré-requisitos

  * Node.js (v18+)
  * PostgreSQL

### 1\. Clonar o Repositório

```bash
git clone https://github.com/Aniel-err/LetraAi.git
cd LetraAi
```

### 2\. Configurar o Backend

Acesse a pasta do servidor e instale as dependências:

```bash
cd server
npm install
```

Crie um arquivo **`.env`** na raiz da pasta `server` com as seguintes configurações (ajuste conforme seu ambiente):

```env
# Configurações do Banco de Dados
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_NAME=letral_db
DB_HOST=127.0.0.1
DB_DIALECT=postgres

# Segredo para assinatura do Token JWT
JWT_SECRET=segredo_super_seguro

# Configuração de E-mail (Gmail - Senha de App)
# Se deixar vazio, o link de verificação aparecerá no terminal
EMAIL_USER=seu.email@gmail.com
EMAIL_PASS=sua_senha_de_app_16_digitos

# URL do Frontend (Para acesso via celular/rede)
# Exemplo: http://192.168.1.15:5173
FRONTEND_URL=http://localhost:5173
```

Execute as migrações para criar as tabelas no banco:

```bash
npx sequelize-cli db:migrate
```

Inicie o servidor:

```bash
npm run dev
```

*(O servidor rodará na porta 3001)*

### 3\. Configurar o Frontend

Em um novo terminal, acesse a pasta do cliente:

```bash
cd client
npm install
npm run dev
```

*(A aplicação rodará na porta 5173)*

## 🧪 Como Testar (Fluxo de Uso)

1.  Acesse `http://localhost:5173`.
2.  **Cadastro:**
      * Para testar como **Aluno**, use um e-mail terminado em `@acad.ifma.edu.br`.
      * Para testar como **Professor**, use um e-mail terminado em `@ifma.edu.br`.
3.  **Verificação:**
      * Se configurou o `.env`, verifique seu e-mail.
      * Se **não** configurou, olhe o **Terminal do Backend**: o link de ativação aparecerá lá.
4.  **Uso:**
      * Após clicar no link, você será logado automaticamente.
      * Explore o Dashboard para enviar ou corrigir redações.

-----

Desenvolvido por **Aniel Antonio**.
