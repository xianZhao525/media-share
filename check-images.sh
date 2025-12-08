#!/bin/bash
echo "检查图片目录结构:"
find frontend/public/images -type f -name "*.svg" | while read file; do
  size=$(wc -c < "$file")
  echo "  $file ($size bytes)"
done

echo -e "\n前端 public 目录内容:"
ls -la frontend/public/

echo -e "\n后端脚本目录:"
ls -la backend/scripts/
