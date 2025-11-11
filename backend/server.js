const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Tuya client (optional). Configure TUYA_CLIENT_ID and TUYA_CLIENT_SECRET in env.
const tuya = require('./tuya-client');

app.use(cors());
app.use(express.json());

// Caminhos dos arquivos JSON para persistência simples (exceto leituras_luz, agora em MySQL)
const ARQUIVO_HISTORICO_LUZ = path.join(__dirname, 'historico_luz.json');
const ARQUIVO_LEITURAS_AGUA = path.join(__dirname, 'leituras_agua.json');
const ARQUIVO_HISTORICO_AGUA = path.join(__dirname, 'historico_agua.json');

// Banco de dados MySQL
const db = require('./db');

// Funções auxiliares para ler e salvar JSON
app.post('/api/:tipo/resultado', async (req, res) => {
  const { tipo } = req.params;
  if (tipo !== 'luz' && tipo !== 'agua') {
    return res.status(400).json({ erro: 'Tipo inválido' });
  }
  const resultado = req.body;
  if (!resultado || typeof resultado !== 'object') {
    return res.status(400).json({ erro: 'Resultado inválido' });
  }
  try {
    await db.query(
      "INSERT INTO resultados (tipo, resultado) VALUES (?, ?)",
      [tipo, JSON.stringify(resultado)]
    );
    res.json({ mensagem: 'Resultado salvo com sucesso' });
  } catch (err) {
    console.error('Erro ao salvar resultado:', err);
    res.status(500).json({ erro: 'Erro ao salvar resultado no banco de dados' });
  }
});
function lerArquivo(filePath) {
  try {
app.get('/api/:tipo/resultado', async (req, res) => {
  const { tipo } = req.params;
  if (tipo !== 'luz' && tipo !== 'agua') {
    return res.status(400).json({ erro: 'Tipo inválido' });
  }
  try {
    const [rows] = await db.query(
      "SELECT resultado, data FROM resultados WHERE tipo = ? ORDER BY data DESC, id DESC LIMIT 1",
      [tipo]
    );
    if (rows.length === 0) {
      return res.json({ resultado: null, data: null });
    }
    // resultado é JSON em string
    res.json({ resultado: JSON.parse(rows[0].resultado), data: rows[0].data });
  } catch (err) {
    console.error('Erro ao buscar resultado:', err);
    res.status(500).json({ erro: 'Erro ao buscar resultado no banco de dados' });
  }
});
    if (!fs.existsSync(filePath)) return null;
    const dados = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(dados);
  } catch (err) {
    console.error('Erro ao ler arquivo', filePath, err);
    return null;
  }
}

function salvarArquivo(filePath, dados) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));
    return true;
  } catch (err) {
    console.error('Erro ao salvar arquivo', filePath, err);
    return false;
  }
}

// --- ROTAS LUZ ---

// Leituras anteriores luz (GET/POST) - tabela unificada
app.get('/api/luz/leituras', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT karina, david, data FROM leituras WHERE tipo = 'luz' ORDER BY data DESC, id DESC LIMIT 1"
    );
    if (rows.length === 0) {
      return res.json({ karina: null, david: null, data: null });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar leituras luz:', err);
    res.status(500).json({ erro: 'Erro ao buscar leituras luz do banco de dados' });
  }
});

app.post('/api/luz/leituras', async (req, res) => {
  const { karina, david } = req.body;
  if (typeof karina !== 'number' || typeof david !== 'number') {
    return res.status(400).json({ erro: 'Dados inválidos: karina e david devem ser números' });
  }
  try {
    await db.query(
      "INSERT INTO leituras (tipo, karina, david) VALUES ('luz', ?, ?)",
      [karina, david]
    );
    res.json({ mensagem: 'Leituras anteriores luz salvas com sucesso' });
  } catch (err) {
    console.error('Erro ao salvar leituras luz:', err);
    res.status(500).json({ erro: 'Erro ao salvar leituras luz no banco de dados' });
  }
});
// Leituras anteriores agua (GET/POST) - tabela unificada
app.get('/api/agua/leituras', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT karina, david, data FROM leituras WHERE tipo = 'agua' ORDER BY data DESC, id DESC LIMIT 1"
    );
    if (rows.length === 0) {
      return res.json({ karina: null, david: null, data: null });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar leituras agua:', err);
    res.status(500).json({ erro: 'Erro ao buscar leituras agua do banco de dados' });
  }
});

app.post('/api/agua/leituras', async (req, res) => {
  const { karina, david } = req.body;
  if (typeof karina !== 'number' || typeof david !== 'number') {
    return res.status(400).json({ erro: 'Dados inválidos: karina e david devem ser números' });
  }
  try {
    await db.query(
      "INSERT INTO leituras (tipo, karina, david) VALUES ('agua', ?, ?)",
      [karina, david]
    );
    res.json({ mensagem: 'Leituras anteriores agua salvas com sucesso' });
  } catch (err) {
    console.error('Erro ao salvar leituras agua:', err);
    res.status(500).json({ erro: 'Erro ao salvar leituras agua no banco de dados' });
  }
});

// 3. Histórico luz (GET) - agora via MySQL
app.get('/api/luz/historico', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT nome, consumo, valor, data FROM historicos WHERE tipo = 'luz' ORDER BY data DESC, id DESC LIMIT 100"
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar histórico luz:', err);
    res.status(500).json({ erro: 'Erro ao buscar histórico luz do banco de dados' });
  }
});

// 4. Adicionar ao histórico luz (POST) - agora via MySQL
app.post('/api/luz/historico', async (req, res) => {
  const entrada = req.body;
  if (!entrada || !entrada.nome || typeof entrada.consumo !== 'number' || typeof entrada.valor !== 'number') {
    return res.status(400).json({ erro: 'Dados de histórico inválidos' });
  }
  try {
    await db.query(
      "INSERT INTO historicos (tipo, nome, consumo, valor) VALUES ('luz', ?, ?, ?)",
      [entrada.nome, entrada.consumo, entrada.valor]
    );
    res.json({ mensagem: 'Entrada adicionada ao histórico luz' });
  } catch (err) {
    console.error('Erro ao salvar histórico luz:', err);
    res.status(500).json({ erro: 'Erro ao salvar histórico luz no banco de dados' });
  }
});

// --- ROTAS AGUA ---

// 1. Leituras anteriores agua (GET)
app.get('/api/agua/leituras', (req, res) => {
  const leituras = lerArquivo(ARQUIVO_LEITURAS_AGUA) || {};
  res.json(leituras);
});

// 2. Salvar leituras anteriores agua (POST)
app.post('/api/agua/leituras', (req, res) => {
  const { karina, david } = req.body;
  if (typeof karina !== 'number' || typeof david !== 'number') {
    return res.status(400).json({ erro: 'Dados inválidos: karina e david devem ser números' });
  }
  salvarArquivo(ARQUIVO_LEITURAS_AGUA, { karina, david });
  res.json({ mensagem: 'Leituras anteriores água salvas com sucesso' });
});

// 3. Histórico agua (GET) - agora via MySQL
app.get('/api/agua/historico', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT nome, consumo, valor, data FROM historicos WHERE tipo = 'agua' ORDER BY data DESC, id DESC LIMIT 100"
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar histórico agua:', err);
    res.status(500).json({ erro: 'Erro ao buscar histórico agua do banco de dados' });
  }
});

// 4. Adicionar ao histórico agua (POST) - agora via MySQL
app.post('/api/agua/historico', async (req, res) => {
  const entrada = req.body;
  if (!entrada || !entrada.nome || typeof entrada.consumo !== 'number' || typeof entrada.valor !== 'number') {
    return res.status(400).json({ erro: 'Dados de histórico inválidos' });
  }
  try {
    await db.query(
      "INSERT INTO historicos (tipo, nome, consumo, valor) VALUES ('agua', ?, ?, ?)",
      [entrada.nome, entrada.consumo, entrada.valor]
    );
    res.json({ mensagem: 'Entrada adicionada ao histórico água' });
  } catch (err) {
    console.error('Erro ao salvar histórico agua:', err);
    res.status(500).json({ erro: 'Erro ao salvar histórico agua no banco de dados' });
  }
});

// --- Servir frontends estáticos se quiser ---
// app.use(express.static('public'));

// --- Rota de exemplo Tuya ---
// GET /api/tuya/devices -> lista dispositivos (requer TUYA_CLIENT_ID + TUYA_CLIENT_SECRET)
app.get('/api/tuya/devices', async (req, res) => {
  try {
    const pageNo = parseInt(req.query.page_no || '1', 10);
    const pageSize = parseInt(req.query.page_size || '20', 10);
    const result = await tuya.listDevices(pageNo, pageSize);
    res.json(result);
  } catch (err) {
    console.error('Erro ao acessar Tuya API', err.message || err);
    res.status(500).json({ erro: 'Falha ao consultar Tuya API', detalhes: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
