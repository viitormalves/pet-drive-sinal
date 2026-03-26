# 🐾 Pet Drive Sinal

Landing pages para a ação **Pet Drive Sinal** — campanha promocional do [Grupo Sinal](https://www.gruposinal.com.br) em parceria com a [Zazuu](https://www.zazuu.com.br). Clientes agendam um test-drive e ganham um banho gratuito para seu pet.

A ação foi replicada para duas marcas do grupo em diferentes concessionárias da Grande São Paulo.

## 📂 Estrutura

```
├── leapmotor/          — LP para concessionárias Leapmotor Sinal
│   ├── index.html
│   ├── confirmacao.html
│   ├── google-apps-script.js
│   └── img/
│
├── gac/                — LP para concessionárias GAC Sinal
│   ├── index.html
│   ├── confirmacao.html
│   ├── google-apps-script.js
│   └── img/
│
└── README.md
```

## ✨ Funcionalidades

- **Hero responsivo** — banner elástico com `flex: 1` que se adapta a qualquer viewport (notebook 14" a monitor 32")
- **Scroll reveal** — seções aparecem progressivamente com Intersection Observer
- **Formulário de agendamento** com:
  - Validação algorítmica de CPF (dígitos verificadores)
  - Máscaras automáticas (CPF e telefone)
  - Seleção visual de porte do cão e horário
  - Bloqueio de slots ocupados em tempo real via Google Sheets
  - Cadastro único por CPF (validação client + server)
- **Google Sheets como backend** — persistência serverless sem banco de dados
- **Página de confirmação** — animação de check, resumo do agendamento, download de comprovante PNG
- **Imagens responsivas** — `<picture>` com versões desktop e mobile para logo e banner

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML + React 18 via CDN + Babel standalone |
| Estilo | CSS puro com variáveis e animações |
| Backend | Google Apps Script (serverless) |
| Banco de dados | Google Sheets |
| Comprovante | html2canvas |
| Hospedagem | AWS S3 (static website) |

## ⚙️ Setup

### 1. Google Sheets

Cada marca usa uma **planilha separada** com 4 abas:

| Aba | Conteúdo |
|-----|----------|
| `Nome da Loja 1` | Leads da loja (Timestamp, Nome, Email, Telefone, CPF, Porte, Horário) |
| `Nome da Loja 2` | Idem |
| `Nome da Loja 3` | Idem |
| `Controle` | Grid de horários × lojas (célula vazia = disponível, CPF = ocupado) |

A aba **Controle** tem esta estrutura:

| Loja | 10:00 | 10:45 | 11:30 | 12:15 | 13:00 | 14:30 | 15:15 | 16:00 | 16:45 | 17:30 |
|------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| id-loja-1 | | | | | | | | | | |
| id-loja-2 | | | | | | | | | | |
| id-loja-3 | | | | | | | | | | |

### 2. Apps Script

1. Na planilha: **Extensões → Apps Script**
2. Cole o `google-apps-script.js` da pasta correspondente
3. **Implantar → Nova implantação → App da Web**
   - Executar como: Eu
   - Quem pode acessar: Qualquer pessoa
4. Copie a URL gerada

### 3. Frontend

No `index.html`, substitua:

```javascript
const SHEETS_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
```

Atualize também o array `STORES` com endereços e telefones reais.

### 4. Deploy

Suba em qualquer servidor estático. Garanta `Content-Type: text/html`.

## 🔒 Dados Sensíveis

Os seguintes dados foram substituídos por placeholders neste repositório:
- URLs do Google Apps Script
- Endereços das concessionárias
- Telefones das lojas

## 📄 Licença

Projeto interno do Grupo Sinal. Código disponibilizado para referência e portfólio.
