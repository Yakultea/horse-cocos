// ---------- 引用 ----------------------------------------------------------------
import { Label, Node, ProgressBar, Sprite, SpriteFrame, Tween, UIOpacity, Vec3, find, instantiate, sp, tween, v3 } from "cc";
import { DEBUG } from "cc/env";
import { Resource } from "../../framework/core/asset/Resource";
import { Config, ViewZOrder } from "../config/Config";

// ---------- 常數 ----------------------------------------------------------------

export interface ILoadingAssetVO {
    background: SpriteFrame,
    spine: sp.SkeletonData,
    barFrame: SpriteFrame,
    bar: SpriteFrame,
    barbg: SpriteFrame,
    barLight: SpriteFrame,
    logo: SpriteFrame,
    startGame: SpriteFrame,
    enterGame?: IEnterGame;
}

interface IEnterGame {
    bg: {
        normal: SpriteFrame;
        pressed: SpriteFrame;
        hover: SpriteFrame;
        disabled: SpriteFrame;
    },
    font: {
        normal: SpriteFrame;
        pressed: SpriteFrame;
        hover: SpriteFrame;
        disabled: SpriteFrame;
    };
}

export enum SpineName {
    LANDSCAPE = 'loading_pc',
    PORTRAIT = 'loading_phone'
}

/**
 * @description 遊戲載入畫面
 */
export default class GameLoading implements ISingleton {
    // ---------- 成員變數 -------------------------------------------------------------
    static module: string = "【GameLoading】";
    module: string = null!;
    isResident = true;
    /**@description 當前loading節點 */
    private node: Node = null!;
    private get prefab() {
        return App.uiManager.getScenePrefab("GameLoading");
    }
    private delay: number = 0;
    private content: Node = null!;
    private percentText: Label = null!; // 百分比
    private bar: ProgressBar = null;
    private barSprite: Node = null;
    private mask: Node = null;
    private barLight: Node = null;
    private barLightPos: Vec3 = null;
    private frame: Node = null;
    private logo: Node = null;
    private startGame: Node = null;

    private background: Node = null;
    private spine: Node = null;
    private message: Label = null;


    private _uiName: string = null!;
    private loadTotal: number = 0;
    private loadedNum: number = 0;
    private isHandlerReady: boolean = false;

    private _timerId: any = -1;

    private loadingVO: ILoadingAssetVO = null!;
    private enterGameSpVO: IEnterGame = null;

    // ---------- 生命週期 -------------------------------------------------------------
    // ---------- 框架呼叫 -------------------------------------------------------------
    // ---------- 內部呼叫 -------------------------------------------------------------

    /**
     * @description 顯示動畫
     */
    private _show() {
        if (!this.node) {
            this.node = instantiate(this.prefab) as any;
        }
        this.node.addComponent(UIOpacity);
        this.node.removeFromParent();
        App.uiManager.addView(this.node, ViewZOrder.UILoading);
        this.node.position = Vec3.ZERO;
        this.content = find("content", this.node) as Node;
        this.background = this.content.getChildByName('background');
        this.spine = this.content.getChildByName('spine');
        this.mask = this.content.getChildByPath('ProgressBar/Mask');
        this.barSprite = this.content.getChildByPath('ProgressBar/Mask/barSprite');
        this.barLight = this.content.getChildByPath('ProgressBar/barLight');
        this.barLightPos = this.barLight.getPosition();
        this.frame = this.content.getChildByPath('ProgressBar/frame');
        this.logo = this.content.getChildByName('logo');
        this.startGame = this.content.getChildByName('startGame');

        this.percentText = find("percent", this.content)?.getComponent(Label) as Label;
        this.percentText.string = "0%";
        this.bar = find("ProgressBar", this.content)?.getComponent(ProgressBar);
        this.message = find("message", this.content)?.getComponent(Label);
        this.bar.progress = 0;
        // this.startTimeOutTimer(Config.LOAD_VIEW_TIME_OUT);
        // this.fadeIn();
        this.node.active = true;
    }

    /**@description 開始計時回撥 */
    private startTimeOutTimer(timeout: number) {
        this.stopTimeOutTimer();
        if (timeout) {
            this._timerId = setTimeout(() => {
                App.tips.show(`加载界面${this._uiName ? this._uiName : ""}超时，请重试`);
                this.hide(false);
            }, timeout * 20000);
        }
    }
    /**@description 停止計時 */
    private stopTimeOutTimer() {
        clearTimeout(this._timerId);
        this._timerId = -1;
    }

    /**
     * 更新載入條
     * @returns 
     */
    private updateProgress() {
        if (this.percentText) {
            let isLoad = this.loadedNum + (this.isHandlerReady ? 1 : 0);
            let progress = Math.ceil((isLoad / this.loadTotal) * 100);
            if (progress == undefined || progress == null || Number.isNaN(progress)) {
                // this.hide();
                return;
            }
            if (progress >= 0 && progress <= 100) {
                this.percentText.string = `${progress}%`;
                this.bar.progress = 1 - progress / 100;
                // tween(this.bar).to(0.3, {
                //     progress: 1- progress / 100
                // }).start();
                const width = this.bar.totalLength * (progress / 100);
                this.barLight.setPosition(v3(this.barLightPos.x + width, this.barLightPos.y));

                if (progress >= 100) {
                    this.hide(false);
                    // setTimeout(() => {
                    //     this.hide(false);
                    // }, 500);
                }
            }
        }
    }

    /**
    * @description 顯示全螢幕載入動畫
    * @param delay 延遲顯示時間 當為null時，不會顯示loading進度，但會顯示阻隔層 >0時為延遲顯示的時間 TODO: 這個delay 有特別的用意嗎?
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

    private hide(needTween: boolean) {
        this.stopTimeOutTimer();
        if (needTween) {
            if (this.node) {
                Tween.stopAllByTarget(this.content);
                tween(this.node.getComponent(UIOpacity))
                    .to(1, { opacity: 0 }, { easing: 'quintIn' })
                    .delay(0.1)
                    .call(() => {
                        this.node.active = false;
                    }).start();
            }
        } else {
            if (this.node) {
                this.node.getComponent(UIOpacity).opacity = 0;
                this.node.active = false;
            }
        }
    }

    /** 淡入 */
    private fadeIn() {
        // 設定初始透明度為0
        this.node.getComponent(UIOpacity).opacity = 0;

        // 設定 Tween 屬性
        tween(this.node.getComponent(UIOpacity))
            .to(0.25, { opacity: 255 }, { easing: 'quintIn' })
            .start();
    }

    /** 設定遊戲相關圖 */
    private setGameSpriteFrame() {
        const { background, spine, barFrame, bar, barbg, barLight, logo, startGame, enterGame } = this.loadingVO;
        this.background.getComponent(Sprite).spriteFrame = background;
        this.spine.getComponent(sp.Skeleton).skeletonData = spine;
        this.spine.getComponent(sp.Skeleton).setAnimation(0, SpineName.LANDSCAPE, true);
        this.bar.getComponent(Sprite).spriteFrame = barbg;
        // this.bar.barSprite.spriteFrame = bar;
        this.mask.getComponent(Sprite).spriteFrame = barbg;
        this.barSprite.getComponent(Sprite).spriteFrame = bar;
        this.barLight.getComponent(Sprite).spriteFrame = barLight;
        this.frame.getComponent(Sprite).spriteFrame = barFrame;
        this.logo.getComponent(Sprite).spriteFrame = logo;
        this.startGame.getComponent(Sprite).spriteFrame = startGame;
        this.enterGameSpVO = enterGame;
    }

    /** 創建進入遊戲按鈕 */
    private createEnterGameBtn() {
        const opacity = this.startGame.getComponent(UIOpacity);
        opacity.opacity = 0;
        tween(opacity)
            .repeatForever(
                tween().to(1, { opacity: 255 }).to(1, { opacity: 170 })
            )
            .start();

        // this.background.on(NodeEventType.TOUCH_START, () => {
        //     (App as unknown as SlotApplication).gameLoading.complete();
        // });
    }

    /** 隱藏進度條 */
    private hideProgressBar() {
        this.bar.node.active = false;
        this.percentText.node.active = false;
    }

    // ---------- 外部部呼叫 -----------------------------------------------------------

    /**
     * 設定loading資源
     * @param sprite loading圖
     */
    public setLoadResource(sprite: SpriteFrame) {
        this.content.getComponent(Sprite).spriteFrame = sprite;
    }

    /**
         * 設定載入條資料
         * @param loaded 已載入
         * @param total 載入總數
         * @param data 資料
         * ex: 
         * this.loader.onLoadProgress = (loadedCount, total, data) => {
               (App as unknown as SlotApplication).gameLoading.setLoading(loadedCount, total);
           };
    */


    /**
     * 設定資源
     * @param data ILoadingAssetVO
     */
    public setData(data: ILoadingAssetVO) {
        this.loadingVO = data;
    }

    public setLoading(loaded: number, total: number, data: Resource.CacheData) {
        if (loaded === 1) {
            this.show();
            // this.setGameSpriteFrame();
        }

        this.loadedNum = loaded;
        this.loadTotal = total + 1;

        this.updateProgress();

        const { type, url, bundle } = data.info;
        if (DEBUG) {
            this.setMessage(`${bundle}/${url}/${typeof type}`);
        }
    }

    /**
     * 完成
     * @param callback 回調 
     */
    public complete(callback?: Function) {
        this.isHandlerReady = true;
        this.updateProgress();
        if (callback) callback();
        // this.setMessage(`完成`);
    }

    /** 設定提示信息 */
    public setMessage(message: string) {
        this.message.string = message;
    }

    /** 顯示進入按鈕 */
    public showEnterGameBtn() {
        this.hideProgressBar();
        this.createEnterGameBtn();
    }
}
