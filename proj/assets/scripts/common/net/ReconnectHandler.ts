
import { tween, Tween } from 'cc';
import { Handler } from '../../framework/core/net/service/Handler';
import { Macro } from '../../framework/defines/Macros';
import { Config } from '../config/Config';
/**
 * @description 重連Handler
 */
export class ReconnectHandler extends Handler {

    /**@description 繫結Service物件 */
    protected _service: Service = null!;

    get module(){
        return this.service.module;
    }

    constructor(service: Service) {
        super();
        this._service = service;
    }

    protected get service() {
        return this._service;
    }

    protected get data() {
        return App.stageData;
    }

    protected _enabled = false;
    /**@description 是否啟用重連 */
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        this._enabled = value;
    }

    /**@description 當前連線次數 */
    protected _connectCount = 0;
    /**@description 最大重連次數 */
    protected _maxConnectCount = 3;
    /**@description 是否正在連線中 */
    isConnecting = false;
    protected connectID = 1;
    protected connectTimeOutID = 2;
    /**@description 嘗試重連 */
    reconnect() {
        if (this.isInvalid) return;
        this.service.close();
        this.stop();
        this.delayConnect();
    }

    /**@description 停止 */
    protected stop(){
        this.stopActions();
        this.isConnecting = false;
        this._connectCount = 0;
        App.alert.close(Config.RECONNECT_ALERT_TAG);
    }

    protected delayConnect() {
        if (this.isInvalid) return;
        if (this.isConnecting) {
            Log.w(`${this.service.module} 正在連線中...`);
            return;
        }
        let time = 0.3;
        if (this._connectCount > 0) {
            time = (this._connectCount + 1) * time;
            if (time > 3) { time = 3; }//最多推後3秒進行重連
            Log.d(`${this.service.module}${time}秒後嘗試重連`);
        }
        this.stopAction(this.connectID);
        this.delayCall(this.connectID,time,()=>{
            this.connect();
        })
    }

    protected connect() {
        if (this.isInvalid) return;
        App.alert.close(Config.RECONNECT_ALERT_TAG);
        //说明进入了登录界面
        if (this.data.isLoginStage()) {
            App.uiReconnect.hide();
            Log.w(`重连处于登录界面，停止重连`);
            return;
        }
        this._connectCount++;
        if (this._connectCount > this._maxConnectCount) {
            this.showReconnectDialog();
            return;
        }
        App.uiReconnect.show(App.getLanguage("tryReconnect",[this.service.module, this._connectCount]));
        this.service.connect();

        //啟用連線超時處理
        this.stopAction(this.connectTimeOutID);
        this.delayCall(this.connectTimeOutID,Config.RECONNECT_TIME_OUT,()=>{
            this.connectTimeOut();
        })
    }

    protected connectTimeOut() {
        if (this.isInvalid) return;
        //連線超時了30s，都沒有得到伺服器的返回，直接提示讓玩家確定是否重連連線網路
        this.stopAction(this.connectID);
        this.isConnecting = false;
        //關閉網路
        this.service.close();
        //顯示網路彈出提示框
        this.showReconnectDialog();
    }

    protected showReconnectDialog() {
        if (this.isInvalid) return;
        App.uiReconnect.hide();
        Log.d(`${this.service.module} 断开`)
        this.stopAction(this.connectTimeOutID);
        App.alert.show({
            tag: Config.RECONNECT_ALERT_TAG,
            isRepeat: false,
            text: App.getLanguage("warningReconnect",[this.service.module]) as string,
            confirmCb: (isOK) => {
                if (isOK) {
                    Log.d(`${this.service?.module} 重連連線網路`);
                    this.stop();
                    App.serviceManager.reconnect(this.service);
                } else {
                    Log.d(`${this.service?.module} 玩家网络不好，不重连，退回到登录界面`);
                    App.entryManager.enterBundle(Macro.BUNDLE_RESOURCES);
                }
            },
            cancelCb: () => {
                Log.d(`${this.service?.module} 玩家网络不好，不重连，退回到登录界面`);
                App.entryManager.enterBundle(Macro.BUNDLE_RESOURCES);
            }
        });
    }

    /**@description 網路連線成功 */
    onOpen(ev: Event | null) {
        if (this.isInvalid) return;
        this._connectCount = 0;
        this.isConnecting = false;
        this.stop();
        Log.d(`${this.service.module}伺服器重連成功`);
    }

    /**@description 網路關閉 */
    onClose(ev: Event) {
        if (this.isInvalid) return;
        this.isConnecting = false;
        this.delayConnect();
    }

    /**@description 網路錯誤 */
    onError(ev: Event) {
        if (this.isInvalid) return;
        this.service.close();
        this.isConnecting = false;
        this.delayConnect();
    }

    /**@description 是否無效 */
    protected get isInvalid() {
        if (!(this.service && this.enabled && !this.data.isLoginStage())) {
            return true;
        }
        return false;
    }

    private stopActions(){
        this.stopAction(this.connectID);
        this.stopAction(this.connectTimeOutID);
    }

    private stopAction(tag : number ){
        Tween.stopAllByTag(tag,this);
    }

    private delayCall(tag:number,time:number,func:Function){
        tween(this).tag(tag).delay(time).call(func).start();
    }

    onDestroy(): void {
        this.stopActions();
        super.onDestroy();
    }
}
