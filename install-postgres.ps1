# PostgreSQL Installation Script for Windows
# Run this with Administrator privileges

Write-Host "🚀 Installing PostgreSQL..." -ForegroundColor Cyan

# Install PostgreSQL using Chocolatey
choco install postgresql15 -y

Write-Host "`n✅ PostgreSQL installed!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen your terminal (to refresh PATH)" -ForegroundColor Yellow
Write-Host "2. Set PostgreSQL password:" -ForegroundColor Yellow
Write-Host "   psql -U postgres -c `"ALTER USER postgres PASSWORD 'zed';`"" -ForegroundColor White
Write-Host "3. Create the atlas database:" -ForegroundColor Yellow
Write-Host "   psql -U postgres -c `"CREATE DATABASE atlas;`"" -ForegroundColor White
Write-Host "4. Update .env.local with password: zed" -ForegroundColor Yellow
Write-Host "5. Run: npm run db:init" -ForegroundColor Yellow
Write-Host "6. Run: npm run dev" -ForegroundColor Yellow
