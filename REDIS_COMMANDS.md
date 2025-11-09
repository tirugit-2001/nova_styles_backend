# Redis Commands for Ubuntu/WSL

## Start Redis

### Option 1: Start as a service (Recommended)
```bash
wsl sudo service redis-server start
```

### Option 2: Start in daemon mode
```bash
wsl redis-server --daemonize yes
```

### Option 3: Start Redis directly (foreground)
```bash
wsl redis-server
```

## Stop Redis

```bash
wsl sudo service redis-server stop
```

## Restart Redis

```bash
wsl sudo service redis-server restart
```

## Check if Redis is running

```bash
wsl redis-cli ping
```
Expected output: `PONG`

## Redis Status

```bash
wsl sudo service redis-server status
```

## Connect to Redis CLI

```bash
wsl redis-cli
```

## Make Redis start automatically on boot

```bash
wsl sudo systemctl enable redis-server
```

## Quick Start Script

You can also use the PowerShell script:
```powershell
.\start-redis-wsl.ps1
```

## Troubleshooting

If your Node.js app can't connect to Redis:
1. Make sure Redis is running: `wsl redis-cli ping`
2. Check if port 6379 is accessible: `Test-NetConnection -ComputerName localhost -Port 6379`
3. Restart your Node.js application after starting Redis
4. Verify your `.env` file has correct Redis settings (or uses defaults: 127.0.0.1:6379)

