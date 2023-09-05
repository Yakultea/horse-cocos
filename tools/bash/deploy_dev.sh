#!/bin/bash

# 定義物件對應
declare -A folder_mapping
folder_mapping["g1001"]="a86fa8b0f3ba11ed890da5bcff67904e"
folder_mapping["g1002"]="xxxxx"

# 新增其他對應

if [ $# -eq 0 ]; then
    echo "Usage: $0 <target_key>"
    exit 1
fi

target_key=$1

if [[ -z ${folder_mapping[$target_key]} ]]; then
    echo "無效的目標 key: $target_key"
    exit 1
fi

target_folder=${folder_mapping[$target_key]}

echo "將文件部署到目標文件夾: $target_folder"

# 刪除遠端伺服器上的檔案
ssh tw-slot-dev "rm -r ~/games/$target_folder/*"

# 將本地檔案複製到遠端伺服器
scp -r ../../proj/build/web-mobile/* tw-slot-dev:/home/ubuntu/games/$target_folder

echo "部署完成."