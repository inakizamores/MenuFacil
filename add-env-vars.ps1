$envVars = @(
    @{Key="NEXT_PUBLIC_SUPABASE_URL"; Value="https://iawspochdngompqmxyhf.supabase.co"},
    @{Key="NEXT_PUBLIC_SUPABASE_ANON_KEY"; Value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhd3Nwb2NoZG5nb21wcW14eWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Nzg5NDEsImV4cCI6MjA1NzU1NDk0MX0.-HRwbkfWKV8U34gOIpk5OqlwFoPyQbWqT-aQImfQ324"},
    @{Key="SUPABASE_SERVICE_ROLE_KEY"; Value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhd3Nwb2NoZG5nb21wcW14eWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTk3ODk0MSwiZXhwIjoyMDU3NTU0OTQxfQ.BE45wSbvYv66L00kJTMkBkRNnVefbLrLkbgDJ4DDX5A"},
    @{Key="SUPABASE_JWT_SECRET"; Value="oz4uCIiuVTQpMtfuRVFDOwz3wXp7ZdkhTHelMMnNG3IidZcDRxAmYsCPfJ+0ITsmc428DdWoYrCQQVaozltftA=="},
    @{Key="NEXT_PUBLIC_STORAGE_BUCKET"; Value="menufacil-storage"},
    @{Key="NEXT_PUBLIC_APP_URL"; Value='${VERCEL_URL}'},
    @{Key="NEXT_PUBLIC_SITE_URL"; Value='${VERCEL_URL}'},
    @{Key="NEXT_PUBLIC_VERCEL_URL"; Value='${VERCEL_URL}'}
)

$vercelToken = "HvTctYRFmuMR192ydn7uEvhD"
$projectId = "prj_Ts6nooJC1r8MYWxylC9a2fKSH1lB"

foreach ($envVar in $envVars) {
    $headers = @{
        "Authorization" = "Bearer $vercelToken"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        "type" = "encrypted"
        "key" = $envVar.Key
        "value" = $envVar.Value
        "target" = @("production")
    } | ConvertTo-Json
    
    Write-Host "Adding $($envVar.Key)..."
    
    try {
        Invoke-RestMethod -Method POST -Uri "https://api.vercel.com/v9/projects/$projectId/env" -Headers $headers -Body $body
        Write-Host "Successfully added $($envVar.Key)" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to add $($envVar.Key): $_" -ForegroundColor Red
    }
} 