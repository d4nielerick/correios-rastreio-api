# 📦 Correios Tracker API

[![Node.js](https://img.shields.io/badge/Node.js-20+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-v4-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

Microserviço autônomo, rápido e leve para consulta e rastreamento de encomendas dos **Correios do Brasil** em tempo real, **sem necessidade de contrato corporativo (SIGEP) ou chaves pagas**.

Inclui **Interface Web moderna embutida**, cache inteligente em memória (LRU), normalização de status, decodificador de siglas e suporte a consultas individuais ou em lote.

---

## ✨ Recursos

- 🚀 **Rápido e Leve:** Desenvolvido em **Fastify + TypeScript** com pegada de memória mínima (< 30MB).
- 🔓 **Sem Contrato:** Funciona diretamente sem necessidade de cadastro no CWS ou Cartão de Postagem.
- 🌐 **Interface Web Integrada:** Dashboard interativo servido na raiz (`/`) com visualização em linha do tempo (*timeline*).
- ⚡ **Cache Inteligente:** Armazenamento em memória com TTL configurável para evitar sobrecarga e bloqueios de IP.
- 🏷️ **Decodificador de Siglas:** Mapeamento automático dos prefixos (ex: `NL` = Packet Standard, `QB` = SEDEX PJ, `PA` = PAC).
- 📊 **Normalização de Status:** Categorias claras (`POSTADO`, `EM_TRANSITO`, `SAIU_ENTREGA`, `ENTREGUE`, `TRIBUTADO`, etc.).
- 📦 **Consultas em Lote (Batch):** Rastreie múltiplos códigos em paralelo na mesma chamada.
- 🐳 **Docker & Deploy Fácil:** Imagem multi-stage ultra-otimizada pronta para rodar em qualquer VPS, Docker ou PaaS (Render, Railway, Fly.io).

---

## 🚀 Como Iniciar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18+ ou superior
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/d4nielerick/correios-rastreio-api.git
cd correios-rastreio-api
npm install
```

### 2. Configurar variáveis de ambiente (Opcional)
```bash
cp .env.example .env
```

### 3. Executar em modo desenvolvimento
```bash
npm run dev
```

Acesse:
- 🌐 **Interface Web:** [http://localhost:3000](http://localhost:3000)
- 📦 **API de Rastreio:** [http://localhost:3000/api/v1/rastreio/:codigo](http://localhost:3000/api/v1/rastreio/NL123456789BR)
- 💚 **Health Check:** [http://localhost:3000/health](http://localhost:3000/health)

---

## 🐳 Executando com Docker

### Usando Docker Compose:
```bash
docker-compose up -d
```

### Ou construindo a imagem manualmente:
```bash
docker build -t correios-rastreio-api .
docker run -d -p 3000:3000 --name correios-api correios-rastreio-api
```

---

## 📖 Documentação da API REST

### 1. Rastrear um único objeto
Retorna o status atual, cálculo de dias em trânsito e o histórico completo de movimentações.

- **Método:** `GET`
- **Rota:** `/api/v1/rastreio/:codigo`
- **Query Params:** `?nocache=true` *(opcional, força busca direta)*

#### Exemplo de requisição:
```bash
curl http://localhost:3000/api/v1/rastreio/NL123456789BR
```

#### Exemplo de resposta (`200 OK`):
```json
{
  "codigo": "NL123456789BR",
  "sucesso": true,
  "servico": {
    "sigla": "NL",
    "descricao": "Packet Standard / Prime"
  },
  "status": "EM_TRANSITO",
  "descricaoStatus": "Objeto em transferência - por favor aguarde",
  "entregue": false,
  "diasEmTransito": 3,
  "dataPostagem": "2024-03-06T15:25:05.000Z",
  "dataEntrega": null,
  "totalEventos": 2,
  "ultimoEvento": {
    "data": "2024-03-09T10:27:10.000Z",
    "dataOriginal": "09/03/2024 10:27",
    "status": "Objeto em transferência - por favor aguarde",
    "categoria": "EM_TRANSITO",
    "detalhes": "de Unidade de Tratamento, CURITIBA/PR para Unidade de Distribuição, MARECHAL CANDIDO RONDON/PR",
    "origem": "Unidade de Tratamento, CURITIBA/PR",
    "destino": "Unidade de Distribuição, MARECHAL CANDIDO RONDON/PR",
    "local": "Unidade de Distribuição, MARECHAL CANDIDO RONDON/PR"
  },
  "eventos": [
    {
      "data": "2024-03-09T10:27:10.000Z",
      "dataOriginal": "09/03/2024 10:27",
      "status": "Objeto em transferência - por favor aguarde",
      "categoria": "EM_TRANSITO",
      "detalhes": "de Unidade de Tratamento, CURITIBA/PR para Unidade de Distribuição, MARECHAL CANDIDO RONDON/PR",
      "origem": "Unidade de Tratamento, CURITIBA/PR",
      "destino": "Unidade de Distribuição, MARECHAL CANDIDO RONDON/PR",
      "local": "Unidade de Distribuição, MARECHAL CANDIDO RONDON/PR"
    },
    {
      "data": "2024-03-06T15:25:05.000Z",
      "dataOriginal": "06/03/2024 12:25",
      "status": "Objeto postado",
      "categoria": "POSTADO",
      "detalhes": "Unidade de Tratamento, SOROCABA/SP",
      "local": "Unidade de Tratamento, SOROCABA/SP"
    }
  ],
  "consultadoEm": "2026-08-31T12:00:00.000Z",
  "cache": false
}
```

---

### 2. Rastreamento em Lote (Múltiplos Códigos)
Permite consultar até 50 encomendas de uma só vez em paralelo.

- **Método:** `POST`
- **Rota:** `/api/v1/rastreio/multi`

#### Payload:
```json
{
  "codigos": [
    "NL123456789BR",
    "QB987654321BR",
    "PA112233445BR"
  ],
  "nocache": false
}
```

#### Exemplo de requisição:
```bash
curl -X POST http://localhost:3000/api/v1/rastreio/multi \
  -H "Content-Type: application/json" \
  -d '{"codigos":["NL123456789BR","QB987654321BR"]}'
```

---

### 3. Consultar Informações de Sigla/Serviço
- **Método:** `GET`
- **Rota:** `/api/v1/servicos/:sigla`

```bash
curl http://localhost:3000/api/v1/servicos/QB
```

---

### 4. Estatísticas de Cache e Limpeza Manual
- **Estatísticas:** `GET /api/v1/cache/stats`
- **Limpar código específico:** `DELETE /api/v1/cache/:codigo`

---

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `PORT` | `3000` | Porta HTTP do servidor |
| `HOST` | `0.0.0.0` | Endereço de escuta |
| `NODE_ENV` | `development` | Ambiente (`development`, `production`, `test`) |
| `CACHE_TTL_MS` | `300000` | Tempo de expiração do cache (padrão: 5 minutos) |
| `CACHE_MAX_ITEMS`| `1000` | Limite máximo de objetos em memória |
| `REQUEST_TIMEOUT_MS` | `15000` | Timeout máximo das requisições externas |

---

## 🧪 Testes Automatizados

Para rodar a suíte de testes unitários:

```bash
npm test
```

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte `LICENSE` para mais informações.
