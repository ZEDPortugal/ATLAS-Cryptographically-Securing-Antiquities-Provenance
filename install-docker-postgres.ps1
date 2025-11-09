# Docker PostgreSQL Setup Script
# Run this with Administrator privileges

Write-Host "🚀 Installing Docker Desktop..." -ForegroundColor Cyan

# Install Docker Desktop using Chocolatey
choco install docker-desktop -y

Write-Host "`n✅ Docker Desktop installed!" -ForegroundColor Green
Write-Host "`n⚠️  IMPORTANT: You need to:" -ForegroundColor Yellow
Write-Host "1. Restart your computer" -ForegroundColor White
Write-Host "2. Open Docker Desktop from Start Menu" -ForegroundColor White
Write-Host "3. Wait for Docker to start (look for whale icon in system tray)" -ForegroundColor White
Write-Host "`n📋 After Docker is running, run this command:" -ForegroundColor Cyan
Write-Host "docker run --name atlas-postgres -e POSTGRES_PASSWORD=zed -e POSTGRES_DB=atlas -p 5432:5432 -d postgres:15" -ForegroundColor White
Write-Host "`n🎉 Then you can run: npm run dev" -ForegroundColor Green
