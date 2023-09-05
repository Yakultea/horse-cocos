import { DEBUG } from "cc/env";
import { MainCmd, SUB_CMD_SYS } from "../../../../common/protocol/CmdDefines";
import { Macro } from "../../../defines/Macros";

/**
 * @description socketIO
 */

enum SocketIOEvent {
    CONNECT = 'connect',
    RECONNECT = 'reconnect',
    DISCONNECT = 'disconnect',
    CONNECT_TIMEOUT = 'connect_timeout',
    CONNECT_ERROR = 'connect_error',
    ERROR = 'error',
    WARNING = 'warning'
}

enum SocketIOState {
    CLOSED,
    CLOSING,
    CONNECTING,
    OPEN
}


export default class SocketIOClient {

    private _tag: string = "[SocketIOClient]";
    private _url: string = "";
    private _opts: any = null;
    private _dataArr: any[] = [];
    /**@description 是否處於等待連線狀態 */
    private _isWaitingConnect = false;

    /** 連線超時時間 預設為10*/
    private _conTimeOut: number = 10;
    public set connectTimeOut(value: number) {
        this._conTimeOut = value;
    }
    public get connectTimeOut(): number {
        return this._conTimeOut;
    }
    /** 傳送超時設定 預設為10*/
    private _sendTimeOut: number = 10;
    public set sendTimeOut(value: number) {
        this._sendTimeOut = value;
    }
    public get sendTimeOut(): number {
        return this._sendTimeOut;
    }

    /** 傳送超時設定 預設為10*/
    private _readyState: SocketIOState = SocketIOState.CLOSED;
    private _setReadyState(state: SocketIOState) {
        Log.d(this._tag, `setReadyState: ${state}`);
        this._readyState = state;
    }

    private _io: WebSocket | any | null = null;

    private _onOpen: (ev: Event) => void = null!;
    public set onOpen(value) {
        this._onOpen = value;
    }
    /**@description 網路連線成功 */
    public get onOpen() {
        return this._onOpen;
    }

    private _onClose: (ev: any) => void = null!;
    public set onClose(value: (ev: any) => void) {
        this._onClose = value;
    }
    /**@description 網路關閉 */
    public get onClose() {
        return this._onClose;
    }

    private _onMessage: (data: MessageEvent) => void = null!;
    public set onMessage(value: (data: MessageEvent) => void) {
        this._onMessage = value;
    }
    /**@description 接收網路資料 */
    public get onMessage() {
        return this._onMessage;
    }

    private _onError: (ev: Event) => void = null!;
    public set onError(value: (ev: Event) => void) {
        this._onError = value;
    }
    /**@description 網路連線錯誤 */
    public get onError() {
        return this._onError;
    }

    private _closeEvent: any = null;

    private init(url: string, opts?: any) {
        this._url = url;
        this._opts = opts;
        this._dataArr = [];
        this._conTimeOut = 10;
        this._sendTimeOut = 10;
        this._closeEvent = null;
        this._setReadyState(SocketIOState.CONNECTING);
    }


    private connectSocketIO(url: string, opts?: any) {
        if (DEBUG) Log.d(this._tag, `initWebSocket : ${url}`);
        if (!url) return;
        if (!opts) {
            opts = {
                "reconnection": true,
                "force new connection": true,
                "transports": ["websocket", "polling"],
                "allowEIO3": true
            };
        }

        // @ts-ignore
        this._io = window.io.connect(url, opts, App.wssCacertUrl);
        if (this._io) {
            this.init(url, opts);
            this.on(SocketIOEvent.CONNECT, this.__onConnected.bind(this));
            this.on(SocketIOEvent.DISCONNECT, this.__onClose.bind(this));
            this.on(SocketIOEvent.ERROR, this.__onError.bind(this));
            this.on("test", this.__onMessage.bind(this));
            this.on("echo", this.__onMessage.bind(this));
            this.on(SocketIOEvent.ERROR, this.__onMessage.bind(this));
            this.on(SocketIOEvent.WARNING, this.__onMessage.bind(this));
        }
    }

    /**
     * 
     * @param ip ip
     * @param port 埠
     */
    public initSocket(url: string, opts?: any) {
        if (url == undefined || url == null || url.length < 0) {
            if (DEBUG) Log.e(this._tag, `init socketIO error url : ${url}`);
            return;
        }
        //先判斷當前是否已經有連線
        if (this._io) {
            //cc.log(this._tag,`============initWebSocket111=================`);
            //已經有連線，檢視現在的websocket狀態
            if (this._readyState == SocketIOState.CONNECTING) {
                //當前正在建立連線
                //檢視當前連線中的地址是否跟要連線的相同
                if (this._url == url) {
                    //cc.warn(this._tag,"socket正在連線中");
                    return;
                }
                else {
                    if (DEBUG) Log.e(this._tag, `當前有正在連線的socket??`);
                }
            } else if (this._readyState == SocketIOState.OPEN) {
                //當前連線已經開啟
                if (this._url == url) {
                    if (DEBUG) Log.w(this._tag, `當前連線已經是開啟的，不重複連線`);
                }
                else {
                    if (DEBUG) Log.e(this._tag, `當前已經存在連線，請先關閉${this._url} 再連線 ${url}`);
                }
            } else if (this._readyState == SocketIOState.CLOSING) {
                //連線正在關閉，等連線關閉後在進行重新連線
                this._isWaitingConnect = true;
                this._url = url;
                if (DEBUG) Log.w(this._tag, `當前網路關閉連線中，關閉完成後重新連線`);
            } else {
                //連線處於關閉狀態，直接建立新的連線
                this._io = null;
                this.connectSocketIO(url, opts);
            }
        } else {
            //cc.log(this._tag,`============initWebSocket=================`);
            this.connectSocketIO(url, opts);
        }

    }

    private __onConnected(event: any) {
        this._setReadyState(SocketIOState.OPEN);
        if (this._io) {
            if (DEBUG) Log.d(this._tag, `onConected state : ${this._readyState}`);
        }
        if (this._dataArr.length > 0) {
            for (let i = 0; i < this._dataArr.length; i++) {
                this.send(this._dataArr[i]);
            }
            this._dataArr = [];
        }
        if (this.onOpen) this.onOpen(event);
    }

    private __onMessage(event: any) {
        if (this.onMessage) this.onMessage(event);
    }

    private __onClose(event: any) {
        this._setReadyState(SocketIOState.CLOSED);
        this._io = null;
        if (this._closeEvent) {
            event = this._closeEvent;
            this._closeEvent = null;
        }

        if (event) {
            if (DEBUG) Log.d(this._tag, `onClose type : ${event.type}`);
        }
        else {
            if (DEBUG) Log.d(this._tag, `onClose`);
        }

        //等待關閉後連線
        if (this._isWaitingConnect) {
            if (DEBUG) Log.d(this._tag, `收到連線關閉，有等待連線的網路，重連連線網路`);
            this._closeEvent = null;
            this.connectSocketIO(this._url, this._opts);
            this._isWaitingConnect = false;
        } else {
            if (this.onClose) this.onClose(event);
        }
    }

    private __onError(event: Event) {
        if (event) {
            if (DEBUG) Log.e(this._tag, `onError`, event);
        } else {
            if (DEBUG) Log.e(this._tag, `onError`);
        }
        if (this.onError) this.onError(event);
    }

    /**@description 網路是否連線成功 */
    public get isConnected() {
        if (this._io?.connected && this._readyState === SocketIOState.OPEN) {
            return true;
        }
        return false;
    }

    public on(eventName: string, res: (event: any) => void): void {
        if (!this._io) {
            if (DEBUG) Log.w(this._tag, `socket物件 不存在`);
            return;
        }
        // Log.w(this._tag, `socket on ${eventName}`);
        this._io.on(eventName, res);
    }

    public emit(eventName: string, data?: any, cb?: (event: any) => void): void {
        if (!this._io) {
            if (DEBUG) Log.w(this._tag, `socket物件 不存在`);
            return;
        }

        if (this._readyState !== SocketIOState.OPEN) {
            if (DEBUG) Log.w(this._tag, `socket state is not open: ${this._readyState}`);
            return;
        }
        // Log.w(this._tag, `socket emit ${eventName}, ${data}`);
        if (cb) {
            this._io.emit(eventName, data, cb);
        } else if (data) {
            this._io.emit(eventName, data);
        } else {
            this._io.emit(eventName);
        }
    }

    /**
     * @description 是否為心跳訊息
     */
    protected isHeartBeat(data: SocketBuffer): boolean {
        //示例
        return data == String(MainCmd.CMD_SYS) + String(SUB_CMD_SYS.CMD_SYS_HEART);
    }

    public send(data: SocketBuffer) {
        Log.d(this._tag, `send ${data}, ${this.isHeartBeat(data)}`);

        // if (!this._io || !data) {
        //     return;
        // }
        // if (this._readyState === SocketIOState.OPEN) {
        //     this._io.send(data);
        // }
        // else {
        //     //放入傳送佇列

        //     //如果當前連線正在連線中
        //     if (this._readyState == SocketIOState.CONNECTING) {
        //         this._dataArr.push(data);
        //     }
        //     else {
        //         //關閉或者正在關閉狀態
        //         let content = this._readyState == SocketIOState.CLOSING ? `網路正在關閉` : `網路已經關閉`;
        //         if (DEBUG) Log.w(this._tag, `傳送訊息失敗: ${content}`);
        //     }
        // }
    }

    /**@description 關閉網路 
     * @param isEnd 只有在程式的關閉銷燬時呼叫，
     * 在MainController.onDestroy中使用
     */
    public close(isEnd: boolean) {
        if (this._io) {
            this._closeEvent = { type: Macro.ON_CUSTOM_CLOSE, isEnd: isEnd };
            this._io.close();
        }
        //清空傳送
        this._dataArr = [];
        if (DEBUG) Log.d(this._tag, `close websocket`);
    }

    /** 前端主動socket斷線 */
    public socketDisconnect() {
        this._io.disconnect();
    }
}
