import { DEBUG } from "cc/env";
import { EventProcessor } from "../../event/EventProcessor";
import { Macro } from "../../../defines/Macros";

/**
 * @description 該模組只負責對網路訊息的返回處理
 */
export abstract class Handler extends EventProcessor implements ISingleton{

    /**@description Sender所屬模組，如聊天,vip, */
    static module: string = Macro.UNKNOWN;
    protected _module : string = Macro.UNKNOWN;
    /**@description 該欄位由NetHelper指定 */
    get module(){
        return this._module;
    }
    set module(value){
        this._module = value
    }

    /**@description 繫結Service物件 */
    protected abstract get service(): any;

    /**
     * @description 註冊網路事件
     * @param cmd cmd
     * @param func 處理函式
     * @param handleType 處理資料型別
     * @param isQueue 接收到訊息，是否進行佇列處理
     * @deprecated websocket 專用，目前不使用
     */
    protected onS(cmd: string, func: (data: any) => void, handleType?: any, isQueue = true) {
        let service : IService = this.service;
        
        if (service && service.addListener) {

            service.addListener(cmd, handleType, func, isQueue, this);
            return;
        }
        if (DEBUG) {
            Log.w(`未繫結Service`);
        }
    }

    /**
     * @description 反註冊網路訊息處理
     * @param cmd 如果為null，則反註冊當前物件註冊過的所有處理過程，否則對特定cmd反註冊
     **/
    protected offS(cmd?: string) {
        let service : IService = this.service;
        if (service && service.removeListeners) {
            service.removeListeners(this, cmd)
            return;
        }
        if (DEBUG) {
            Log.w(`未繫結Service`);
        }
    }

    /**
     * @description 該方法會在Handler銷燬時，呼叫
     */
    onDestroy(): void {
        //移除当前Handler绑定事件
        this.offS();
        super.onDestroy();
    }

    debug(){
        Log.d(this.module);
    }

    destory(){
        this.onDestroy();
    }

    init(){
        this.onLoad();
    }
}

