#!/bin/bash

# 設定專案 URL 文字檔的路徑
# url_file="project_urls.txt" # 本機
url_file="tools/bash/project_urls.txt" # npm run bundles 腳本

# 檢查文字檔是否存在
if [ ! -f "$url_file" ]; then
  echo "專案 URL 文字檔不存在。"
  exit 1
fi

# 開始批次 Clone 專案
while IFS= read -r url || [ -n "$url" ]; do
  # 移除 URL 字串中的空格
  url=$(echo "$url" | tr -d '[:space:]')

  # 字串分割
  IFS='/' read -ra array <<< "$url"
  NAME=${array[-1]}

  # 執行 Git Clone
  # git clone "$url" ../../bundles/bundles/${NAME} # 本機
  git clone "$url" bundles/bundles/${NAME} # npm run bundles 腳本
done < "$url_file"

echo "專案 Clone 完成。"