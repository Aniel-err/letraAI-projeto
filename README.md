<<<<<<< HEAD
```markdown
# 📝 LetraAi - Plataforma de Correção de Redações

> **LetraAi** é um sistema web desenvolvido para modernizar o envio e a correção de redações escolares. A plataforma conecta alunos e professores, permitindo o gerenciamento de múltiplas turmas, upload de atividades e correções detalhadas baseadas nas competências do ENEM.

## 🎯 Objetivo

Facilitar o fluxo de entrega de redações em sala de aula, substituindo o papel por um histórico digital organizado. O sistema permite que professores gerenciem múltiplas turmas e que alunos acompanhem sua evolução através de feedbacks estruturados e notas detalhadas.
=======
# 📝 LetraAi - Plataforma de Gestão e Correção de Redações

> **LetraAi** é uma aplicação web Fullstack desenvolvida para modernizar o fluxo de entrega e correção de redações no ambiente acadêmico. O sistema conecta professores e alunos com segurança, validação institucional e feedback detalhado por competências.

## 🎯 Objetivo

Facilitar a vida de docentes e discentes do IFMA, substituindo a entrega de papel por um sistema digital onde:
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003

  * **Alunos** enviam fotos de suas redações e acompanham o status.
  * **Professores** corrigem via plataforma, atribuindo notas por competência e comentários.

<<<<<<< HEAD
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
=======
## 🚀 Funcionalidades Principais

### 🔒 Segurança e Autenticação

  * **Validação de Domínio:**
      * **Professores:** Cadastro restrito a e-mails `@ifma.edu.br`.
      * **Alunos:** Cadastro restrito a e-mails `@acad.ifma.edu.br`.
  * **Verificação de Conta:** Sistema de ativação via link enviado por e-mail (com modo de teste via terminal).
  * **Proteção de Rotas:** Acesso exclusivo via Token JWT.

### 👨‍🏫 Módulo do Professor
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003

  * **Gestão de Turmas:** Criação e visualização global de turmas.
  * **Correção Profissional:** Ferramenta de correção baseada nas 5 competências (0-200 pontos).
  * **Feedback:** Inserção de comentários e marcação de itens anulatórios.

<<<<<<< HEAD
O projeto foi desenvolvido seguindo o padrão moderno **ES6 Modules**.

* **Frontend:** React, Vite, Bootstrap, Axios.
* **Backend:** Node.js, Express.
* **Banco de Dados:** PostgreSQL com Sequelize (ORM).
* **Uploads:** Multer (Gerenciamento de imagens).
* **Segurança:** Bcrypt (Hash de senhas) e JWT.
=======
### 👨‍🎓 Módulo do Aluno
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003

  * **Upload Simplificado:** Envio de redações (JPG/PNG) diretamente pelo Dashboard via Modal.
  * **Acompanhamento:** Visualização de notas, status (Enviada/Corrigida) e feedback detalhado.
  * **UX Otimizada:** verificação de e-mail e redirecionamentos inteligentes.

## 🛠️ Tecnologias Utilizadas

<<<<<<< HEAD
* `/client`: Código do Frontend (React + Vite).
* `/server`: Código do Backend (API Node.js ES6).
=======
### Frontend (Client)
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003

  * **React.js + Vite:** Performance e desenvolvimento ágil.
  * **React Bootstrap:** Interface responsiva e componentes modulares.
  * **Axios:** Comunicação com API e interceptação de tokens.
  * **React Router Dom:** Navegação SPA (Single Page Application).

### Backend (Server)

<<<<<<< HEAD
### 1. Preparação
=======
  * **Node.js (ES Modules):** Arquitetura moderna utilizando `import/export`.
  * **Express:** Framework para API RESTful.
  * **Sequelize (ORM):** Gerenciamento e migrações do banco de dados PostgreSQL.
  * **Nodemailer:** Envio de e-mails transacionais.
  * **Multer:** Upload e validação de arquivos.
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003

## ⚙️ Configuração e Instalação

### Pré-requisitos

  * Node.js (v18+)
  * PostgreSQL

### 1\. Clonar o Repositório

```bash
git clone [https://github.com/Aniel-err/LetraAi.git](https://github.com/Aniel-err/LetraAi.git)
cd LetraAi

```

<<<<<<< HEAD
### 2. Configurando o Backend
=======
### 2\. Configurar o Backend
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003

Acesse a pasta do servidor e instale as dependências:

```bash
cd server
npm install

```

<<<<<<< HEAD
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

=======
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
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003
```

Execute as migrações para criar as tabelas no banco:

```bash
<<<<<<< HEAD
# Criação das tabelas (Migrate não é estritamente necessário se usar o sync do server.js, mas recomendado)
# Para rodar o servidor:
=======
npx sequelize-cli db:migrate
```

Inicie o servidor:

```bash
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003
npm run dev

```

<<<<<<< HEAD
*O servidor rodará na porta **3001**.*

### 3. Configurando o Frontend
=======
*(O servidor rodará na porta 3001)*

### 3\. Configurar o Frontend
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003

Em um novo terminal, acesse a pasta do cliente:

```bash
cd client
npm install
npm run dev

```

<<<<<<< HEAD
*O frontend rodará na porta **5173**.*

### 4. Acesso

Acesse `http://localhost:5173` no navegador.

1. Crie uma conta como **Professor** para criar turmas.
2. Crie uma conta como **Aluno** em outra aba.
3. Com o aluno, solicite entrada na turma.
4. Com o professor, aceite o aluno e comece o ciclo de envio e correção!
=======
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
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003

---

<<<<<<< HEAD
*Desenvolvido por Aniel Antonio.*

```

```
=======
Desenvolvido por **Aniel Antonio**.
>>>>>>> 5cb7ff783ea6fa2b427c6e672116c92b9b4c7003
