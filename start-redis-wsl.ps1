# PowerShell script to start Redis in WSL Ubuntu

Write-Host "Checking Redis status in WSL..." -ForegroundColor Cyan

# Check if Redis is running
$redisStatus = wsl redis-cli ping 2>&1
if ($redisStatus -eq "PONG") {
    Write-Host "Redis is already running!" -ForegroundColor Green
    Write-Host "Redis is responding on WSL" -ForegroundColor Cyan
} else {
    Write-Host "Redis is not running. Starting Redis server..." -ForegroundColor Yellow
    
    # Start Redis as a service
    wsl sudo service redis-server start
    
    # Wait a moment for Redis to start
    Start-Sleep -Seconds 2
    
    # Verify it's running
    $redisStatus = wsl redis-cli ping 2>&1
    if ($redisStatus -eq "PONG") {
        Write-Host "Redis started successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to start Redis. Trying alternative method..." -ForegroundColor Red
        
        # Try starting Redis server directly in background
        Write-Host "Starting Redis server in daemon mode..." -ForegroundColor Yellow
        wsl redis-server --daemonize yes
        
        Start-Sleep -Seconds 2
        $redisStatus = wsl redis-cli ping 2>&1
        if ($redisStatus -eq "PONG") {
            Write-Host "Redis started successfully!" -ForegroundColor Green
        } else {
            Write-Host "Failed to start Redis. Please check Redis installation." -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "Redis Connection Information:" -ForegroundColor Cyan
Write-Host "   Host: 127.0.0.1 (localhost)" -ForegroundColor White
Write-Host "   Port: 6379" -ForegroundColor White
Write-Host ""
Write-Host "Useful Redis commands:" -ForegroundColor Cyan
Write-Host "   Stop Redis:   wsl sudo service redis-server stop" -ForegroundColor Gray
Write-Host "   Restart Redis: wsl sudo service redis-server restart" -ForegroundColor Gray
Write-Host "   Check status: wsl redis-cli ping" -ForegroundColor Gray
Write-Host "   Redis CLI:    wsl redis-cli" -ForegroundColor Gray
