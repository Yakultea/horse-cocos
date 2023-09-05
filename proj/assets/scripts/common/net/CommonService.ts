
import { MainCmd, SUB_CMD_SYS } from "../protocol/CmdDefines";
import { Net } from "../../framework/core/net/Net";
import { Config } from "../config/Config";
import { Service } from "../../framework/core/net/service/Service";
import { ReconnectHandler } from "./ReconnectHandler";

/**
 * @description service公共基類
 */
export class CommonService extends Service {

    private get data() {
        return App.stageData;
    }

    // websocket
    protected ip = "localhost";
    protected port: number | string | null= 3000;
    protected protocol: Net.Type = "ws"

    // socketIO
    protected url: string = "";
    protected opts: any = null;

    protected _maxEnterBackgroundTime: number = Config.MAX_INBACKGROUND_TIME;
    protected _backgroundTimeOutId: any = -1;
    /**@description 進入後臺的最大允許時間，超過了最大值，則進入網路重連 */
    public get maxEnterBackgroundTime() {
        return this._maxEnterBackgroundTime;
    }
    public set maxEnterBackgroundTime(value: number) {
        if (value < Config.MIN_INBACKGROUND_TIME || value > Config.MAX_INBACKGROUND_TIME) {
            value = Config.MIN_INBACKGROUND_TIME;
        }
        Log.d(this.module, `maxEnterBackgroundTime ${value}`);
        this._maxEnterBackgroundTime = value;
    }
    
    constructor(){
        super();
        // Log.d('[CommonService] this.clientType', this.clientType)
        // this.reconnectHandler = new ReconnectHandler(this);
    }

    protected init(): void {
        super.init();
        Log.d(`[${this.module}] init`);
        Log.d(`[${this.module}] this.clientType`, this.clientType);
        this.reconnectHandler = new ReconnectHandler(this);
    }
    
    /**
    * @description 連線網路
    */
     public connect() {
        Log.d('this.clientType', this.clientType, this.url)
        if (this.clientType === "websocket") super.connect_server(this.ip, this.port, this.protocol);
        else super.connect_server_io(this.url, this.opts);
    }

    /**
     * @description 傳送心跳
     */
    protected sendHeartbeat() {
        //傳送心跳
        if (this.heartbeat) {
            this.send(new this.heartbeat());
        } else {
            Log.e("請先設定心跳解析型別")
        }
    }
    /**
     * @description 獲取最大心跳超時的次數
     */
    protected getMaxHeartbeatTimeOut(): number {
        return super.getMaxHeartbeatTimeOut();
    }

    protected getHeartbeatInterval() {
        return super.getHeartbeatInterval();
    }

    /**
     * @description 心跳超時
     */
    protected onHeartbeatTimeOut() {
        Log.w(`${this.module} 心跳超時，您已經斷開網路`);
        this.close();
        App.serviceManager.reconnect(this);
    }
    /**
     * @description 是否為心跳訊息
     */
    protected isHeartBeat(data: Message): boolean {
        //示例
        return data.cmd == String(MainCmd.CMD_SYS) + String(SUB_CMD_SYS.CMD_SYS_HEART)
    }

    onEnterBackground() {
        if (this.data.isLoginStage()) {
            return;
        }
        let me = this;
        me._backgroundTimeOutId = setTimeout(() => {
            //進入後臺超時，主動關閉網路
            Log.d(`進入後臺時間過長，主動關閉網路，等玩家切回前臺重新連線網路`);
            me.close();
            App.alert.close(Config.RECONNECT_ALERT_TAG);
        }, me.maxEnterBackgroundTime * 1000);
    }

    onEnterForgeground(inBackgroundTime: number) {
        if (this._backgroundTimeOutId != -1) {
            Log.d(`清除進入後臺的超時關閉網路定時器`);
            clearTimeout(this._backgroundTimeOutId);
            Log.d(`在後臺時間${inBackgroundTime} , 最大時間為: ${this.maxEnterBackgroundTime}`)
            //登入介面，不做處理
            if (this.data.isLoginStage()) {
                return;
            }
            if (inBackgroundTime > this.maxEnterBackgroundTime) {
                Log.d(`從回臺切換，顯示重新連線網路`);
                this.close();
                App.alert.close(Config.RECONNECT_ALERT_TAG);
                App.serviceManager.reconnect(this);
            }
        }
    }
}