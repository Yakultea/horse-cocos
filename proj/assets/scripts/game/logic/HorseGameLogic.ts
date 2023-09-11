// ---------- 引用 ----------------------------------------------------------------

import { sys, screen } from "cc";
import { AdapterEvent, EOrientationType } from "../../framework/core/adapter/AdapterEvent";
import ResourceLoader from "../../framework/core/asset/ResourceLoader";
import { Logic } from "../../framework/core/logic/Logic";
import HorseGameData from "../data/HorseGameData";
import { HorseGameEvent } from "../event/HorseGameEvent";
import HorseGameView from "../view/HorseGameView";

// ---------- 常數 ----------------------------------------------------------------
export class HorseGameLogic extends Logic {
    // ---------- 成員變數 --------------------------------------------------------
    get data() { return App.dataCenter.get(HorseGameData); }
    get view() { return this.gameView as HorseGameView; }

    private loader = new ResourceLoader;

    // ---------- 生命週期 --------------------------------------------------------

    onLoad(gameview: GameView) {
        super.onLoad(gameview);
        this._init();
    }

    onDestroy() {
        // 卸载资源
        // this.loader.unLoadResources();
        // 清除缓存
        // this.data.clear();
        // super.onDestroy();
    }


    // ---------- 框架呼叫 ------------------------------------------------------
    reset() { }

    // ---------- 內部呼叫 --------------------------------------------------------

    private _init() {
        if ((<any>window).parent?.hideLogo) {
            (<any>window).parent?.hideLogo();
        }
        // this._mobileBrowserSetting();
        // this.loadResources();
    }

    /** 資源加載 */
    private loadResources() {
        // // 設定載入資源
        // this.loader.getLoadResources = () => {
        //     let res: Resource.Data[] = [
        //         // { url: "prefabs/SomeItem", bundle: this.bundle, type: Prefab },
        //     ];

        //     return res;
        // };

        // // 載入資源complete
        // this.loader.onLoadComplete = (err) => {
        //     if (err = Resource.LoaderError.SUCCESS) {
        //         // 初始化資源
        //     }
        // };

        // // 執行載入動作
        // this.loader.loadResources();
    }

    // ---------- 外部部呼叫 ------------------------------------------------------

    // ---------- 監聽事件 --------------------------------------------------------
    /** 框架onLoad呼叫 */
    public addEvents() {
        this.on(AdapterEvent.ORIENTATION, this.orientationHandler);
        // this.on(WrapperEvent.SWIPE_UP, () => {
        //     if (!this._mainDocument) return
        //     this._mainDocument.removeEventListener('scroll', this._scroll)
        // })
    }

    private orientationHandler = (type: EOrientationType) => {
        this.data.orientation = type;

        // this._setSwipeHandler()
    };




    // SWIPE

    private _mobileBrowserSetting() {
        const { platform } = sys;
        // if (platform === 'MOBILE_BROWSER') this._setSwipe();
    }

    private _showSwipeTimeId: number = null
    private _swipeContainer: HTMLElement
    private _iframeContainer: HTMLElement
    private _orientation: AdapterEvent = null
    private _mainDocument: Document = null;
    private _setSwipe() {
        this._mainDocument = window.parent.document;
        this._swipeContainer = this._mainDocument.getElementById('swipe');
        this._iframeContainer = this._mainDocument.getElementById('iframeWrapper');

        this._setSwipeHandler()
    }

    private _hideSwipe = () => {
        console.log('hideSwipe');

        // this._swipeContainer.style.display = 'none';
        this._swipeContainer.style.zIndex = '-1';
        this._iframeContainer.style.zIndex = '9999'
        // this._swipeContainer.style.pointerEvents = 'none'
    }

    private _scroll = (e: any) => {
        console.log('onscroll', e);

        if (e.target.scrollingElement.scrollTop > 0) {
            this._hideSwipe()
            dispatch(HorseGameEvent.SWIPE_UP);
        }
    }

    private _showSwipe = () => {
        console.log('showSwipe');
        this._swipeContainer.style.display = 'block';
        this._swipeContainer.style.zIndex = '1000';
        this._swipeContainer.style.pointerEvents = 'auto'
        this._iframeContainer.style.zIndex = '10'
        this._mainDocument.scrollingElement.scrollTop = 0

        this._mainDocument.addEventListener('scroll', this._scroll)
    }

    private _setSwipeHandler = () => {
        if (!this._swipeContainer) return console.warn('_swipeContainer not found');
        const canvasSize = screen.windowSize;
        const canvasSizeRate = canvasSize.width / canvasSize.height;
        const orientation = canvasSizeRate > 1 ? EOrientationType.LANDSCAPE : EOrientationType.PORTRAIT;

        console.warn('orientation', orientation);
        if (this._orientation === orientation) return console.warn('orientationHandler same type', orientation);
        this._orientation = orientation

        this._hideSwipe()
        this._showSwipeTimeId && clearTimeout(this._showSwipeTimeId)
        this._showSwipeTimeId = setTimeout(this._showSwipe, 10);

        console.warn('setSwipeHandler finished');
    }
}