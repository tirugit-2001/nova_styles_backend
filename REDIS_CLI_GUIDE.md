# Redis CLI Guide

## Basic Connection

### Connect to Redis CLI from Windows PowerShell:
```powershell
wsl redis-cli
```

### Connect to Redis CLI from WSL Terminal:
```bash
redis-cli
```

## Basic Commands

### Check if Redis is running:
```bash
wsl redis-cli ping
```
Expected output: `PONG`

### Get Redis server information:
```bash
wsl redis-cli info
```

### Get specific server info:
```bash
wsl redis-cli info server
```

### Check Redis version:
```bash
wsl redis-cli --version
# or
wsl redis-cli info server | grep redis_version
```

## Queue Management (for BullMQ)

Since your app uses BullMQ for email queues, here are useful commands:

### List all keys (queues):
```bash
wsl redis-cli KEYS *
```

### Check queue keys (BullMQ specific):
```bash
wsl redis-cli KEYS "bull:*"
```

### Get all email queue keys:
```bash
wsl redis-cli KEYS "bull:email:*"
```

### Check queue length:
```bash
wsl redis-cli LLEN "bull:email:waiting"
wsl redis-cli LLEN "bull:email:active"
wsl redis-cli LLEN "bull:email:completed"
wsl redis-cli LLEN "bull:email:failed"
```

### View queue jobs:
```bash
# View waiting jobs
wsl redis-cli LRANGE "bull:email:waiting" 0 -1

# View failed jobs
wsl redis-cli LRANGE "bull:email:failed" 0 -1
```

### Clear all queue data (use with caution):
```bash
wsl redis-cli FLUSHDB
```

### Clear only BullMQ queues:
```bash
wsl redis-cli --eval "return redis.call('del', unpack(redis.call('keys', 'bull:*')))" 0
```

## Database Operations

### Select database (default is 0):
```bash
wsl redis-cli SELECT 0
```

### Check database size:
```bash
wsl redis-cli DBSIZE
```

### Get all keys:
```bash
wsl redis-cli KEYS *
```

### Count keys:
```bash
wsl redis-cli DBSIZE
```

### Get key value:
```bash
wsl redis-cli GET "key-name"
```

### Check if key exists:
```bash
wsl redis-cli EXISTS "key-name"
```

### Delete a key:
```bash
wsl redis-cli DEL "key-name"
```

### Set TTL (Time To Live) on a key:
```bash
wsl redis-cli EXPIRE "key-name" 3600
```

## Monitoring

### Monitor all Redis commands in real-time:
```bash
wsl redis-cli MONITOR
```

### Get Redis statistics:
```bash
wsl redis-cli INFO stats
```

### Get memory usage:
```bash
wsl redis-cli INFO memory
```

### Get client connections:
```bash
wsl redis-cli INFO clients
```

## Configuration

### Get configuration:
```bash
wsl redis-cli CONFIG GET "*"
```

### Get specific config:
```bash
wsl redis-cli CONFIG GET "maxmemory"
```

## Useful One-Liners for Your App

### Check if email queue is working:
```bash
wsl redis-cli KEYS "bull:email:*" | wc -l
```

### View all email queue keys:
```bash
wsl redis-cli KEYS "bull:email:*"
```

### Check queue statistics:
```bash
wsl redis-cli --stat
```

### Get Redis memory usage:
```bash
wsl redis-cli INFO memory | grep used_memory_human
```

## Interactive Mode

Once you're in Redis CLI (`wsl redis-cli`), you can:

- Type commands directly: `KEYS *`, `GET key`, etc.
- Use Tab for autocomplete
- Use arrow keys for command history
- Type `HELP` for help on any command
- Type `exit` or `quit` to exit

## Examples for Your Application

### Check if email queue has jobs:
```bash
wsl redis-cli EXISTS "bull:email:waiting"
```

### Count waiting email jobs:
```bash
wsl redis-cli LLEN "bull:email:waiting"
```

### Clear failed email jobs:
```bash
wsl redis-cli DEL "bull:email:failed"
```

### View recent email queue activity:
```bash
wsl redis-cli MONITOR
```
(Press Ctrl+C to stop monitoring)

## Troubleshooting

### Connection refused?
```bash
# Check if Redis is running
wsl redis-cli ping

# If not, start it
wsl sudo service redis-server start
```

### Permission denied?
Make sure Redis is running and accessible:
```bash
wsl sudo service redis-server status
```

### Check Redis logs:
```bash
wsl tail -f /var/log/redis/redis-server.log
```

