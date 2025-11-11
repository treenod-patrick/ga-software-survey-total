# PowerShell script to insert data into Supabase
$ErrorActionPreference = "Stop"

$SUPABASE_URL = "https://adschpldrzwzpzxagxzdw.supabase.co"
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI"

Write-Host "🚀 Supabase 데이터 삽입 시작...`n" -ForegroundColor Cyan

# GWS 데이터 삽입
Write-Host "📥 GWS Enterprise 데이터 삽입 중..." -ForegroundColor Yellow
$gwsData = Get-Content -Path "scripts\gws_data.json" -Raw

$gwsHeaders = @{
    "Content-Type" = "application/json"
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Prefer" = "resolution=ignore-duplicates"
}

try {
    $gwsResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/gws_assignments" `
        -Method Post `
        -Headers $gwsHeaders `
        -Body $gwsData

    Write-Host "✅ GWS 데이터 삽입 완료`n" -ForegroundColor Green
} catch {
    Write-Host "❌ GWS 데이터 삽입 오류: $_" -ForegroundColor Red
    Write-Host "상세 오류: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Software 데이터 삽입
Write-Host "📥 소프트웨어 라이선스 데이터 삽입 중..." -ForegroundColor Yellow
$softwareData = Get-Content -Path "scripts\software_data.json" -Raw

$softwareHeaders = @{
    "Content-Type" = "application/json"
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
}

try {
    $softwareResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/software_assignments" `
        -Method Post `
        -Headers $softwareHeaders `
        -Body $softwareData

    Write-Host "✅ 소프트웨어 데이터 삽입 완료`n" -ForegroundColor Green
} catch {
    Write-Host "❌ 소프트웨어 데이터 삽입 오류: $_" -ForegroundColor Red
    Write-Host "상세 오류: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "🎉 모든 작업이 완료되었습니다!" -ForegroundColor Cyan
