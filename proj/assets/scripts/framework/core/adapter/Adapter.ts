
import { _decorator, Component, UITransform } from 'cc';
const { ccclass, property } = _decorator;
/**
 * @description 該適配方案出處 https://forum.cocos.org/t/cocos-creator/74001
 */

/**
 * 螢幕解析度下 的畫素值
 */
 export interface SafeArea {
    /**
     * 螢幕解析度下：畫布（螢幕)寬度
     */
    screenWidth: number;

    /**
     * 螢幕解析度下：畫布（螢幕）高度
     */
    screenHeight: number;

    /**
     * 螢幕解析度下：安全區域寬度畫素
     */
    safeAreaWidth: number;

    /**
     * 螢幕解析度下：安全區域高度畫素
     */
    safeAreaHeight: number;

    /**
     * 螢幕解析度下：安全區域距離畫布（螢幕）上邊緣的距離畫素
     */
    safeAreaMarginTop: number;

    /**
     * 螢幕解析度下：安全區域距離畫布（螢幕）下邊緣的距離畫素
     */
    safeAreaMarginBottom: number;

    /**
     * 螢幕解析度下：安全區域距離畫布（螢幕）左邊緣的距離畫素
     */
    safeAreaMarginLeft: number;

    /**
     * 螢幕解析度下：安全區域距離畫布（螢幕）右邊緣的距離畫素
     */
    safeAreaMarginRight: number;

    /**
     * 螢幕解析度下：安全區域 X 偏移畫素（相對於 Cocos 座標系，X軸正方向往右，Y軸正方向往上）
     */
    safeAreaXOffset: number;

    /**
     * 螢幕解析度下：安全區域 Y 偏移畫素（相對於 Cocos 座標系，X軸正方向往右，Y軸正方向往上）
     */
    safeAreaYOffset: number;

    /**
     * 「設計解析度」畫素值轉換到 「螢幕解析度」 下的畫素比
     *
     * e.g.
     *
     * * screenPx = designPx * pixelRatio
     * * designPx = screenPx / pixelRatio
     */
    designPxToScreenPxRatio: number;
}

@ccclass('Adapter')
export class Adapter extends Component {

    protected set width(value: number) {
        let trans = this.getComponent(UITransform);
        if (!trans) {
            return;
        }
        trans.width = value;
    }
    protected get width(){
        let trans = this.getComponent(UITransform);
        if (!trans) {
            return 0;
        }
        return trans.width;
    }

    protected set height(value:number){
        let trans = this.getComponent(UITransform);
        if (!trans) {
            return;
        }
        trans.height = value;
    }

    protected get height(){
        let trans = this.getComponent(UITransform);
        if (!trans) {
            return 0;
        }
        return trans.height;
    }

    protected _func : any = null;

    onLoad(){
        super.onLoad && super.onLoad();
        this.onChangeSize();
    }

    onEnable(){
        super.onEnable && super.onEnable();
        this.addEvents();
    }

    onDisable(){
        this.removeEvents();
        super.onDisable && super.onDisable();
    }

    onDestroy(){
        this.removeEvents();
        super.onDestroy && super.onDestroy();
    }

    protected addEvents(){
        if ( this._func ){
            return;
        }
        this._func = this.onChangeSize.bind(this);
        window.addEventListener("resize",this._func);
        window.addEventListener("orientationchange",this._func);
    }

    protected removeEvents(){
        if ( this._func ){
            window.removeEventListener("resize",this._func);
            window.removeEventListener("orientationchange",this._func);
        }
        this._func = null;
    }

    /**
     * @description 檢視發生大小變化
     */
    protected onChangeSize(){
        
    }
}
