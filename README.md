# 📦 Correios Tracker API

[![Node.js](https://img.shields.io/badge/Node.js-20+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-v4-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

Microserviço autônomo, rápido e leve para consulta e rastreamento de encomendas dos **Correios do Brasil** em tempo real, **sem necessidade de contrato corporativo (SIGEP) ou chaves pagas**.

Inclui **Interface Web moderna embutida**, **Histórico de Consultas com Apelidos**, **Sistema de Notificações Automáticas (Desktop & Webhooks)**, cache inteligente em memória (LRU), normalização de status e decodificador de siglas.

---

## ✨ Recursos

- 🚀 **Rápido e Leve:** Desenvolvido em **Fastify + TypeScript** com pegada de memória mínima (< 30MB).
- 🔓 **Sem Contrato:** Funciona diretamente sem necessidade de cadastro no CWS ou Cartão de Postagem.
- 🕒 **Histórico Persistente:** Salva automaticamente as últimas encomendas consultadas com apelidos personalizados.
- 🔔 **Notificações Automáticas:**
  - 🖥️ **Notificações no Navegador:** Alertas nativos de desktop quando o pacote mudar de status.
  - 📡 **Webhooks:** Suporte nativo para envio automático de alertas para **Discord** (Embeds coloridos), **Telegram** e **Webhooks HTTP customizados**.
  - ⏱️ **Monitor em Background:** Checagem periódica em segundo plano de todas as encomendas em trânsito.
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

### 2. Executar em modo desenvolvimento
```bash
npm run dev
```

Acesse:
- 🌐 **Interface Web:** [http://localhost:3000](http://localhost:3000)
- 📦 **API de Rastreio:** [http://localhost:3000/api/v1/rastreio/:codigo](http://localhost:3000/api/v1/rastreio/NL123456789BR)
- 🕒 **Histórico de Consultas:** [http://localhost:3000/api/v1/historico](http://localhost:3000/api/v1/historico)
- 🔔 **Monitoramento & Webhooks:** [http://localhost:3000/api/v1/monitorar](http://localhost:3000/api/v1/monitorar)
- 💚 **Health Check:** [http://localhost:3000/health](http://localhost:3000/health)

---

## 🔔 Sistema de Notificações e Webhooks

### 1. Cadastrar encomenda para monitoramento automático
O serviço verifica periodicamente as encomendas em trânsito e dispara alertas para a URL configurada assim que houver nova movimentação.

- **Método:** `POST`
- **Rota:** `/api/v1/monitorar`

#### Payload:
```json
{
  "codigo": "NL123456789BR",
  "apelido": "Teclado Mecânico Shopee",
  "webhookUrl": "https://discord.com/api/webhooks/SEU_CANAL/SEU_TOKEN",
  "notificarNavegador": true
}
```

#### Exemplo cURL:
```bash
curl -X POST http://localhost:3000/api/v1/monitorar \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "NL123456789BR",
    "apelido": "Placa de Vídeo",
    "webhookUrl": "https://discord.com/api/webhooks/123456/abcdef"
  }'
```

---

## 📖 Documentação dos Endpoints REST

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/v1/rastreio/:codigo` | Rastreia um pacote (suporta query `?apelido=X&nocache=true`) |
| `POST` | `/api/v1/rastreio/multi` | Rastreia múltiplos pacotes em lote (até 50 códigos) |
| `GET` | `/api/v1/historico` | Retorna o histórico das últimas encomendas consultadas |
| `DELETE` | `/api/v1/historico` | Limpa o histórico de consultas |
| `GET` | `/api/v1/monitorar` | Lista todos os pacotes com monitoramento ativo |
| `POST` | `/api/v1/monitorar` | Adiciona um pacote ao monitoramento com Webhook |
| `DELETE` | `/api/v1/monitorar/:codigo` | Remove um pacote do monitoramento |
| `POST` | `/api/v1/monitorar/verificar` | Força a checagem imediata de todas as encomendas ativas |
| `GET` | `/api/v1/servicos/:sigla` | Retorna o tipo de serviço a partir do prefixo (ex: `QB`, `NL`) |
| `GET` | `/health` | Status de integridade, consumo de RAM e uptime |

---

## 🐳 Executando com Docker

```bash
docker-compose up -d
```

---

## 🧪 Testes Automatizados

```bash
npm test
```

---

## 📄 Licença

Distribuído sob a licença **MIT**.
