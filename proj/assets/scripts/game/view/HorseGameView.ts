// ---------- 引用 ----------------------------------------------------------------

import { _decorator } from "cc";
import GameView from "../../framework/core/ui/GameView";
import HorseGameData from "../data/HorseGameData";
import { HorseGameLogic } from "../logic/HorseGameLogic";
import { WrapperService } from "../net/WrapperService";

// ---------- 常數 ----------------------------------------------------------------

const { ccclass, property } = _decorator;

@ccclass
export default class HorseGameView extends GameView {

    // ---------- 成員變數 --------------------------------------------------------
    get data() { return App.dataCenter.get(HorseGameData) as HorseGameData; };
    get service() { return App.serviceManager.get(WrapperService); }

    // ---------- 生命週期 --------------------------------------------------------
    onLoad() {
        super.onLoad();
    }

    start() {
        this.init();
    }

    onDestroy() {

    }

    // ---------- 框架呼叫 ------------------------------------------------------

    static logicType = HorseGameLogic;
    static getPrefabUrl() {
        return 'game/prefabs/HorseGameView';
    }

    // ---------- 內部呼叫 --------------------------------------------------------

    /** 初始化 */
    private init() {
        // const { horseGamePrefab } = GameConfigModel.getData().filePaths;
        // const horseGamePf = App.cache.get(this.data.module, horseGamePrefab).data as Prefab;
        // const horseGame = instantiate(horseGamePf);

        // this.Game3D = find('Game3D');
        // this.Game3D.addChild(horseGame);
    }

    // ---------- 外部部呼叫 ------------------------------------------------------

    // ---------- 監聽事件 --------------------------------------------------------

    /** 框架onLoad呼叫 */
    public addEvents() {

    }
}

