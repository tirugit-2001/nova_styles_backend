# PowerShell script to start Redis using Docker

Write-Host "🚀 Starting Redis with Docker..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker ps > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        Write-Host "   You can start it from the Start Menu or run: Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Docker is not installed or not running." -ForegroundColor Red
    exit 1
}

# Check if Redis container already exists
$containerExists = docker ps -a --filter "name=redis-nova-styles" --format "{{.Names}}"
if ($containerExists -eq "redis-nova-styles") {
    Write-Host "📦 Redis container already exists. Checking if it's running..." -ForegroundColor Yellow
    
    $containerRunning = docker ps --filter "name=redis-nova-styles" --format "{{.Names}}"
    if ($containerRunning -eq "redis-nova-styles") {
        Write-Host "✅ Redis is already running!" -ForegroundColor Green
        Write-Host "   Redis is available at: 127.0.0.1:6379" -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "🔄 Starting existing Redis container..." -ForegroundColor Yellow
        docker start redis-nova-styles
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Redis started successfully!" -ForegroundColor Green
            Write-Host "   Redis is available at: 127.0.0.1:6379" -ForegroundColor Cyan
            exit 0
        } else {
            Write-Host "❌ Failed to start Redis container." -ForegroundColor Red
            exit 1
        }
    }
}

# Create and start new Redis container
Write-Host "📦 Creating new Redis container..." -ForegroundColor Yellow
docker run -d -p 6379:6379 --name redis-nova-styles redis:latest

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Redis started successfully!" -ForegroundColor Green
    Write-Host "   Redis is available at: 127.0.0.1:6379" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To stop Redis, run: docker stop redis-nova-styles" -ForegroundColor Gray
    Write-Host "To remove Redis, run: docker rm -f redis-nova-styles" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to start Redis. Make sure Docker Desktop is running." -ForegroundColor Red
    exit 1
}

