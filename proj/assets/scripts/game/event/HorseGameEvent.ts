/** HorseGameEvent事件 event */

import { FlowEvent } from "../../framework/core/flow/FlowEvent";

export class HorseGameEvent extends FlowEvent<HorseGameEvent | any> {
    // =================== SOCKET ===================
    public static SERVICE_CONNECTED = "HorseGameEvent:SERVICE_CONNECTED"; // 網路連線成功
    public static SERVICE_CLOSE = "HorseGameEvent:SERVICE_CONNECTED"; // 網路關閉

    // =================== REQUEST & RESPONSE ===================
    public static INIT_RESPONSE = "HorseGameEvent:INIT_RESPONSE"; // init res
    public static WARN_RESPONSE = "HorseGameEvent:SERVICE_WARN"; // warn res
    public static ERROR_RESPONSE = "HorseGameEvent:ERROR_RESPONSE"; // error res
    public static HORSE_ANIME_RESPONSE = "HorseGameEvent:HORSE_ANIME_RESPONSE";

    // =================== GAME ===================
    public static LOADING_COMPLETED = "HorseGameEvent:LOADING_COMPLETED"; // socket initial & loadResources 都完成的事件
    public static PARSE_COMPLETED = "HorseGameEvent:PARSE_COMPLETED";
    public static SET_RESULT_DATA = "HorseGameEvent:SET_RESULT_DATA";
    public static SET_RESULT_ACTIVE = "HorseGameEvent:SET_RESULT_ACTIVE";
    public static INIT_RANK_BAR = "HorseGameEvent:INIT_RANK_BAR";
    public static UPDATE_RANK_BAR = "HorseGameEvent:UPDATE_RANK_BAR";
    public static PLAY_BGM = "HorseGameEvent:PLAY_BGM";
    public static PLAY_BTM = "HorseGameEvent:PLAY_BTM";
    public static STOP_BTM = "HorseGameEvent:STOP_BTM";
    public static STOP_BGM = "HorseGameEvent:STOP_BGM";
}
