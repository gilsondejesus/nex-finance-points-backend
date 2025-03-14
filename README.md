📁 Backend - Nex-Points

Visão Geral

API Node.js para gestão de pontos com autenticação JWT, desenvolvida com Express e Sequelize. Integra com banco de dados MySQL e oferece endpoints RESTful para:

- Autenticação de usuários (JWT)

- Upload de planilhas (admin)

- Gerenciamento de transações

- Geração de relatórios

- Operações CRUD para entidades do sistema

📋 Pré-requisitos

- Node.js v18+

- MySQL 8.0+ (local ou remoto)

- npm v9+

- Git

⚙️ Instalação Local

- git clone

- npm install
🔧 Configuração

Crie o arquivo .env na raiz do projeto:


DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=finance_db
JWT_SECRET=segredo_super_secreto

Configure o banco de dados MySQL:

CREATE DATABASE finance_db;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON finance_db.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;

🏃 Execução

# Executar migrações do Sequelize
npm run migrate

# Iniciar servidor em desenvolvimento
npm run dev

Servidor disponível em: http://localhost:3000

🔐 Configuração de CORS
No arquivo server.js, verifique a configuração:
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend Vite
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Se estiver usando cookies/tokens
  }),
);

📊 Endpoints Principais

Método	Endpoint	Função
- POST	/auth/register	Registrar novo usuário
- POST	/auth/login	Login e obtenção de token
- POST	/admin/upload	Upload de planilha (admin)
- GET	/user/transactions	Listar transações

🛠 Testando a API

1 - Importe a coleção Postman incluída no projeto

2 - Configure environment variables no Postman:

- base_url: URL da sua API

- token: (obtido após login)
