import { find, instantiate, Label, Node, Tween, tween, Vec3 } from "cc";
import { Config, ViewZOrder } from "../config/Config";
/**
 * @description 載入動畫
 */

export default class Loading implements ISingleton{
    static module: string = "【Loading】";
    module: string = null!;
    isResident = true;
    /**@description 當前loading節點 */
    protected node: Node = null!;
    protected get prefab(){
        return App.uiManager.getScenePrefab("Loading");
    }
    private _timeOutCb?: () => void;
    /**@description 顯示超時回撥 */
    public set timeOutCb(value) {
        this._timeOutCb = value;
    }
    public get timeOutCb() {
        return this._timeOutCb;
    }

    /**@description 顯示的Loading提示內容 */
    protected _content: string[] = [];
    private _showContentIndex = 0;

    /**@description 超時回撥定時器id */
    private _timerId: any = -1;

    /**@description 顯示的提示 */
    protected text: Label = null!;

    /**
     * @description 顯示Loading
     * @param content 提示內容
     * @param timeOutCb 超時回撥
     * @param timeout 顯示超時時間
     */
    public show(content: string | string[], timeOutCb?: () => void, timeout = Config.LOADING_TIME_OUT) {
        this._timeOutCb = timeOutCb;
        if (Array.isArray(content)) {
            this._content = content;
        } else {
            this._content = [];
            this._content.push(content);
        }
        this._show(timeout);
        return this;
    }

    protected _show(timeout: number) {
        if ( !this.prefab ){
            return;
        }
        if ( !this.node ){
            this.node = instantiate(this.prefab);
        }
        this.node.removeFromParent();
        App.uiManager.addView(this.node, ViewZOrder.Loading);
        this.node.position = Vec3.ZERO;
        this.text = find("content/text", this.node)?.getComponent(Label) as Label;
        this._showContentIndex = 0;
        this.startShowContent();
        this.startTimeOutTimer(timeout);
        this.node.active = true;
    }

    protected startShowContent() {
        if (this._content.length == 1) {
            this.text.string = this._content[0];
        } else {
            this.stopShowContent();
            tween(this.text.node)
                .call(() => {
                    this.text.string = this._content[this._showContentIndex];
                })
                .delay(Config.LOADING_CONTENT_CHANGE_INTERVAL)
                .call(() => {
                    this._showContentIndex++;
                    if (this._showContentIndex >= this._content.length) {
                        this._showContentIndex = 0;
                    }
                    this.startShowContent();
                })
                .start();
        }
    }

    private stopShowContent() {
        if (this.text) {
            Tween.stopAllByTarget(this.text.node);
        }
    }

    /**@description 開始計時回撥 */
    protected startTimeOutTimer(timeout: number) {
        if (timeout > 0) {
            this._timerId = setTimeout(() => {
                this._timeOutCb && this._timeOutCb();
                this.hide();
            }, timeout * 1000);
        }
    }
    /**@description 停止計時 */
    protected stopTimeOutTimer() {
        this._timeOutCb = undefined;
        clearTimeout(this._timerId);
        this._timerId = -1;
    }

    public hide() {
        this.stopShowContent();
        this.stopTimeOutTimer();
        if ( this.node ) this.node.active = false;
    }
}
