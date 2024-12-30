/**@description 全域性配置 */

export namespace Config {
    /**@description 是否顯示除錯按鈕 */
    export const isShowDebugButton = false;

    /**@description 公共音效路徑 */
    export const audioPath = {
        dialog: "common/audio/dlg_open",
        button: "common/audio/btn_click",
    }

    /**@description 是否跳過熱更新檢測 */
    export const isSkipCheckUpdate = false;

    /**@description 測試熱更新服務器地址 */
    export const HOT_UPDATE_URL = "http://192.168.187.150/hotupdate"; // "http://172.21.192.1/hotupdate";

    /**@description 是否使用了自動版本 */
    export const USE_AUTO_VERSION = true;

    /**@description Loading動畫顯示超時回撥預設超時時間 */
    export const LOADING_TIME_OUT = 30;

    /**@description Loading提示中切換顯示內容的時間間隔 */
    export const LOADING_CONTENT_CHANGE_INTERVAL = 3;

    /**@description 載入介麵超時時間,如果在LOAD_VIEW_TIME_OUT秒未加載出，提示玩家載入介麵超時 */
    export const LOAD_VIEW_TIME_OUT = 20;

    /**@description UILoading顯示預設時間，即在開啟介麵時，如果介麵在LOAD_VIEW_DELAY之內未顯示，就會彈出一的載入介麵的進度 
     * 在開啟介麵時，也可直接指定delay的值
     * @example  
     * App.uiManager.open({ type : LoginLayer, zIndex: ViewZOrder.zero, delay : 0.2});
     */
    export const LOAD_VIEW_DELAY = 0.1;

    /**@description 重連的超時時間 */
    export const RECONNECT_TIME_OUT = 30;

    /**@description 進入後臺最大時間（單位秒）大於這個時間時就會進入重連*/
    export const MAX_INBACKGROUND_TIME = 60 * 65; // 60
    /**@description 進入後臺最小時間（單位秒）大於這個時間時就會進入重連*/
    export const MIN_INBACKGROUND_TIME = 60 * 60; // 5

    /**@description 網路重連彈出框tag */
    export const RECONNECT_ALERT_TAG = 100;

    export const SHOW_DEBUG_INFO_KEY = "SHOW_DEBUG_INFO_KEY";

    /** token 保留時間 (天) */
    export const TOKEN_EXPIRED_TIME = 3;
}

/**
 * @description 介麵層級定義
 */

export namespace ViewZOrder {

    /**@description 最底層 */
    export const zero = 0;

    /**@description 小喇叭顯示層 */
    export const Horn = 10;

    /**@description ui層 */
    export const UI = 100;

    /**@description 提示 */
    export const Tips = 300;

    /**@description 提示彈出框 */
    export const Alert = 299;

    /**@description Loading層 */
    export const Loading = 600;

    /**@description 介麵載入動畫層，暫時放到最高層，載入動畫時，介麵未開啟完成時，不讓玩家點選其它地方 */
    export const UILoading = 700;

    /**@description 至頂錯誤彈出框 */
    export const TopErrorAlert = 800;
}

/**@description 網路優先順序,值越大，最佳化級越高 */
export enum NetPriority {
    Game,
    Chat,
    Lobby,
    Wrapper
}

export enum EEnv {
    DEV = "dev",
    PROD = "prod"
}