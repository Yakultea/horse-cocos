import { DEBUG } from "cc/env";
import { EventProcessor } from "../../event/EventProcessor";
import { Macro } from "../../../defines/Macros";
import { Message } from "../message/Message";
import SocketModel from "../../../../wrapper/script/model/SocketModel";

/**
 * @description 該物件只用於對網路資料的傳送
 */
export abstract class Sender extends EventProcessor implements ISingleton {

    /**@description Sender所屬模組，如聊天,vip, */
    static module: string = Macro.UNKNOWN;
    /**@description 該欄位由NetHelper指定 */
    module: string = "";
    /**@description 關聯Service物件 */
    protected abstract get service(): any;

    protected send(eventName: string, data?: any, callback?: (event: any) => void): void;
    protected send(msg: Message): void;
    protected send(eventNameOrMsg: string | Message, data?: any, callback?: (event: any) => void): void {
        if (eventNameOrMsg instanceof Message) {
            if (this.service && this.service.send) {
                this.service.send(eventNameOrMsg);
                return;
            }
        } else {
            this.service.send(eventNameOrMsg, data, callback);
            return;
        }

        if (DEBUG) {
            Log.e(`必須關聯Service`);
        }

    }

    debug() {
        Log.d(this.module);
    }

    destory() {
        this.onDestroy();
    }

    init() {
        this.onLoad();
    }
}

