import { DEBUG, JSB } from "cc/env";
import { Macro } from "../../../defines/Macros";
import { Net } from "../Net";
/**
 * @description websocket封裝
 */
export default class WebSocketClinet {

    private _tag: string = "[WebSocketClinet]";
    private _ip: string = "";
    private _port: string | null = null;
    private _protocol: Net.Type = "wss";
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

    private _ws: WebSocket | null = null;

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

    private init(ip: string, port: string | null, protocol: Net.Type) {
        this._ip = ip;
        this._port = port;
        this._protocol = protocol;
        this._dataArr = [];
        this._conTimeOut = 10;
        this._sendTimeOut = 10;
        this._closeEvent = null;
    }


    private connectWebSocket(ip: string, port: string | null, protocol: Net.Type) {
        this.init(ip, port, protocol);
        if (!this._ip) return;
        let fullUrl = `${protocol}://${this._ip}`;
        if (this._port) {
            fullUrl = fullUrl + `:${this._port}`;
        }
        if (DEBUG) Log.d(this._tag, `initWebSocket : ${fullUrl}`);


        if (JSB && protocol == "wss") {
            if (!App.wssCacertUrl) {
                Log.e(`請先設定wss的證書url,MainController指令碼中直接掛載證書`);
            }
            this._ws = new (<any>(WebSocket))(fullUrl, [], App.wssCacertUrl);
        } else {
            this._ws = new WebSocket(fullUrl);
        }
        if (this._ws) {
            //cc.log(this._tag,`new websocket readyState : ${this._ws.readyState}`);
            this._ws.binaryType = "arraybuffer";

            //開啟socket
            this._ws.onopen = this.__onConnected.bind(this);

            //收訊息
            this._ws.onmessage = this.__onMessage.bind(this);

            //socket關閉
            this._ws.onclose = this.__onClose.bind(this);

            //錯誤處理
            this._ws.onerror = this.__onError.bind(this);
        }
    }

    /**
     * 
     * @param ip ip
     * @param port 埠
     */
    public initSocket(ip: string, port: string | null, protocol: Net.Type) {
        if (ip == undefined || ip == null || ip.length < 0) {
            if (DEBUG) Log.e(this._tag, `init websocket error ip : ${ip} port : ${port}`);
            return;
        }
        //先判斷當前是否已經有連線
        if (this._ws) {
            //cc.log(this._tag,`============initWebSocket111=================`);
            //已經有連線，檢視現在的websocket狀態
            if (this._ws.readyState == WebSocket.CONNECTING) {
                //當前正在建立連線
                //檢視當前連線中的地址是否跟要連線的相同
                if (this._ip == ip && this._port == port) {
                    //cc.warn(this._tag,"socket正在連線中");
                    return;
                }
                else {
                    if (DEBUG) Log.e(this._tag, `當前有正在連線的socket??`);
                }
            } else if (this._ws.readyState == WebSocket.OPEN) {
                //當前連線已經開啟
                if (this._ip == ip && this._port == port) {
                    if (DEBUG) Log.w(this._tag, `當前連線已經是開啟的，不重複連線`);
                }
                else {
                    if (DEBUG) Log.e(this._tag, `當前已經存在連線，請先關閉${this._ip}:${this._port} 再連線 ${ip} : ${port}`);
                }
            } else if (this._ws.readyState == WebSocket.CLOSING) {
                //連線正在關閉，等連線關閉後在進行重新連線
                this._isWaitingConnect = true;
                this._ip = ip;
                this._port = port;
                if (DEBUG) Log.w(this._tag, `當前網路關閉連線中，關閉完成後重新連線`);
            } else {
                //連線處於關閉狀態，直接建立新的連線
                this._ws = null;
                this.connectWebSocket(ip, port, protocol);
            }
        } else {
            //cc.log(this._tag,`============initWebSocket=================`);
            this.connectWebSocket(ip, port, protocol);
        }

    }

    private __onConnected(event: any) {
        if (this._ws) {
            if (DEBUG) Log.d(this._tag, `onConected state : ${this._ws.readyState}`);
        }
        if (this._dataArr.length > 0) {
            for (let i = 0; i < this._dataArr.length; i++) {
                this.send(this._dataArr[i]);
            }
            this._dataArr = [];
        }
        if (this.onOpen) this.onOpen(event);
    }

    private __onMessage(event: MessageEvent) {
        if (this.onMessage) this.onMessage(event);
    }

    private __onClose(event: any) {

        this._ws = null;
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
            this.connectWebSocket(this._ip, this._port, this._protocol);
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
        if (this._ws && this._ws.readyState === WebSocket.OPEN) {
            return true
        }
        return false;
    }

    public send(data: SocketBuffer) {
        if (!this._ws || !data) {
            return;
        }
        if (this._ws.readyState === WebSocket.OPEN) {
            this._ws.send(data);
        }
        else {
            //放入傳送佇列

            //如果當前連線正在連線中
            if (this._ws.readyState == WebSocket.CONNECTING) {
                this._dataArr.push(data);
            }
            else {
                //關閉或者正在關閉狀態
                let content = this._ws.readyState == WebSocket.CLOSING ? `網路正在關閉` : `網路已經關閉`;
                if (DEBUG) Log.w(this._tag, `傳送訊息失敗: ${content}`);
            }
        }
    }

    /**@description 關閉網路 
     * @param isEnd 只有在程式的關閉銷燬時呼叫，
     * 在MainController.onDestroy中使用
     */
    public close(isEnd: boolean) {
        if (this._ws) {
            this._closeEvent = { type: Macro.ON_CUSTOM_CLOSE, isEnd: isEnd };
            this._ws.close();
        }
        //清空傳送
        this._dataArr = [];
        if (DEBUG) Log.d(this._tag, `close websocket`);
    }
}
