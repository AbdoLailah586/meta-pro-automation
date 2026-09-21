@echo off
chcp 65001 >nul
title Meta Pro Automation - رفع المشروع إلى GitHub
cls

echo ====================================================================
echo      🚀 سكريبت رفع مشروع Meta Pro Suite الموحد إلى GitHub
echo ====================================================================
echo.

:: فحص وجود Git
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git غير مثبت على جهازك أو غير مضاف إلى متغيرات النظام (PATH).
    echo يرجى تحميل وتثبيت Git من: https://git-scm.com/
    echo.
    pause
    exit /b 1
)

echo يرجى إدخال رابط مستودع GitHub الخاص بك (Repository URL):
echo مثال: https://github.com/your-username/meta-pro-automation.git
echo.
set /p REPO_URL="رابط الريبو (GitHub URL): "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] لم تقم بإدخال رابط المستودع. تم إلغاء العملية.
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================================================
echo [1/5] تهيئة مستودع Git المحلي...
echo ====================================================================
if not exist ".git" (
    git init
) else (
    echo مستودع Git مهيأ مسبقاً.
)

echo.
echo ====================================================================
echo [2/5] إعداد الفرع الرئيسي (main)...
echo ====================================================================
git branch -M main

echo.
echo ====================================================================
echo [3/5] ربط المستودع البعيد (Remote Origin)...
echo ====================================================================
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%
echo تم ربط المستودع: %REPO_URL%

echo.
echo ====================================================================
echo [4/5] تجهيز الملفات والتسجيل (Staging & Commit)...
echo ====================================================================
git add .
git commit -m "feat: unified Meta Pro Suite and WhatsApp Pro CRM omnichannel platform"

echo.
echo ====================================================================
echo [5/5] رفع الكود إلى GitHub (Push to main)...
echo ====================================================================
git push -u origin main --force

if %ERRORLEVEL% equ 0 (
    echo.
    echo ====================================================================
    echo   🎉 تم رفع المشروع بنجاح تام إلى GitHub!
    echo ====================================================================
    echo الآن يمكنك فتح منصة Vercel والربط مع هذا المستودع بضغطة واحدة.
    echo.
) else (
    echo.
    echo ====================================================================
    echo   ⚠️ حدث خطأ أثناء الرفع!
    echo ====================================================================
    echo يرجى التأكد من:
    echo 1. صحة رابط المستودع: %REPO_URL%
    echo 2. تسجيل دخولك إلى حساب GitHub في المتصفح أو عبر Personal Access Token.
    echo.
)

pause
