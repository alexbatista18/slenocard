# Script PowerShell para fazer build e push das imagens Docker
# Execute este script na raiz do projeto

# Configurações - ALTERE ESTAS VARIÁVEIS
$DOCKER_USERNAME = "dkalexbatista"
$PROJECT_NAME = "slenocard"
$VERSION = "latest"

Write-Host "Iniciando build e deploy do SlenoCard..." -ForegroundColor Yellow

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker não está rodando! Inicie o Docker primeiro." -ForegroundColor Red
    exit 1
}

# Fazer login no Docker Hub
Write-Host "Fazendo login no Docker Hub..." -ForegroundColor Yellow
docker login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha no login do Docker Hub!" -ForegroundColor Red
    exit 1
}

# Build da imagem do backend
Write-Host "Construindo imagem do backend..." -ForegroundColor Yellow
docker build -f Dockerfile.server -t "${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha no build do backend!" -ForegroundColor Red
    exit 1
}

# Build da imagem do frontend
Write-Host "Construindo imagem do frontend..." -ForegroundColor Yellow
docker build -f Dockerfile.client -t "${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha no build do frontend!" -ForegroundColor Red
    exit 1
}

# Push da imagem do backend
Write-Host "Enviando imagem do backend para Docker Hub..." -ForegroundColor Yellow
docker push "${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha no push do backend!" -ForegroundColor Red
    exit 1
}

# Push da imagem do frontend
Write-Host "Enviando imagem do frontend para Docker Hub..." -ForegroundColor Yellow
docker push "${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha no push do frontend!" -ForegroundColor Red
    exit 1
}

Write-Host "Build e deploy concluídos com sucesso!" -ForegroundColor Green
Write-Host "Próximos passos:" -ForegroundColor Green
Write-Host "1. Acesse seu Portainer"
Write-Host "2. Crie uma nova Stack"
Write-Host "3. Cole o conteúdo do arquivo docker-compose.yml"
Write-Host "4. Substitua 'dkalexbatista' por '$DOCKER_USERNAME'"
Write-Host "5. Substitua 'slenocard.com.br' pelo seu domínio real"
Write-Host "6. Deploy a stack!"

Write-Host "Imagens criadas:" -ForegroundColor Yellow
Write-Host "Backend:  $DOCKER_USERNAME/$PROJECT_NAME-backend:$VERSION"
Write-Host "Frontend: $DOCKER_USERNAME/$PROJECT_NAME-frontend:$VERSION"