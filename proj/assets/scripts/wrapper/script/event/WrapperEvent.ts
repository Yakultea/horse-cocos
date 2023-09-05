/** WrapperEvent事件 event */
import { FlowEvent } from "../../../framework/core/flow/FlowEvent";

export class WrapperEvent extends FlowEvent<WrapperEvent | any> {
    // =================== SOCKET ===================
    public static WRAPPER_SERVICE_CONNECTED = "WrapperEvent:WRAPPER_SERVICE_CONNECTED"; // 網路連線成功
    public static WRAPPER_SERVICE_CLOSE = "WrapperEvent:WRAPPER_SERVICE_CLOSE"; // 網路關閉


    // =================== REQUEST & RESPONSE ===================
    // REQUEST:
    public static SEND_SPIN_REQUEST = "WrapperEvent:SEND_SPIN_REQUEST";
    public static SEND_CLOSE_REQUEST = "WrapperEvent:SEND_CLOSE_REQUEST";

    // RESPONSE:
    public static INIT_RESPONSE = "WrapperEvent:INIT_RESPONSE"; // init res
    public static SPIN_RESPONSE = "WrapperEvent:SPIN_RESPONSE"; // spin res
    public static CLOSE_RESPONSE = "WrapperEvent:CLOSE_RESPONSE"; // close res
    public static BET_RECORDS_RESPONSE = "WrapperEvent:BET_RECORDS_RESPONSE"; // 投注紀錄
    public static SLOT_TABLES_RESPONSE = "WrapperEvent:SLOT_TABLES_RESPONSE"; // 取得機台
    public static WARN_RESPONSE = "WrapperEvent:SERVICE_WARN"; // 收到 warn
    public static ERROR_RESPONSE = "WrapperEvent:ERROR_RESPONSE"; // 收到 error
    public static NOTIFY_JACKPOT_RESPONSE = "WrapperEvent:NOTIFY_JACKPOT_RESPONSE"; // 更新 JP 資訊
    public static NOTIFY_BIG_WIN_RESPONSE = "WrapperEvent:NOTIFY_BIG_WIN_RESPONSE"; // 更新 Notify 大贏 資訊 // 目前企劃為規劃前端顯示大贏通知
    public static SLOT_TABLE_RESPONSE = "WrapperEvent:SLOT_TABLE_RESPONSE"; // 取得單一機台
    public static ALL_SLOT_TABLES_RESPONSE = "WrapperEvent:ALL_SLOT_TABLES_RESPONSE"; // 取得全部機台
    public static LOCK_SLOT_TABLE_RESPONSE = "WrapperEvent:LOCK_SLOT_TABLE_RESPONSE"; // 鎖定機台
    public static UPDATE_SLOT_TABLES_RESPONSE = "WrapperEvent:UPDATE_SLOT_TABLES_RESPONSE"; // 更新機台
    public static BUY_FEATURE_RESPONSE = "WrapperEvent:BUY_FEATURE_RESPONSE"; // 購買獎金遊戲
    public static UPDATE_AVATAR_COMPLETED_RESPONSE = "WrapperEvent:UPDATE_AVATAR_COMPLETED_RESPONSE"; // 更新頭像

    // =================== 未分類 ===================
    public static SWIPE_UP = "WrapperEvent.SWIPE_UP"; // 上滑事件

    // ----------------  目前以下無使用 ----------------------
    // REQUEST
    public static INIT_REQUEST = "WrapperEvent:INIT_REQUEST";
    public static PLAY_REQUEST = "WrapperEvent:PLAY_REQUEST";
    public static FREESPIN_REQUEST = "WrapperEvent:FREESPIN_REQUEST";
    public static CLOSE_REQUEST = "WrapperEvent:CLOSE_REQUEST";
    public static SET_STATUS_REQUEST = "WrapperEvent:SET_STATUS_REQUEST";
    public static BONUS_SELECT_REQUEST = "WrapperEvent:BONUS_SELECT_REQUEST";
    public static BONUS_REQUEST = "WrapperEvent:BONUS_REQUEST";
    public static CLOSE_BONUS_REQUEST = "WrapperEvent:CLOSE_BONUS_REQUEST";
    public static CLIENT_SETTINGS = "WrapperEvent:CLIENT_SETTINGS_REQUEST";

    // RESPONSES:
    public static PLAY_RESPONSE = "WrapperEvent:PLAY_RESPONSE";
    public static BONUS_RESPONSE = "WrapperEvent:BONUS_RESPONSE";
    public static CLOSE_BONUS_RESPONSE = "WrapperEvent:CLOSE_BONUS_RESPONSE";
    public static SAVE_STATE_RESPONSE = "WrapperEvent:SAVE_STATE_RESPONSE";
    public static SET_STATUS_RESPONSE = "WrapperEvent:SET_STATUS_RESPONSE";

    // Game Settings update
    public static SETTING_RESPONSE = "WrapperEvent:SETTING_RESPONSE";
    public static SETTINGS_UPDATE = "WrapperEvent:SETTINGS_UPDATE";
    public static SHOW_POPUP = "WrapperEvent:SHOW_POPUP";
    public static UNITY_ACTION = "WrapperEvent:UNITY_ACTION";
    public static OPEN_PANEL = "WrapperEvent:OPEN_PANEL";
    public static START_GAME = "WrapperEvent:START_GAME";
    public static DEBUG = "WrapperEvent:DEBUG";
    public static UPDATE_USER_AVATAR = "WrapperEvent:UPDATE_USER_AVATAR";
    public static UPDATE_STAKE = "WrapperEvent:UPDATE_STAKE";
}
