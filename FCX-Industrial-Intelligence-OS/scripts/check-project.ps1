$ErrorActionPreference = "Continue"

function Test-Command {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Command
  )

  Write-Host ""
  Write-Host "== $Name =="
  try {
    Invoke-Expression $Command
  } catch {
    Write-Host "Nao encontrado ou indisponivel: $Name"
  }
}

Write-Host "FCX Industrial Intelligence OS - Verificacao local"
Write-Host "Pasta atual: $(Get-Location)"

Test-Command -Name "Node.js" -Command "node --version"
Test-Command -Name "npm" -Command "npm --version"
Test-Command -Name "Docker" -Command "docker --version"
Test-Command -Name "Docker Compose" -Command "docker compose version"

Write-Host ""
Write-Host "== Estrutura do projeto =="

$items = @(
  "backend",
  "frontend",
  "docker-compose.yml"
)

foreach ($item in $items) {
  if (Test-Path $item) {
    Write-Host "OK: $item"
  } else {
    Write-Host "FALTANDO: $item"
  }
}
