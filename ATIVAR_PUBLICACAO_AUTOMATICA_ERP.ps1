$ErrorActionPreference = "Stop"

git config core.hooksPath .githooks
Write-Host "Publicacao automatica ativada."
Write-Host "Ao commitar no TEAjudando, o ERP sera sincronizado e publicado pelo comando pnpm run comunicatea:publish."
