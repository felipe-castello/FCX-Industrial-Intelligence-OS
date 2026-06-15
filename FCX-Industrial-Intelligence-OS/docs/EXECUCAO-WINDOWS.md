# Execucao local no Windows

Este guia prepara a execucao local do FCX Industrial Intelligence OS em Windows usando PowerShell, Node.js LTS e Docker Desktop.

## 1. Instalar Node.js LTS

1. Acesse https://nodejs.org/
2. Baixe a versao LTS.
3. Instale mantendo a opcao de adicionar Node.js ao PATH.
4. Feche e abra novamente o PowerShell.
5. Verifique:

```powershell
node --version
npm --version
```

## 2. Instalar Docker Desktop

1. Acesse https://www.docker.com/products/docker-desktop/
2. Instale o Docker Desktop para Windows.
3. Abra o Docker Desktop e aguarde ele iniciar completamente.
4. Verifique no PowerShell:

```powershell
docker --version
docker compose version
```

## 3. Abrir PowerShell na pasta do projeto

```powershell
cd "C:\Users\wanderson\Documents\FCX Inteligent OS\FCX-Industrial-Intelligence-OS\FCX-Industrial-Intelligence-OS"
```

Opcionalmente, rode o script de checagem:

```powershell
.\scripts\check-project.ps1
```

## 4. Preparar variaveis de ambiente

Na raiz do projeto:

```powershell
Copy-Item .env.example .env
```

Para execucao separada do backend e frontend:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

## 5. Rodar infraestrutura com Docker

Para subir todos os servicos em segundo plano:

```powershell
docker compose up -d
```

Para acompanhar logs:

```powershell
docker compose logs -f
```

Para parar:

```powershell
docker compose down
```

## 6. Rodar backend localmente

Se quiser rodar o backend fora do container, mantenha PostgreSQL/TimescaleDB, Redis e EMQX ativos pelo Docker:

```powershell
docker compose up -d postgres redis emqx grafana
```

Depois:

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run start:dev
```

O backend ficara disponivel em:

```text
http://localhost:3000
```

## 7. Rodar frontend localmente

Abra outro PowerShell:

```powershell
cd "C:\Users\wanderson\Documents\FCX Inteligent OS\FCX-Industrial-Intelligence-OS\FCX-Industrial-Intelligence-OS\frontend"
npm install
npm run dev
```

O frontend ficara disponivel em:

```text
http://localhost:5173
```

## 8. URLs de teste

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Backend Health: http://localhost:3000/health
- Grafana: http://localhost:3001
- EMQX Dashboard: http://localhost:18083

## 9. Simulador MQTT

Com o backend e o EMQX ativos:

```powershell
cd backend
npm run mqtt:simulator
```

O simulador publica telemetria a cada 5 segundos em:

```text
fcx/telemetry/{assetId}
```
