# Bunbles代码链接
npm run sync

# bundles远程代码拉取
`npm run bundles`
windows 要使用git bash 不然無法執行sh命令


# 执行全部命令
npm run main

# 扩展插件代码链接
npm run extensions

# 引擎修正
npm run fixEngine

# Gulp 压缩
注意 ： 如果要使用该功能，请先使用tsc编译代码
npm run linkGulp 这个只用执行一次
npm run gulp

# 多語 csvToTs (新增:2023/8/9)
注意 ： 只會遍歷/proj下資料夾。檔名必須包含'Languages'、'.csv'為關鍵字。
表單連結: https://drive.google.com/drive/folders/1Jkq9ZKja830bvF2IAUX1CByvskoXLXm4?usp=drive_link
`npm run csvToTs`


# 解析 color (新增:2023/8/17)
配合figma 使用 "Variables Import Export" 套件導出 design token
套件連結: https://www.figma.com/community/plugin/1254848311152928301
1. figma 執行 Variables Import Export > Export Variables > 複製JSON
2. 將複製的JSON 貼上至 tools/script/color/input.json中
3. 執行 `npm run color`
4. 將 output.ts 中的內容 複製貼上至目標(預設:ColorModel.ts)
`npm run color`
