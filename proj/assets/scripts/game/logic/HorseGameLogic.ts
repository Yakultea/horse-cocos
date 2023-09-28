// ---------- 引用 ----------------------------------------------------------------

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

    }

    // ---------- 框架呼叫 ------------------------------------------------------
    reset() { }

    // ---------- 內部呼叫 --------------------------------------------------------

    private _init() {
        if ((<any>window).parent?.hideLogo) {
            (<any>window).parent?.hideLogo();
        }
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