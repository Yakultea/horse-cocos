import { find, instantiate, Label, Node, Prefab, Tween, tween, UIOpacity, Vec3 } from "cc";
import { Config, ViewZOrder } from "../config/Config";
/**
 * @description 載入動畫
 */

export default class UILoading implements ISingleton{
    static module: string = "【UILoading】";
    module: string = null!;
    isResident = true;
    /**@description 當前loading節點 */
    private node: Node = null!;
    private get prefab(){
        return App.uiManager.getScenePrefab("UILoading");
    }
    private delay: number = 0;
    private content: Node = null!;
    private text: Label = null!;
    private _uiName: string = null!;

    /**@description 顯示節點的透明度 */
    private _contentOpacity: UIOpacity = null!;

    private get contentOpacity() {
        if (this._contentOpacity) {
            return this._contentOpacity;
        }
        return this.content.getComponent(UIOpacity) as UIOpacity;
    }

    /**
    * @description 顯示全螢幕載入動畫
    * @param delay 延遲顯示時間 當為null時，不會顯示loading進度，但會顯示阻隔層 >0時為延遲顯示的時間
    */
    public show(delay?: number, name?: string) {
        if (delay == undefined || delay == null || delay < 0) {
            this.delay = Config.LOAD_VIEW_DELAY;
        } else {
            this.delay = delay;
        }
        this._uiName = name ? name : "";
        this._show();
    }
    private _timerId: any = -1;

    /**
     * @description 顯示動畫
     * @param timeOut 超時載入時間。預設10為載入介面失敗
     * @param timeOutCb 超時回撥
     */
    private _show() {
        if ( !this.node ){
            this.node = instantiate(this.prefab) as any;
        }
        this.node.removeFromParent();
        App.uiManager.addView(this.node, ViewZOrder.UILoading);
        this.node.position = Vec3.ZERO;
        this.content = find("content", this.node) as Node;
        Tween.stopAllByTarget(this.contentOpacity);
        this.text = find("text", this.content)?.getComponent(Label) as Label;
        this.text.string = "0%";
        this.contentOpacity.opacity = 0;
        if (this.delay > 0) {
            tween(this.contentOpacity).delay(this.delay).set({ opacity: 255 }).start();
        }
        this.startTimeOutTimer(Config.LOAD_VIEW_TIME_OUT);
        this.node.active = true;
    }


    /**@description 開始計時回撥 */
    private startTimeOutTimer(timeout: number) {
        this.stopTimeOutTimer();
        if (timeout) {
            this._timerId = setTimeout(() => {
                App.tips.show(`加载界面${this._uiName ? this._uiName : ""}超时，请重试`);
                this.hide();
            }, timeout * 1000);
        }
    }
    /**@description 停止計時 */
    private stopTimeOutTimer() {
        clearTimeout(this._timerId);
        this._timerId = -1;
    }

    public hide() {
        this.stopTimeOutTimer();
        if (this.node) {
            Tween.stopAllByTarget(this.content);
            this.node.active = false;
        }
    }

    public updateProgress(progress: number) {
        if (this.text) {
            if (progress == undefined || progress == null || Number.isNaN(progress)) {
                this.hide();
                return;
            }
            if (progress >= 0 && progress <= 100) {
                this.text.string = `${progress}%`;
            }
        }
    }
}
