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
    public static PARSE_COMPLETED = "HorseGameEvent:PARSE_COMPLETED";
}
