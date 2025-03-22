# Servidor Node.js para Monitoramento de Nível de Água

Este projeto é um servidor Node.js que recebe dados de nível de água enviados por um Raspberry Pi Pico W, armazena-os em um banco de dados PostgreSQL hospedado no Railway e os encaminha para a plataforma Thinger.io.

## 📌 Tecnologias Utilizadas

- Node.js
- Express.js
- PostgreSQL (usando `pg`)
- Axios
- Thinger.io
- Railway (para hospedagem do banco de dados)

## 📦 Instalação

### 1️⃣ Clone o repositório

```sh
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 2️⃣ Instale as dependências

```sh
npm install
```

### 3️⃣ Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

```env
PORT=5000
DATABASE_URL=postgres://seu_usuario:senha@host:porta/seu_banco
THINGER_USER=seu_usuario_thinger
THINGER_DEVICE=seu_dispositivo_thinger
THINGER_TOKEN=seu_token_thinger
```

## 🚀 Execução do Servidor

Para iniciar o servidor, execute:

```sh
npm start
```

O servidor rodará na porta definida no `.env` (padrão: `5000`).

## 📡 Uso

O servidor escuta requisições do Raspberry Pi Pico W via HTTP:

```sh
GET /update?waterLevel=VALOR
```

### Exemplo de requisição

```sh
curl "http://localhost:5000/update?waterLevel=10.5"
```

## 🔄 Fluxo de Funcionamento

1. O Raspberry Pi Pico W envia o nível de água via requisição HTTP GET.
2. O servidor recebe os dados e os armazena no PostgreSQL.
3. Os dados são enviados para a plataforma Thinger.io.
4. Logs são gerados para acompanhar o status das operações.

## 🛠 Manutenção e Debug

- O servidor mantém um pool de conexões com o banco de dados e tenta reconectar em caso de falha.
- Logs de erros são exibidos no terminal para facilitar o debug.
- Em caso de problemas, reinicie o servidor com:

  ```sh
  npm restart
  ```

---
Desenvolvido por [Nícolas Rafael](https://github.com/NicolasRaf)
