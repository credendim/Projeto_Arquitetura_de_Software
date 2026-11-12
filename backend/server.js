require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Permite ler o req.body

// Importa e ativa as rotas que você acabou de criar
const filmeRoutes = require("./routes/filmeRoutes");
app.use("/api/filmes", filmeRoutes);

// Rota de teste antiga
app.get("/api/status", (req, res) => {
  res.status(200).json({ mensagem: "API da Lista de Filmes está rodando!" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
