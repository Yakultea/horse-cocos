# 專案重點整理 — Horse Cocos 專案

- 此專案為以 Cocos Creator 3.7.2 + TypeScript 的賽馬遊戲專案，程式碼以模組化的 `assets` 與 `scripts` 結構管理。

# 主要腳本位置與說明
- `assets/Application.ts`: 專案啟動與全域設定入口。
- `assets/MainController.ts`: 主控制器，負責場景與遊戲流程的高階協調。
- `assets/scripts/game/`: 遊戲邏輯與資料（例如 `data/`、`model/`、`event/`），重點檔案包含 `HorseGameData.ts`、`SocketModel.ts` 等。
- `assets/scripts/framework/`: 共用框架、平台抽象與工具函式（`Framework.ts`、`Platform.ts`、`utils/`）供各遊戲模組重複使用。
- `assets/scripts/common/`（如存在）: 共用元件與 UI 工具。
- `@types/`: 專案型別宣告，包含 protobuf、第三方套件與自訂 d.ts 檔，方便 TypeScript 編譯與 IDE 智慧提示。

# 快速導覽（重點檔案）
- 遊戲資料: `assets/scripts/game/data/`（多語言、遊戲設定）
- 模型/狀態: `assets/scripts/game/model/`（`GameConfigModel.ts`、`ColorModel.ts`、`SocketModel.ts`）
- 框架工具: `assets/scripts/framework/utils/`（`Utils.ts`、`Singleton*.ts`）


# 環境要求
 - Cocos Creator 3.7.2
 - npm 18+


# 🏁 賽馬遊戲完整流程
 - HorseGameEntry(入口) → HorseGameView(主畫面UI) → HorseGameLogic(邏輯)
 - WrapperService(網路) → Parse frameData → HorseGameData(資料) → HorseGame(3D賽馬場)


### 📋 腳本職責分層導覽

# 🚀 框架入口層
 - HorseGameEntry ──載資源──> HorseGameView + HorseGameLogic

 - HorseGameEntry 入口：載Material/Sprite/Particle、連Socket、ready回調
 - HorseGameLogic 邏輯：Event監聽、orientation、parseHorseAnime
 - HorseGameView 主UI：排名動畫、音樂切換、結果面板
​
# 🎨 UI組件層
 - HorseGameView ──排名──> RankItem x10

 - RankItem 單馬排名卡：馬匹/騎士顯示
 - HorseGameLanguages 多語：zh-tw/zh-cn/en/vn 錯誤訊息

# 🐎 3D賽馬核心層
 - HorseGame ──frameData──> Horse x10 + ThirdFreeLookCamera + Particle

 - HorseGame 3D主場：馬匹動畫、攝影機路徑、粒子特效、音效
 - Horse 單馬：材質切換、動畫、速度控制
 - ThirdFreeLookCamera 攝影機：RotationAround→Follow、路徑動畫
 - RankItem 排名即時更新
​
# 📦 資料
 - HorseGameData ←─── IHorseAnime ──> frameData[] + skin/rider/result

 - HorseGameData 核心資料：frameData解析、Material/Texture快取
 - GameConfigModel 配置：路徑/版本/framePerTime/RenderMode
 - Config 全域：MIN_INBACKGROUND_TIME等
 - HorseGameLanguage 語言單例
​
# 🌐 網路Wrapper層
 - WrapperService ──Socket──> WrapperSender/Handler

 - WrapperService Socket服務、心跳、連線
 - WrapperSender 發送封包
 - WrapperHandler 接收：HorseGameEvent.HORSE_ANIME_RESPONSE
 - SocketModel Token/URL管理
​
# 🔧 數學/工具層
 - Quaternion 四元數運算
 - VectorTool 向量工具

# 🚀 核心觸發流程
 1. HorseGameEntry載資源(Material/Texture/Particle) + 連Socket
 2. HorseGameView onLoad → HorseGameLogic監聽
 3. Socket → WrapperHandler → HorseGameEvent.HORSE_ANIME_RESPONSE
 4. HorseGameLogic.parseHorseAnime → HorseGameData.setData → PARSE_COMPLETED
 5. HorseGame.startGame → 馬匹初始化 + 攝影機路徑 + 音效
 6. frameData loop → Horse位置/旋轉 + 排名動畫 + 粒子
 7. 第一馬衝線 → 慢速 + 結果攝影機 + 排名完成 → gameComplete()

# 🔄 Render/Record模式
 - ERenderMode：Default/Simplify影響粒子/攝影機
 - ERecordMode：預錄/即錄 window.ready()/startRecording()