# Quick Redis Commands for Your Application
# Run these from PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Redis Quick Commands" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Check if Redis is running:" -ForegroundColor Yellow
Write-Host "   wsl redis-cli ping" -ForegroundColor White
Write-Host ""

Write-Host "2. View Redis server info:" -ForegroundColor Yellow
Write-Host "   wsl redis-cli INFO server" -ForegroundColor White
Write-Host ""

Write-Host "3. View all email queue keys:" -ForegroundColor Yellow
Write-Host "   wsl redis-cli KEYS 'bull:*'" -ForegroundColor White
Write-Host ""

Write-Host "4. Check queue job count:" -ForegroundColor Yellow
Write-Host "   wsl redis-cli GET 'bull:emailQueue:id'" -ForegroundColor White
Write-Host ""

Write-Host "5. Monitor Redis in real-time:" -ForegroundColor Yellow
Write-Host "   wsl redis-cli MONITOR" -ForegroundColor White
Write-Host ""

Write-Host "6. View all keys in database:" -ForegroundColor Yellow
Write-Host "   wsl redis-cli KEYS '*'" -ForegroundColor White
Write-Host ""

Write-Host "7. Get database size:" -ForegroundColor Yellow
Write-Host "   wsl redis-cli DBSIZE" -ForegroundColor White
Write-Host ""

Write-Host "8. Clear all data (USE WITH CAUTION):" -ForegroundColor Red
Write-Host "   wsl redis-cli FLUSHDB" -ForegroundColor White
Write-Host ""

Write-Host "9. Start Redis if not running:" -ForegroundColor Yellow
Write-Host "   wsl sudo service redis-server start" -ForegroundColor White
Write-Host ""

Write-Host "10. Stop Redis:" -ForegroundColor Yellow
Write-Host "    wsl sudo service redis-server stop" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Current Status:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ping = wsl redis-cli ping 2>&1
if ($ping -eq "PONG") {
    Write-Host "Redis Status: RUNNING" -ForegroundColor Green
    
    $version = wsl redis-cli INFO server 2>&1 | Select-String "redis_version"
    Write-Host "Redis Version: $version" -ForegroundColor Cyan
    
    $dbSize = wsl redis-cli DBSIZE 2>&1
    Write-Host "Keys in Database: $dbSize" -ForegroundColor Cyan
    
    $queueId = wsl redis-cli GET "bull:emailQueue:id" 2>&1
    if ($queueId -match "^\d+$") {
        Write-Host "Email Queue Jobs Processed: $queueId" -ForegroundColor Cyan
    }
} else {
    Write-Host "Redis Status: NOT RUNNING" -ForegroundColor Red
    Write-Host "Start it with: wsl sudo service redis-server start" -ForegroundColor Yellow
}

