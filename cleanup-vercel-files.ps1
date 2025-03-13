# Cleanup script for temporary Vercel deployment files

Write-Host "Cleaning up temporary Vercel deployment files..."

# Remove any temporary environment variable files
Remove-Item "*.tmp" -Force -ErrorAction SilentlyContinue
Remove-Item "env_value.txt" -Force -ErrorAction SilentlyContinue
Remove-Item ".env-temp" -Force -ErrorAction SilentlyContinue
Remove-Item ".vercel-env-temp" -Force -ErrorAction SilentlyContinue

# Remove any Vercel temporary directories
if (Test-Path ".vercel" -PathType Container) {
    Remove-Item ".vercel" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Removed .vercel directory in root"
}

if (Test-Path "frontend/.vercel" -PathType Container) {
    Remove-Item "frontend/.vercel" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Removed .vercel directory in frontend"
}

# Remove any script-generated files
Remove-Item "NEXT_PUBLIC_*.tmp" -Force -ErrorAction SilentlyContinue
Remove-Item "SUPABASE_*.tmp" -Force -ErrorAction SilentlyContinue

Write-Host "Cleanup complete!"
Write-Host "You can now deploy your project using the Vercel dashboard."
Write-Host "Follow the instructions in vercel-dashboard-deployment.md" 