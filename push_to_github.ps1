# Meta Pro Automation - GitHub Push Script (PowerShell)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "     🚀 سكريبت رفع مشروع Meta Pro Suite الموحد إلى GitHub" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# Verify Git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git غير مثبت على جهازك أو غير مضاف إلى متغيرات النظام (PATH)." -ForegroundColor Red
    Write-Host "يرجى تحميل وتثبيت Git من: https://git-scm.com/" -ForegroundColor Gray
    Read-Host "اضغط Enter للخروج..."
    exit 1
}

$repoUrl = Read-Host "أدخل رابط مستودع GitHub الخاص بك (Repository URL)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "[ERROR] لم تقم بإدخال رابط المستودع. تم إلغاء العملية." -ForegroundColor Red
    Read-Host "اضغط Enter للخروج..."
    exit 1
}

Write-Host "`n[1/5] تهيئة مستودع Git المحلي..." -ForegroundColor Green
if (-not (Test-Path ".git")) {
    git init
} else {
    Write-Host "مستودع Git مهيأ مسبقاً." -ForegroundColor Gray
}

Write-Host "`n[2/5] إعداد الفرع الرئيسي (main)..." -ForegroundColor Green
git branch -M main

Write-Host "`n[3/5] ربط المستودع البعيد (Remote Origin)..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin $repoUrl.Trim()
Write-Host "تم ربط المستودع: $repoUrl" -ForegroundColor Cyan

Write-Host "`n[4/5] تجهيز الملفات والتسجيل (Staging & Commit)..." -ForegroundColor Green
git add .
git commit -m "feat: unified Meta Pro Suite and WhatsApp Pro CRM omnichannel platform"

Write-Host "`n[5/5] رفع الكود إلى GitHub (Push to main)..." -ForegroundColor Green
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n====================================================================" -ForegroundColor Cyan
    Write-Host "  🎉 تم رفع المشروع بنجاح تام إلى GitHub!" -ForegroundColor Green
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "الآن يمكنك فتح منصة Vercel والربط مع هذا المستودع بضغطة واحدة.`n" -ForegroundColor Yellow
} else {
    Write-Host "`n====================================================================" -ForegroundColor Red
    Write-Host "  ⚠️ حدث خطأ أثناء الرفع!" -ForegroundColor Red
    Write-Host "====================================================================" -ForegroundColor Red
    Write-Host "يرجى التأكد من صحة الرابط وصلاحيات الحساب في GitHub.`n" -ForegroundColor Yellow
}

Read-Host "اضغط Enter للخروج..."
