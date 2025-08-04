# 🚀 Deploy do SlenoCard na VPS

Este guia te ajudará a hospedar a aplicação SlenoCard na sua VPS usando Docker, Portainer e Traefik.

## 📋 Pré-requisitos

- VPS com Docker instalado
- Portainer configurado
- Traefik configurado como proxy reverso
- Conta no Docker Hub
- Domínio configurado (ex: HostGator)

## 🏗️ Passo 1: Preparar as Imagens Docker

### 1.1 Editar configurações

Antes de fazer o build, edite os seguintes arquivos:

**deploy.ps1 (Windows) ou deploy.sh (Linux/Mac):**

```bash
$DOCKER_USERNAME = "dkalexbatista"  # Substitua pelo seu usuário
```

**docker-compose.yml:**

```yaml
# Substitua todas as ocorrências de:
dkalexbatista -> SEU_USUARIO_DOCKERHUB
slenocard.com.br -> SEU_DOMINIO.com
```

### 1.2 Executar o build

**No Windows (PowerShell):**

```powershell
./deploy.ps1
```

**No Linux/Mac:**

```bash
chmod +x deploy.sh
./deploy.sh
```

Este script irá:

- Fazer build das imagens do backend e frontend
- Enviar as imagens para o Docker Hub
- Mostrar as próximas etapas

## 🐳 Passo 2: Configurar no Portainer

### 2.1 Criar nova Stack

1. Acesse seu Portainer
2. Vá em **Stacks** → **Add Stack**
3. Nome: `slenocard`
4. Cole o conteúdo do arquivo `docker-compose.yml`

### 2.2 Editar variáveis

No docker-compose.yml do Portainer, substitua:

```yaml
# Trocar
image: dkalexbatista/slenocard-backend:latest
# Por
image: SEU_USUARIO_DOCKERHUB/slenocard-backend:latest

# Trocar
- "traefik.http.routers.slenocard-api.rule=Host(\`api.slenocard.com.br\`)"
# Por
- "traefik.http.routers.slenocard-api.rule=Host(\`api.slenocard.com.br\`)"

# E assim por diante para todos os domínios...
```

### 2.3 Configurar variáveis de ambiente

Na seção `environment` do backend, adicione suas variáveis:

```yaml
environment:
  - NODE_ENV=production
  - GOOGLE_API_KEY=sua_chave_real_aqui
  - FRONTEND_URL=https://www.slenocard.com.br
  - API_URL=https://api.slenocard.com.br
```

### 2.4 Deploy da Stack

Clique em **Deploy the stack**

## 🌐 Passo 3: Configurar DNS

### 3.1 No seu provedor de DNS (ex: HostGator)

Crie os seguintes registros tipo **A**:

| Nome/Host          | Tipo | Valor         |
| ------------------ | ---- | ------------- |
| www                | A    | IP_DA_SUA_VPS |
| api                | A    | IP_DA_SUA_VPS |
| @ (ou deixe vazio) | A    | IP_DA_SUA_VPS |

### 3.2 Aguardar propagação

A propagação DNS pode levar de 15 minutos a 24 horas.

## ✅ Passo 4: Verificar se funcionou

### 4.1 Testar o frontend

```
https://www.slenocard.com.br
```

### 4.2 Testar o backend

```
https://api.slenocard.com.br
```

### 4.3 Verificar logs no Portainer

1. Vá em **Containers**
2. Clique no container `slenocard_slenocard-backend_1`
3. Vá na aba **Logs**
4. Faça o mesmo para o frontend

## 🔧 Solução de Problemas

### Erro 502 Bad Gateway

- Verifique se os containers estão rodando
- Verifique os logs dos containers
- Confirme se as portas no docker-compose estão corretas

### Erro SSL/TLS

- Verifique se o Traefik está configurado corretamente
- Confirme se o certresolver está funcionando

### Frontend não carrega

- Verifique se o NGINX está servindo os arquivos
- Confirme se o build do frontend foi bem-sucedido

### API não responde

- Verifique se o backend está rodando na porta 3000
- Confirme se as variáveis de ambiente estão corretas

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça suas alterações no código
2. Execute o script de deploy novamente
3. No Portainer, vá na Stack e clique em **Update the stack**
4. Marque **Re-pull image** e **Prune unused containers**
5. Clique em **Update**

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs dos containers no Portainer
2. Confirme se todas as substituições de variáveis foram feitas
3. Teste se o DNS está propagado: `nslookup slenocard.com.br`

---

**Boa sorte com o deploy! 🚀**
