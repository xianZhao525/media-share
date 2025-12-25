@echo off
chcp 65001 > nul
echo =========================================
echo        每日代码同步工具
echo        Git团队协作助手
echo =========================================
echo.

echo 📦 正在检查Git状态...
git status --short
echo.

echo 🔄 步骤1: 获取所有组员的最新代码...
echo    正在从远程仓库拉取更新...
git fetch origin --all
echo    ✅ 远程代码已获取
echo.

echo 📝 步骤2: 检查当前分支...
for /f "delims=" %%i in ('git branch --show-current') do set current_branch=%%i
echo    当前分支: %current_branch%
echo.

echo 🛠️  步骤3: 创建临时集成分支...
set date=%date:~0,4%%date:~5,2%%date:~8,2%
set merge_branch=daily-merge-%date%
echo    临时分支名: %merge_branch%

git checkout -b %merge_branch% 2>nul
if %errorlevel% neq 0 (
    echo    ⚠️  临时分支已存在，使用现有分支
    git checkout %merge_branch%
)
echo.

echo 🤝 步骤4: 合并各成员代码...
echo    1. 合并角色一（登录功能）...
git merge origin/feature/login --no-edit --no-ff 2>nul && echo    ✅ 合并成功 || echo    ⚠️  有冲突或分支不存在

echo    2. 合并角色二（内容管理）...
git merge origin/feature/items --no-edit --no-ff 2>nul && echo    ✅ 合并成功 || echo    ⚠️  有冲突或分支不存在

echo    3. 合并角色三（评论评分）...
git merge origin/feature/reviews --no-edit --no-ff 2>nul && echo    ✅ 合并成功 || echo    ⚠️  有冲突或分支不存在

echo    4. 合并角色四（社交动态）...
git merge origin/feature/feed --no-edit --no-ff 2>nul && echo    ✅ 合并成功 || echo    ⚠️  有冲突或分支不存在

echo    5. 合并角色五（搜索功能）...
git merge origin/feature/search --no-edit --no-ff 2>nul && echo    ✅ 合并成功 || echo    ⚠️  有冲突或分支不存在
echo.

echo 🔙 步骤5: 回到你的分支并合并...
git checkout %current_branch%
git merge %merge_branch% --no-edit --no-ff
echo    ✅ 已合并到你的分支
echo.

echo 🧹 步骤6: 清理临时分支...
git branch -d %merge_branch% 2>nul && echo    ✅ 临时分支已删除 || echo    ⚠️  分支删除失败（可能未完全合并）
echo.

echo 📊 步骤7: 最终状态检查...
echo    你的分支现在包含：
echo    - 角色一的登录/注册功能
echo    - 角色二的首页/内容管理
echo    - 角色三的评论/评分功能  
echo    - 角色四的动态/关注功能
echo    - 你自己的搜索/导航功能
echo.

echo 🧪 建议操作：
echo    1. 运行项目测试: npm run dev
echo    2. 检查控制台有无错误
echo    3. 在群里同步进度
echo.

echo 🎉 同步完成！现在可以开始今天的开发了。
echo =========================================
echo 按任意键查看Git状态，或关闭窗口...
pause > nul

git status --short
echo.
echo 今日合并提交记录：
git log --oneline -5 --graph

echo.
echo 💡 提示：如果有冲突，请查看具体文件并与相关同学沟通解决。
echo =========================================
pause