/**
 * @description 子游戲連線服務
 */

import { Net } from "../../framework/core/net/Net";
import { NetPriority } from "../config/Config";
import { CommonEvent } from "../event/CommonEvent";
import { CommonService } from "./CommonService";

export class LobbyService extends CommonService {
    static module = "大廳";
    priority = NetPriority.Lobby;

    // protected url = "https://socket2022.riversense.tw";
    protected clientType = "socketIO"
    protected url = ''; //"https://socket.riversense.tw";

    constructor(){
        super();
        Log.d('[LobbyService] this.clientType', this.clientType);
        this.init();
    }

    /**@description 網路連線成功 */
    onOpen(ev: Event) {
        super.onOpen(ev);
        dispatch(CommonEvent.LOBBY_SERVICE_CONNECTED, this);
    }

    /**@description 網路關閉 */
    onClose(ev: Event) {
        super.onClose(ev);
        dispatch(CommonEvent.LOBBY_SERVICE_CLOSE, this);
    }
}

