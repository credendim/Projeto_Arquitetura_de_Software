// 1. Importação das dependências
require("dotenv").config();
const express = require("express");
const cors = require("cors");

// 2. Inicialização do aplicativo
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Configuração dos Middlewares (Os "Porteiros")
app.use(cors());
app.use(express.json());

// 4. Rota de Teste (Apenas para garantir que o servidor está vivo)
app.get("/api/status", (req, res) => {
  res
    .status(200)
    .json({ mensagem: "API da Lista de Filmes está rodando perfeitamente!" });
});

// 5. Ligando o Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}/api/status`);
});
