#!/bin/bash

# Script para fazer build e push das imagens Docker
# Execute este script na raiz do projeto

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações - ALTERE ESTAS VARIÁVEIS
DOCKER_USERNAME="dkalexbatista"
PROJECT_NAME="slenocard"
VERSION="latest"

echo -e "${YELLOW}🚀 Iniciando build e deploy do SlenoCard...${NC}"

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando! Inicie o Docker primeiro.${NC}"
    exit 1
fi

# Fazer login no Docker Hub
echo -e "${YELLOW}🔐 Fazendo login no Docker Hub...${NC}"
docker login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no login do Docker Hub!${NC}"
    exit 1
fi

# Build da imagem do backend
echo -e "${YELLOW}🏗️ Construindo imagem do backend...${NC}"
docker build -f Dockerfile.server -t ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no build do backend!${NC}"
    exit 1
fi

# Build da imagem do frontend
echo -e "${YELLOW}🏗️ Construindo imagem do frontend...${NC}"
docker build -f Dockerfile.client -t ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no build do frontend!${NC}"
    exit 1
fi

# Push da imagem do backend
echo -e "${YELLOW}📤 Enviando imagem do backend para Docker Hub...${NC}"
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no push do backend!${NC}"
    exit 1
fi

# Push da imagem do frontend
echo -e "${YELLOW}📤 Enviando imagem do frontend para Docker Hub...${NC}"
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no push do frontend!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build e deploy concluídos com sucesso!${NC}"
echo -e "${GREEN}📋 Próximos passos:${NC}"
echo -e "1. Acesse seu Portainer"
echo -e "2. Crie uma nova Stack"
echo -e "3. Cole o conteúdo do arquivo docker-compose.yml"
echo -e "4. Substitua 'dkalexbatista' por '${DOCKER_USERNAME}'"
echo -e "5. Substitua 'slenocard.com.br' pelo seu domínio real"
echo -e "6. Deploy a stack!"

echo -e "${YELLOW}📦 Imagens criadas:${NC}"
echo -e "Backend:  ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION}"
echo -e "Frontend: ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}"
