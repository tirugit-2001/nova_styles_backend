# How to Reset WSL Password

## Method 1: Reset Password from Windows PowerShell (Easiest)

1. Open **PowerShell as Administrator** (right-click → Run as Administrator)

2. Reset the default user password:
```powershell
wsl -u root
```

3. Once in WSL as root, reset your user password:
```bash
passwd upadhya
```
Enter your new password twice.

4. Exit root:
```bash
exit
```

## Method 2: Set Default User to Root (Alternative)

If Method 1 doesn't work, you can set root as default user temporarily:

```powershell
# Open PowerShell as Administrator
wsl --distribution Ubuntu --user root
```

Then change password:
```bash
passwd upadhya
```

## Method 3: Change Password (If you remember current password)

If you remember your current password but just typed it wrong, you can change it normally:

```bash
passwd
```
(No sudo needed - this changes your own password)

## Method 4: Reset via Windows Registry (Advanced)

If the above methods don't work:

1. Open PowerShell as Administrator
2. Find your distribution name:
```powershell
wsl --list --verbose
```

3. Reset the default user to root:
```powershell
ubuntu config --default-user root
```

4. Then open WSL and reset password:
```bash
passwd upadhya
```

5. Set default user back:
```powershell
ubuntu config --default-user upadhya
```

## Notes

- The sudo password is the same as your user password
- After 3 failed attempts, you need to wait a few minutes or use root access
- Make sure you're typing the password correctly (check Caps Lock)

