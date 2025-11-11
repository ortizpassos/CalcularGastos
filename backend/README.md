# CalcularGastos Backend – Leituras de Luz e Água unificadas

## Pré-requisitos
- Node.js 18+
- MySQL 5.7+ ou MariaDB 10+
- (Opcional) Conta Tuya IoT Platform para integração

## Instalação
```powershell
cd backend
npm install
```

## Configuração do MySQL
Defina as variáveis de ambiente antes de rodar o servidor:

```powershell
$env:MYSQL_HOST = 'localhost'
$env:MYSQL_USER = 'root'
$env:MYSQL_PASSWORD = 'sua_senha'
$env:MYSQL_DATABASE = 'calcular_gastos'
```

Crie o banco de dados (se necessário):
```sql
CREATE DATABASE calcular_gastos;
```

Crie a tabela (automaticamente ao rodar):
```powershell
node init-db.js
```

## Uso das rotas unificadas
Inicie o servidor:
```powershell
node server.js
```

### Leituras de luz
- `GET /api/luz/leituras` — retorna a última leitura de luz
- `POST /api/luz/leituras` — salva nova leitura de luz
	- Body: `{ "karina": 123.45, "david": 234.56 }`

### Leituras de água
- `GET /api/agua/leituras` — retorna a última leitura de água
- `POST /api/agua/leituras` — salva nova leitura de água
	- Body: `{ "karina": 12.34, "david": 56.78 }`

### Exemplo de uso (PowerShell)
```powershell
# Salvar leitura de luz
Invoke-RestMethod -Uri 'http://localhost:3000/api/luz/leituras' -Method POST -Body (@{karina=123.45;david=234.56}|ConvertTo-Json) -ContentType 'application/json'
# Obter última leitura de água
Invoke-RestMethod -Uri 'http://localhost:3000/api/agua/leituras' -Method GET
```

## Integração Tuya (opcional)
Se desejar usar a API Tuya, defina também:
```powershell
$env:TUYA_CLIENT_ID = 'SEU_CLIENT_ID'
$env:TUYA_CLIENT_SECRET = 'SEU_CLIENT_SECRET'
# Opcional: $env:TUYA_BASE_URL = 'https://openapi.tuyaus.com'
```
E use a rota `/api/tuya/devices` normalmente.

---

Dúvidas ou problemas? Abra uma issue ou envie detalhes do erro para suporte.
