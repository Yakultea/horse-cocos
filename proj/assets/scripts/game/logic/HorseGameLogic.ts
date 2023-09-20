// ---------- 引用 ----------------------------------------------------------------

import { AdapterEvent, EOrientationType } from "../../framework/core/adapter/AdapterEvent";
import { Resource } from "../../framework/core/asset/Resource";
import ResourceLoader from "../../framework/core/asset/ResourceLoader";
import { Logic } from "../../framework/core/logic/Logic";
import HorseGameData from "../data/HorseGameData";
import { HorseGameEvent } from "../event/HorseGameEvent";
import { IHorseAnime } from "../types/res-type";
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

        this.loadResources();
    }

    /** 資源加載 */
    private loadResources() {
        // // 設定載入資源
        this.loader.getLoadResources = () => {
            let res: Resource.Data[] = [
                // { url: "prefabs/SomeItem", bundle: this.bundle, type: Prefab },
            ];

            return res;
        };

        // 載入資源complete
        this.loader.onLoadComplete = (err) => {
            if (err = Resource.LoaderError.SUCCESS) {
                // 初始化資源
            }
        };

        // 執行載入動作
        this.loader.loadResources();
    }

    // ---------- 外部部呼叫 ------------------------------------------------------

    // ---------- 監聽事件 --------------------------------------------------------
    /** 框架onLoad呼叫 */
    public addEvents() {
        this.on(AdapterEvent.ORIENTATION, (event) => {
            this.orientationHandler(event.data);
        });

        this.on(HorseGameEvent.HORSE_ANIME_RESPONSE, (event: HorseGameEvent) => {
            this.parseHorseAnime(event.data);
        });
    }

    private orientationHandler(type: EOrientationType) {
        this.data.orientation = type;
    };

    private parseHorseAnime(data: any) {
        this.data.setData(data.data);
    }
}