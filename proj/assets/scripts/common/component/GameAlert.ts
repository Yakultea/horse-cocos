import { find, input, Input, instantiate, isValid, Label, Node, Prefab, RichText, tween, Vec3, Color, Sprite, log } from "cc";
import EventComponent from "../../framework/componects/EventComponent";
import { inject } from "../../framework/defines/Decorators";
import { ViewZOrder } from "../config/Config";
import { EBundles } from "../data/Bundles";


export interface GameAlertConfig extends AlertConfig {
    /**@description 顏色風格 */
    colorStyle?: Color,
    /**@description 擴充區塊標題 */
    expandTitle?: string,
    /**@description 擴充區塊數字 */
    expandNum?: string,
    /**@description 點擊BBR 回調*/
    bbrCb?: (isOK: boolean) => void,
    /**@description 點擊BBR 回調*/
    bbrColor?: Color,
    /** 需要完成時關閉彈窗嗎 預設 true */
    needCloseAlert?: boolean;
    /** 錯誤碼 */
    code?: string;
}

class GameAlertDialog extends EventComponent {

    /**@description 壓黑背景 */
    @inject("bbr", Node)
    private _bbr: Node = null!;
    /**@description 顯示內容(背景) */
    @inject("content", Node)
    private _content: Node = null!;
    /**@description 標題 */
    @inject("title", Node, "content")
    private _title: Node = null!;
    /**@description 顯示擴充區塊 */
    @inject("expand", Node, "content")
    private _expand: Node = null!;
    /**@description 擴充區塊背景 */
    @inject("expand/bg", Node, "content")
    private _expandBg: Node = null!;
    /**@description 擴充區塊標題 */
    @inject("expand/label", Label, "content")
    private _expandTitle: Label = null!;
    /**@description 擴充區塊數字 */
    @inject("expand/num", Label, "content")
    private _expandNum: Label = null!;
    /**@description 顯示訊息文字 */
    @inject("message", Label, "content")
    private _message: Label = null!;
    /**@description 確定按鈕 */
    @inject("button/confirm", Node, "content")
    private _confirm: Node = null!;
    /**@description 取消按鈕 */
    @inject("button/cancel", Node, "content")
    private _cancel: Node = null!;
    /**@description 取消按鈕 */
    @inject("errorCode", Node, "content")
    private errorCode: Node = null;
    /**@description 配置資訊 */
    private _config: GameAlertConfig = null!;

    public get config() {
        return this._config;
    }

    private finishAlertCb: Function = null;

    public show(config: GameAlertConfig) {
        if (!config.confirmString) {
            config.confirmString = App.getLanguage("alertConfirm", [], EBundles[EBundles.horseGame]);
        }
        if (!config.cancelString) {
            config.cancelString = App.getLanguage("alertCancel", [], EBundles[EBundles.horseGame]);
        }
        if (config.colorStyle) {
            this._content.getComponent(Sprite).color = config.colorStyle;
        }
        if (config.bbrColor) {
            this._bbr.getComponent(Sprite).color = config.bbrColor;
        }

        this._config = config;
        this.writeContent(config);
        this.showButton(config);
        config?.code && this.setErrorCode(config);
        this._show();
    }

    /** 設定錯誤碼 */
    private setErrorCode(config: GameAlertConfig) {
        this.errorCode.active = true;
        this.errorCode.getComponent(Label).string = `${config.code}`;
    }

    private _show() {
        if (this._content) {
            tween(this._content)
                .set({ scale: new Vec3(0.2, 0.2, 0.2) })
                .to(0.2, { scale: new Vec3(1.1, 1.1, 1.1) })
                .delay(0.05)
                .to(0.1, { scale: new Vec3(1.0, 1, 1) })
                .start();
        }
    }

    public setFinishAlert(Cb: Function) {
        this.finishAlertCb = Cb;
    }

    /**@description 寫入提示文字 */
    private writeContent(config: GameAlertConfig) {
        //寫內容
        if (config.text) {
            this._message.string = config.text;
        } else {
            Log.e("請指定提示內容");
            this._message.string = "";
        }
        //寫標題
        if (config.title) {
            this._title.active = true;
            this._title.getComponent(Label).string = config.title;
        } else {
            this._title.active = false;
        }

        if (config.expandTitle) {
            this._expand.active = true;
            this._expandTitle.string = config.expandTitle;
            this._expandNum.string = config.expandNum;
        } else {
            this._expand.active = false;
        }

        //寫按鈕
        if (config.confirmString) {
            let title = find("Label", this._confirm);
            if (title) {
                let lb = title.getComponent(Label);
                if (lb) lb.string = config.confirmString;
            }
        }

        if (config.cancelString) {
            let title = find("Label", this._cancel);
            if (title) {
                let lb = title.getComponent(Label);
                if (lb) lb.string = config.cancelString;
            }
        }
    }

    /**@description 顯示按鈕 */
    private showButton(config: GameAlertConfig) {
        // const {  } = config;
        const needCloseAlert = config.needCloseAlert !== undefined ? config.needCloseAlert : true;
        if (this._confirm && this._cancel) {
            //點擊背景關閉
            if (config.bbrCb) {
                this._bbr.on(Input.EventType.TOUCH_END, this.onClick.bind(this, config.bbrCb, false, needCloseAlert));
            } else {
                Log.d('請設定 bbrCb');
            }

            //確定按鈕
            if (config.confirmCb) {
                this._confirm.active = true;
                this._confirm.on(Input.EventType.TOUCH_END, this.onClick.bind(this, config.confirmCb, true, needCloseAlert));
            }
            else {
                this._confirm.active = false;
            }

            //取消按鈕
            if (config.cancelCb) {
                this._cancel.active = true;
                this._cancel.on(Input.EventType.TOUCH_END, this.onClick.bind(this, config.cancelCb, false, needCloseAlert));
            } else {
                this._cancel.active = false;
            }
        }
    }

    /**@description 關閉 */
    private close() {
        // this._close(null);
    }
    private _close(needCloseAlert: boolean, complete: (() => void) | null) {
        if (isValid(this._content)) {
            // this._content.stopAllActions();
            if (needCloseAlert) {
                tween(this._content)
                    .to(0.2, { scale: new Vec3(1.15, 1.15, 1.15) })
                    .to(0.1, { scale: new Vec3(0.3, 0.3, 0.3) })
                    .call(() => {
                        this.finishAlertCb();

                        if (complete) complete();
                    })
                    .start();
            } else {
                if (complete) complete();
            }

        }
    }

    private onClick(cb: (isOk: boolean) => void, isOk: boolean, needCloseAlert: boolean) {
        if (this._config.immediatelyCallback) {
            if (cb) cb(isOk);
            this._close(needCloseAlert, null);
        } else {
            this._close(needCloseAlert, () => {
                if (cb) cb(isOk);
            });
        }
    }
}

export default class GameAlert implements ISingleton {
    static module: string = "【GameAlert】";
    module: string = null!;
    isResident = true;
    private curPanel: Node = null!;
    private queue: GameAlertConfig[] = [];
    public get currentPanel() { return this.curPanel; }

    private getConfig(config: GameAlertConfig) {
        let result: GameAlertConfig = {};
        if (config.tag) {
            result.tag = config.tag;
        }
        if (config.text) {
            result.text = config.text;
        }
        if (config.title) {
            result.title = config.title;
        }
        if (config.confirmString) {
            result.confirmString = config.confirmString;
        }
        if (config.cancelString) {
            result.cancelString = config.cancelString;
        }
        if (config.richText) {
            result.richText = config.richText;
        }
        if (config.immediatelyCallback) {
            result.immediatelyCallback = config.immediatelyCallback;
        }
        if (config.isRepeat) {
            result.isRepeat = config.isRepeat;
        }
        if (config.needCloseAlert) {
            result.needCloseAlert = config.needCloseAlert;
        }
        if (config.code) {
            result.code = config.code;
        }
        return result;
    }
    /**
     * @description 顯示彈出框
     * @param config 配置資訊
     */
    public show(config: GameAlertConfig, zOrder: number = ViewZOrder.Alert) {
        if (config.tag && config.isRepeat === false) {
            if (this.isRepeat(config.tag)) {
                Log.w(`彈出框已經存在 config : ${JSON.stringify(this.getConfig(config))}`);
                return false;
            }
        }
        this.queue.push(config);
        this._show(config, zOrder);
        return true;
    }

    /**@description 當前顯示的彈出框是否是tag */
    public isCurrentShow(tag: string | number) {
        if (this.curPanel) {
            let current = this.curPanel.getComponent(GameAlertDialog)?.config;
            if (current && current.tag == tag) {
                return true;
            }
        }
        return false;
    }

    /**@description 獲取當前顯示彈出的配置 */
    public currentShow(tag?: string | number) {
        if (this.curPanel) {
            let current = this.curPanel.getComponent(GameAlertDialog)?.config;
            if (tag && current && current.tag == tag) {
                return current;
            } else {
                return current;
            }
        }
        return null;
    }

    /**@description 是否有該型別的彈出框 */
    public isRepeat(tag: string | number) {
        if (this.curPanel) {
            let current = this.curPanel.getComponent(GameAlertDialog)?.config;
            if (current && current.tag == tag) {
                Log.w(`重複的彈出框 config ; ${JSON.stringify(this.getConfig(current))}`);
                return true;
            }
        } else {
            for (let i = 0; i < this.queue.length; i++) {
                let data = this.queue[i];
                if (data.tag == tag) {
                    Log.w(`重複的彈出框 config ; ${JSON.stringify(this.getConfig(data))}`);
                    return true;
                }
            }
        }
        return false;
    }

    /**@description 關閉當前顯示的 
     * @param tag 可不傳，關閉當前的彈出框，否則關閉指定tag的彈出框
     */
    public close(tag?: string | number) {
        if (tag) {
            let j = this.queue.length;
            while (j--) {
                if (this.queue[j].tag == tag) {
                    this.queue.splice(j, 1);
                }
            }
            if (this.curPanel) {
                let current = this.curPanel.getComponent(GameAlertDialog)?.config;
                if (current && current.tag == tag) {
                    this.finishAlert();
                }
            }
        } else {
            this.finishAlert();
        }
    }

    public closeAll() {
        this.queue = [];
        this.finishAlert();
    }

    public finishAlert() {
        if (this.curPanel) {
            this.curPanel.destroy();
            this.curPanel = <any>null;
        }

        let config = this.queue.shift();
        if (this.queue.length != 0) {
            this._show(this.queue[0]);
            return this.queue[0];
        }
        return config;
    }

    private _show(config: GameAlertConfig, zOrder: number = ViewZOrder.Alert) {
        // if (!this.curPanel) {
        //     log(App.cache);
        //     let data = App.cache.get(EBundles[EBundles.slotFramework], "prefabs/GameAlert").data as Prefab;
        //     this.curPanel = instantiate(data);
        //     let dialog = this.curPanel.addComponent(GameAlertDialog);
        //     App.uiManager.addView(this.curPanel, zOrder);
        //     dialog.setFinishAlert(this.finishAlert.bind(this));
        //     dialog.show(config);
        // }
    }
}

