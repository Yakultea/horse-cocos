import { IMessage } from "../message/Message";
import { DEBUG } from "cc/env";
import { Net } from "../Net";
import WebSocketClinet from "./WebSocketClient";
import SocketIOClient from "../socketIO/SocketIOClient";

/**
 * @description 伺服器聯結器
 */

export abstract class ServerConnector {

    /**
     * @description websocket例項由外部設定方可使用
     */
    protected clientType: string = "websocket"
    private _client: WebSocketClinet | SocketIOClient = null!;

    constructor() {
        // Log.d('[ServerConnector] constructor')
        // Log.d('[ServerConnector] this.clientType', this.clientType)
        // if (this.clientType === "websocket") this._client = new WebSocketClinet() || new SocketIOClient()
        // this._client.onClose = this.onClose.bind(this);
        // this._client.onError = this.onError.bind(this);
        // this._client.onMessage = this.onMessage.bind(this);
        // this._client.onOpen = this.onOpen.bind(this);
    }

    protected init(): void {
        // Log.d('[ServerConnector] init')
        // Log.d('[ServerConnector] this.clientType', this.clientType)
        this._client = (this.clientType === "websocket") ? new WebSocketClinet() : new SocketIOClient()

        this._client.onClose = this.onClose.bind(this);
        this._client.onError = this.onError.bind(this);
        this._client.onMessage = this.onMessage.bind(this);
        this._client.onOpen = this.onOpen.bind(this);
    }

    /**
     * @description 傳送心跳
     */
    protected abstract sendHeartbeat():void;

    /**
     * @description 獲取最大心跳超時的次數
     */
    protected getMaxHeartbeatTimeOut(): number {
        //預設給5次
        return 5;
    }

    /**@description 心跳傳送間隔，預設為5秒 */
    protected getHeartbeatInterval(): number {
        return 5000;
    }

    /**
     * @description 心跳超時
     */
    protected abstract onHeartbeatTimeOut():void;

    /**
     * @description 是否為心跳訊息
     */
    protected isHeartBeat(data: IMessage): boolean {
        return false;
    }

    /**
     * @description 網路開啟
     */
    protected onOpen(ev: Event) {
        this.recvHeartbeat();
        this.stopSendHartSchedule();
        this.sendHeartbeat();
        // 目前 socketIO 已經幫我們時做這塊 這部分是針對WEB SOCKET 的，故先註解
        // this.startSendHartSchedule(); 
    }

    /**
     * @description 網路關閉
     */
    protected onClose(ev: Event) {
        //停止心跳傳送，已經沒有意義
        this.stopSendHartSchedule();
    }

    /**
     * @description 網路錯誤
     */
    protected onError(ev: Event) {
        //網路連接出錯誤，停止心跳傳送
        this.stopSendHartSchedule();
    }

    /**
     * @description 收到網路訊息
     */
    protected onMessage(data: MessageEvent) {
        this.recvHeartbeat();
    }

    /**
     * @description 收到心跳
     */
    protected recvHeartbeat() {
        this._curRecvHartTimeOutCount = 0;
    }

    private _sendHartId: any = -1; //傳送心跳包的間隔id
    private _curRecvHartTimeOutCount: number = 0;//當前接收心跳超時的次數

    private _enabled = true;
    /**@description 是否啟用 */
    public get enabled() {
        return this._enabled;
    }
    public set enabled(value: boolean) {
        this._enabled = value;
        if (value == false) {
            this.close();
        }
    }

    /**
     * @description 連線網路
     * @param ip 
     * @param port 
     * @param protocol 協議型別 ws / wss 
     */
    public connect_server(ip: string, port: number | string | null = null, protocol: Net.Type = "wss") {
        if (!this.enabled) {
            if (DEBUG) Log.w(`請求先啟用`)
            return;
        }

        if (port) {
            if (typeof port == "string" && port.length > 0) {
                this._client && this._client.initSocket(ip, port, protocol);
            } else if (typeof port == "number" && port > 0) {
                this._client && this._client.initSocket(ip, port.toString(), protocol);
            } else {
                this._client && this._client.initSocket(ip, null, protocol);
            }
        } else {
            this._client && this._client.initSocket(ip, null, protocol);
        }
    }

    public connect_server_io(url: string, opts?: any ) {
        if (!this.enabled) {
            if (DEBUG) Log.w(`請求先啟用`)
            return;
        }

        this._client && (this._client as SocketIOClient).initSocket(url, opts);
    }

    /**
     * @description 清除定時傳送心跳的定時器id
     */
    private stopSendHartSchedule() {
        if (this._sendHartId != -1) {
            clearInterval(this._sendHartId);
            this._sendHartId = -1;
        }
    }

    /**
     * @description 啟動心跳傳送
     */
    private startSendHartSchedule() {
        let self = this;
        this._sendHartId = setInterval(() => {
            self._curRecvHartTimeOutCount = self._curRecvHartTimeOutCount + 1;
            if (self._curRecvHartTimeOutCount > self.getMaxHeartbeatTimeOut()) {
                self.stopSendHartSchedule();
                self.onHeartbeatTimeOut();
                return;
            }
            self.sendHeartbeat();
        }, self.getHeartbeatInterval());

    }

    /**
     * @description 傳送請求
     * @param msg 訊息
     */
    protected sendBuffer(buffer: SocketBuffer) {
        this._client && this._client.send(buffer);
    }

    protected on(eventName: string, res: (event: any) => void): void {
        this._client && (this._client as SocketIOClient).on(eventName, res);
    }

    protected emit(eventName: string, data?: any, cb?: (event: any) => void) {
        this._client && (this._client as SocketIOClient).emit(eventName, data, cb);
    }

    public close(isEnd: boolean = false) {
        this.stopSendHartSchedule();
        this._client && this._client.close(isEnd);
    }

    /**@description 網路是否連線成功 */
    public get isConnected() {
        if (this._client) {
            return this._client.isConnected;
        }
        return false;
    }

    /** 設定連線逾時時間 單位分 */
    public setSocketIOConTimeOut(value: number){
        if (this._client) {
            this._client.connectTimeOut = value;
        }
    }

    /** 前端主動socket斷線 */
    public socketDisconnect(){
        (this._client as SocketIOClient).socketDisconnect()
    }
}