import { DEBUG } from "cc/env";
import UrlModel from "../../../../common/model/UrlModel";
import SocketModel from "../../../../game/model/SocketModel";
import { Macro } from "../../../defines/Macros";
import { Net } from "../Net";
import { Codec, IMessage, Message } from "../message/Message";
import { ServerConnector } from "../socket/ServerConnector";
import { Process } from "./Process";

/** @description 處理函式宣告 handleType 為你之前註冊的handleType型別的資料 返回值number 為處理函式需要的時間 */
export abstract class Service extends ServerConnector implements IService {
    /**@description Service所屬模組，如Lobby,game */
    static module: string = Macro.UNKNOWN;
    /**@description 該欄位由ServiceManager指定 */
    module = Macro.UNKNOWN;

    /** 排除log事件 */
    private excludeType: string[] = ['echo'];

    /**@description 進入後臺的最大允許時間，超過了最大值，則進入網路重連 */
    abstract maxEnterBackgroundTime: number;
    /**@description 連線伺服器 */
    abstract connect(): void;

    /**
     * @description 傳送心跳
     */
    protected abstract sendHeartbeat(): void;
    /**
     * @description 是否為心跳訊息
     */
    protected abstract isHeartBeat(data: IMessage): boolean;

    /**@description 進入後臺網路處理 */
    abstract onEnterBackground(): void;

    /**
     * @description 進入前臺網路處理
     * @param inBackgroundTime 進入後面總時間
     **/
    abstract onEnterForgeground(inBackgroundTime: number): void;

    /**@description 網路重連 */
    reconnectHandler: ReconnectHandler | null = null;

    private _Process: Process = new Process();
    public set Process(val: typeof Process) {
        if (val == null) { return; }
        this._Process = new val;
        this._Process.serviceType = this.serviceType;
    }

    /**@description 資料流訊息包頭定義型別 */
    public set Codec(value: new () => Codec) { this._Process.Codec = value; }
    // protected get messageHeader() { return this._messageHeader }

    private _Heartbeat: Net.HeartbeatClass<Message> = null!;
    /**@description 心跳的訊息定義型別 */
    public get heartbeat(): Net.HeartbeatClass<Message> { return this._Heartbeat; }
    public set heartbeat(value: Net.HeartbeatClass<Message>) {
        this._Heartbeat = value;
        this.serviceType = value.type;
        this._Process.serviceType = value.type;
    }

    /**@description 值越大，優先順序越高 */
    public priority: number = 0;

    serviceType: Net.ServiceType = Net.ServiceType.Unknown;

    protected onOpen(ev: Event) {
        super.onOpen(ev);
        App.serviceManager.onOpen(ev, this);
    }

    protected onClose(ev: Event) {
        super.onClose(ev);
        App.serviceManager.onClose(ev, this);
    }
    protected onError(ev: Event) {
        super.onError(ev);
        App.serviceManager.onError(ev, this);
    }

    protected onMessage(data: MessageEvent) {
        this.recvHeartbeat();
        //先對包信進行解析
        let header = new this._Process.Codec;
        if (this.clientType === "websocket") {
            if (!header.unPack(data)) {
                Log.e(`decode header error`);
                return;
            }


            if (this.isHeartBeat(header)) {
                //心跳訊息，路過處理，應該不會有人註冊心跳吧
                this.onRecvHeartBeat();
                return;
            }
        } else {
            this.onRecvHeartBeat();
            return;
        }

        super.onMessage(data);
        this._Process.onMessage(header);
    }

    /**@description 收到心跳 */
    protected onRecvHeartBeat() {

    }

    /**
  * @description 新增伺服器資料監聽
  * @param handleType 處理型別，指你用哪一個類來進行解析資料
  * @param handleFunc 處理回撥
  * @param isQueue 是否進入訊息佇列
  */
    public addListener(cmd: string, handleType: any, handleFunc: Function, isQueue: boolean, target: any) {
        this._Process.addListener(cmd, handleType, handleFunc as any, isQueue, target);
    }

    public removeListeners(target: any, eventName?: string) {
        this._Process.removeListeners(target, eventName);
    }

    protected addMessageQueue(key: string, data: any, encode: boolean = false) {
        this._Process.addMessageQueue(key, data, encode);
    }

    /**
     * @description 暫停訊息佇列訊息處理
     */
    public pauseMessageQueue() { this._Process.isPause = true; }

    /**
     * @description 恢復訊息佇列訊息處理
     */
    public resumeMessageQueue() { this._Process.isPause = false; }

    public handMessage() { this._Process.handMessage(); }

    /**
     * @description 重置
     */
    public reset() { this._Process.reset(); }

    public close(isEnd: boolean = false) {
        //清空訊息處理佇列
        this._Process.close();
        //不能恢復這個佇列，可能在重新連線網路時，如遊戲的Logic層暫停掉了處理佇列去載入資源，期望載入完成資源後再恢復佇列的處理
        //this.resumeMessageQueue();
        super.close(isEnd);
    }

    /** socketIO 監聽事件 */
    public on(eventName: string, res: (event: any) => void): void {
        if (DEBUG) {
            Log.w(`==================== on ${eventName}`);
        }
        super.on(eventName, res);
    }

    /** socketIO 發送事件 */
    public send(eventName: string, data?: any, callback?: (event: any) => void): void;
    public send(msg: Message): void;
    public send(eventNameOrMsg: string | Message, data?: any, callback?: (event: any) => void): void {
        if (eventNameOrMsg instanceof Message) {
            this.websocketMessage(eventNameOrMsg);
        } else {
            this.socketIOMessage(eventNameOrMsg, data, callback);
        }
    }

    /** websocket 原始送 JsonMessage 方法 */
    private websocketMessage(msg: Message) {
        if (this._Process.Codec) {
            if (msg.encode()) {
                let header = new this._Process.Codec;
                header.pack(msg);
                if (this.isHeartBeat(msg)) {
                    // if (DEBUG) Log.d(`send request cmd : ${msg.cmd} `);
                } else {
                    Log.d(`send request main cmd : ${msg.cmd} `);
                }
                if (this.clientType === "websocket") {
                    this.sendBuffer(header.buffer);
                } else {
                    // 心跳測試
                    // this.emit("test", {});
                    // this.emit("echo");
                }
            } else {
                Log.e(`encode error`);
            }
        } else { Log.e("請求指定資料包頭處理型別"); }
    }

    /** socketIO 發送事件 */
    private socketIOMessage(eventName: string, data: any, callback?: (event: any) => void) {
        if (DEBUG && !this.excludeType.includes(eventName)) {
            Log.w(`==================== emit ${eventName}`, data);
        }

        let requestVO = {
            token: SocketModel.currentToken,
            locale: UrlModel.getData().searchParams.l,
            ...data.params,
        }
        if (data.spinId) {
            requestVO.spinId = data.spinId
        }
        if (DEBUG && data.cheat) {
            requestVO.cheat = data.cheat
        }

        if (DEBUG && !this.excludeType.includes(eventName)) {
            Log.w(`==================== emit Final ${eventName}`, requestVO);
        }
        this.emit(eventName, requestVO, callback);
    }

    destory() {
        if (this.reconnectHandler) {
            this.reconnectHandler.onDestroy();
        }
    }
}
