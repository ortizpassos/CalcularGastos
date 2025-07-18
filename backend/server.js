const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Caminhos dos arquivos JSON para persistência simples
const ARQUIVO_LEITURAS_LUZ = path.join(__dirname, 'leituras_luz.json');
const ARQUIVO_HISTORICO_LUZ = path.join(__dirname, 'historico_luz.json');
const ARQUIVO_LEITURAS_AGUA = path.join(__dirname, 'leituras_agua.json');
const ARQUIVO_HISTORICO_AGUA = path.join(__dirname, 'historico_agua.json');

// Funções auxiliares para ler e salvar JSON
function lerArquivo(filePath) {
  try {
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

// 1. Leituras anteriores luz (GET)
app.get('/api/luz/leituras', (req, res) => {
  const leituras = lerArquivo(ARQUIVO_LEITURAS_LUZ) || {};
  res.json(leituras);
});

// 2. Salvar leituras anteriores luz (POST)
app.post('/api/luz/leituras', (req, res) => {
  const { karina, david } = req.body;
  if (typeof karina !== 'number' || typeof david !== 'number') {
    return res.status(400).json({ erro: 'Dados inválidos: karina e david devem ser números' });
  }
  salvarArquivo(ARQUIVO_LEITURAS_LUZ, { karina, david });
  res.json({ mensagem: 'Leituras anteriores luz salvas com sucesso' });
});

// 3. Histórico luz (GET)
app.get('/api/luz/historico', (req, res) => {
  const historico = lerArquivo(ARQUIVO_HISTORICO_LUZ) || [];
  res.json(historico);
});

// 4. Adicionar ao histórico luz (POST)
app.post('/api/luz/historico', (req, res) => {
  const entrada = req.body;
  if (!entrada || !entrada.nome || typeof entrada.consumo !== 'number' || typeof entrada.valor !== 'number') {
    return res.status(400).json({ erro: 'Dados de histórico inválidos' });
  }
  let historico = lerArquivo(ARQUIVO_HISTORICO_LUZ) || [];
  historico.push(entrada);
  salvarArquivo(ARQUIVO_HISTORICO_LUZ, historico);
  res.json({ mensagem: 'Entrada adicionada ao histórico luz' });
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

// 3. Histórico agua (GET)
app.get('/api/agua/historico', (req, res) => {
  const historico = lerArquivo(ARQUIVO_HISTORICO_AGUA) || [];
  res.json(historico);
});

// 4. Adicionar ao histórico agua (POST)
app.post('/api/agua/historico', (req, res) => {
  const entrada = req.body;
  if (!entrada || !entrada.nome || typeof entrada.consumo !== 'number' || typeof entrada.valor !== 'number') {
    return res.status(400).json({ erro: 'Dados de histórico inválidos' });
  }
  let historico = lerArquivo(ARQUIVO_HISTORICO_AGUA) || [];
  historico.push(entrada);
  salvarArquivo(ARQUIVO_HISTORICO_AGUA, historico);
  res.json({ mensagem: 'Entrada adicionada ao histórico água' });
});

// --- Servir frontends estáticos se quiser ---
// app.use(express.static('public'));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
