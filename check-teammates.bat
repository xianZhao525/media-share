@echo off
chcp 65001 > nul
echo 🔍 检查团队成员进度
echo ===============================
echo.

echo 📅 检查时间: %date% %time%
echo.

echo 📡 获取远程分支信息...
git fetch origin 2>nul
echo.

echo 👥 各成员分支状态：
echo.

echo 角色一（登录/注册）:
git log --oneline origin/feature/login -n 1 2>nul && (
    for /f "tokens=2-" %%i in ('git log --oneline origin/feature/login -n 1 2^>nul') do echo    ✅ 最新提交: %%i
    git ls-tree -r origin/feature/login --name-only | find /c /v "" > temp_count.txt
    set /p file_count=<temp_count.txt
    echo    📁 文件数: %file_count%
    del temp_count.txt
) || echo    ❌ 分支不存在或没有提交
echo.

echo 角色二（内容管理）:
git log --oneline origin/feature/items -n 1 2>nul && (
    for /f "tokens=2-" %%i in ('git log --oneline origin/feature/items -n 1 2^>nul') do echo    ✅ 最新提交: %%i
    git ls-tree -r origin/feature/items --name-only | findstr "vue" | find /c /v "" > temp_count.txt
    set /p vue_count=<temp_count.txt
    echo    🎨 Vue组件: %vue_count%
    del temp_count.txt
) || echo    ❌ 分支不存在或没有提交
echo.

echo 角色三（评论评分）:
git log --oneline origin/feature/reviews -n 1 2>nul && (
    for /f "tokens=2-" %%i in ('git log --oneline origin/feature/reviews -n 1 2^>nul') do echo    ✅ 最新提交: %%i
) || echo    ❌ 分支不存在或没有提交
echo.

echo 角色四（社交动态）:
git log --oneline origin/feature/feed -n 1 2>nul && (
    for /f "tokens=2-" %%i in ('git log --oneline origin/feature/feed -n 1 2^>nul') do echo    ✅ 最新提交: %%i
) || echo    ❌ 分支不存在或没有提交
echo.

echo 角色五（搜索功能）- 你:
git log --oneline origin/feature/search -n 1 2>nul && (
    for /f "tokens=2-" %%i in ('git log --oneline origin/feature/search -n 1 2^>nul') do echo    ✅ 最新提交: %%i
) || echo    ⚠️  请先推送你的代码: git push origin feature/search
echo.

echo ===============================
echo 💡 使用说明：
echo 1. 每天早上下载组员代码: daily-sync.bat
echo 2. 开发前检查进度: check-teammates.bat  
echo 3. 开发后提交代码: 
echo    git add . & git commit -m "描述" & git push
echo ===============================
pause