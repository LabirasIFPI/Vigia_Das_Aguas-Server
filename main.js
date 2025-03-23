const express = require("express");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para parsing de JSON
app.use(express.json());

// Criar um pool de conexões com PostgreSQL
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Endpoint raiz para testar se o servidor está rodando
app.get("/", (req, res) => {
  res.send("Servidor está rodando! 🚀");
});

// Endpoint para receber dados do Raspberry Pi Pico W e salvar no banco
app.get("/update", async (req, res) => {
  try {
    const waterLevel = parseFloat(req.query.waterLevel);
    if (isNaN(waterLevel)) {
      return res.status(400).send("Nível de água inválido.");
    }

    console.log(`Recebendo nível de água: ${waterLevel} cm`);

    // Inserir no banco de dados
    const query = "INSERT INTO water_level (level, timestamp) VALUES ($1, NOW())";
    const values = [waterLevel];

    const client = await dbPool.connect();
    try {
      await client.query(query, values);
      console.log("Dados inseridos no banco de dados.");
    } finally {
      client.release();
    }

    return res.status(200).send("Nível de água recebido e salvo no banco.");
  } catch (error) {
    console.error("Erro ao processar os dados:", error);
    return res.status(500).send("Erro interno do servidor.");
  }
});

// Endpoint para buscar os últimos 100 registros do banco (para o Thinger.io)
app.get("/data", async (req, res) => {
  try {
    const client = await dbPool.connect();
    // Corrigido: a coluna 'created_at' não existe, então substituímos por 'timestamp'
    const query = "SELECT level, timestamp FROM water_level ORDER BY timestamp DESC LIMIT 100";
    const result = await client.query(query);
    client.release();

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    return res.status(500).send("Erro ao buscar dados do banco.");
  }
});

// Manter a conexão HTTP ativa para evitar timeouts
app.use((req, res, next) => {
  res.setTimeout(0);
  res.setHeader("Connection", "keep-alive");
  next();
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Manter o pool ativo e tratar erros
dbPool.on("error", (err) => {
  console.error("Erro no pool de conexões do PostgreSQL:", err);
});
