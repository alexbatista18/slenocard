# SlenoCard - Landing Page

Transforme Clientes em Avaliações 5 Estrelas

## 🚀 Sobre o Projeto

O SlenoCard é uma landing page moderna desenvolvida com React, TypeScript e Tailwind CSS. O projeto foi migrado do Replit para rodar localmente sem dependências da plataforma.

**✅ Migração Completa do Replit:**

- ✅ Removidas dependências específicas do Replit
- ✅ Configuração otimizada para rodar localmente
- ✅ SEO otimizado com meta tags completas
- ✅ Compatível com Coolify e outras plataformas
- ✅ Removidas referências ao banco de dados
- ✅ Scripts otimizados para Windows e Linux

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Build Tool**: Vite
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd AvaliaCard
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   cp env.example .env
   ```

   Edite o arquivo `.env` com suas configurações:

   ```env
   # Configurações do Servidor
   FRONTEND_PORT=80
   BACKEND_PORT=5000
   SERVER_HOST=0.0.0.0

   # Configurações de Domínio (opcional)
   DOMAIN=

   # Configurações de Ambiente
   NODE_ENV=development

   # API Keys
   GOOGLE_API_KEY=your_google_api_key_here
   APPMAX_ACCESS_TOKEN=your_appmax_access_token_here

   # Configurações do Coolify (opcional)
   COOLIFY_DEPLOYMENT=true
   ```

## 🚀 Como Executar

### Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Rede**: http://[seu-ip]:3000

### Desenvolvimento Separado

```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

### Produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
AvaliaCard/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários
│   ├── public/            # Arquivos estáticos
│   └── index.html         # HTML principal
├── server/                # Backend Express
│   ├── index.ts           # Servidor principal
│   ├── routes.ts          # Definição de rotas
│   └── vite.ts            # Configuração Vite
├── attached_assets/       # Assets do projeto
└── shared/               # Código compartilhado
```

## 🔧 Configurações

### Portas

- **Frontend**: 3000 (desenvolvimento) / 80 (produção)
- **Backend API**: 5000 (configurável via BACKEND_PORT)

### Variáveis de Ambiente

| Variável              | Descrição                         | Padrão      |
| --------------------- | --------------------------------- | ----------- |
| `FRONTEND_PORT`       | Porta do servidor frontend        | 80          |
| `BACKEND_PORT`        | Porta da API backend              | 5000        |
| `SERVER_HOST`         | Host do servidor                  | 0.0.0.0     |
| `DOMAIN`              | Domínio customizado (opcional)    | -           |
| `NODE_ENV`            | Ambiente de execução              | development |
| `GOOGLE_API_KEY`      | Chave da API do Google Places     | -           |
| `APPMAX_ACCESS_TOKEN` | Token de acesso da Appmax         | -           |
| `COOLIFY_DEPLOYMENT`  | Habilita configurações do Coolify | false       |

## 🚀 Deploy

### Coolify (Recomendado)

1. Conecte seu repositório ao Coolify
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Node.js:

- Vercel
- Netlify
- Railway
- Heroku

## 🐛 Solução de Problemas

### Erro de Porta em Uso

Se a porta 80 estiver ocupada, altere a variável `FRONTEND_PORT` no arquivo `.env`:

```env
FRONTEND_PORT=3000
```

### Erro de Permissão (Linux/Mac)

Para usar a porta 80, execute com sudo:

```bash
sudo npm run dev
```

### Problemas de Build

Limpe o cache e reinstale as dependências:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Scripts Disponíveis

| Comando                | Descrição                                       |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Inicia o servidor completo (frontend + backend) |
| `npm run dev:frontend` | Inicia apenas o frontend (porta 3000)           |
| `npm run dev:backend`  | Inicia apenas o backend (porta 5000)            |
| `npm run build`        | Gera build de produção                          |
| `npm start`            | Inicia o servidor de produção                   |
| `npm run check`        | Verifica tipos TypeScript                       |

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para suporte@slenocard.com.br ou abra uma issue no repositório.
