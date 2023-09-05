/**
 * @description 子游戲連線服務
 */
import { NetPriority } from "../config/Config";
import { CommonEvent } from "../event/CommonEvent";
import { CommonService } from "./CommonService";

export class ChatService extends CommonService {
    static module = "聊天";
    priority = NetPriority.Chat;
    /**@description 網路連線成功 */
    onOpen(ev: Event) {
        super.onOpen(ev);
        dispatch(CommonEvent.CHAT_SERVICE_CONNECTED, this);
    }

    /**@description 網路關閉 */
    onClose(ev: Event) {
        super.onClose(ev);
        dispatch(CommonEvent.CHAT_SERVICE_CLOSE, this);
    }
}

