# PowerShell script to reset WSL password
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WSL Password Reset Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Step 1: Accessing WSL as root..." -ForegroundColor Green
Write-Host ""
Write-Host "You will now enter WSL as root user." -ForegroundColor Yellow
Write-Host "Once inside, run this command to reset your password:" -ForegroundColor Yellow
Write-Host "   passwd upadhya" -ForegroundColor White
Write-Host ""
Write-Host "Then type 'exit' to return to Windows." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Try to access WSL as root
Write-Host ""
Write-Host "Opening WSL as root..." -ForegroundColor Cyan
wsl -u root

Write-Host ""
Write-Host "If you successfully changed your password, you can now use sudo commands." -ForegroundColor Green
Write-Host "Test it by running: wsl sudo whoami" -ForegroundColor Gray

