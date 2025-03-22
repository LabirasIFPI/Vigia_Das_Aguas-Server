const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const { Pool } = require("pg"); // Alterado de Client para Pool

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

// Endpoint para receber dados do Raspberry Pi Pico W
const updateHandler = async (req, res) => {
  try {
    const waterLevel = parseFloat(req.query.waterLevel);
    if (isNaN(waterLevel)) {
      return res.status(400).send("Nível de água inválido.");
    }

    console.log(`Recebendo nível de água: ${waterLevel} cm`);

    // Usar uma conexão do pool para inserir os dados no banco
    const query = "INSERT INTO water_level (level) VALUES ($1)";
    const values = [waterLevel];

    const client = await dbPool.connect(); // Pegar uma conexão do pool
    try {
      await client.query(query, values);
      console.log("Dados inseridos no banco de dados.");
    } finally {
      client.release(); // Liberar a conexão de volta para o pool
    }

    // Enviar dados para o Thinger.io via HTTP
    await axios.post(
      `https://backend.thinger.io/v3/users/${process.env.THINGER_USER}/devices/${process.env.THINGER_DEVICE}/callback/data`,
      { value: waterLevel },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.THINGER_TOKEN}`,
          Connection: "keep-alive", // Manter conexão HTTP ativa
        },
      }
    );

    console.log("Dados enviados ao Thinger.io.");
    return res.status(200).send("Nível de água recebido, enviado ao banco de dados e ao Thinger.io.");
  } catch (error) {
    console.error("Erro ao processar os dados:", error);
    return res.status(500).send("Erro interno do servidor.");
  }
};

// Usar o handler para o endpoint
app.get("/update", updateHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Manter o pool ativo, tentando reconectar em caso de erro
dbPool.on("error", (err) => {
  console.error("Erro no pool de conexões do PostgreSQL:", err);
});
