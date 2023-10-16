// ---------- 引用 ----------------------------------------------------------------

import { _decorator, Node, RichText, tween, UITransform, v3, Vec3 } from "cc";
import GameView from "../../framework/core/ui/GameView";
import { inject } from "../../framework/defines/Decorators";
import HorseGameData from "../data/HorseGameData";
import { HorseGameLogic } from "../logic/HorseGameLogic";
import { RankItem } from "../component/RankItem";
import { HorseGameEvent } from "../event/HorseGameEvent";
import { IHorse } from "../types/type";
import { IFrameData } from "../types/res-type";
import GameConfigModel from "../model/GameConfigModel";

// ---------- 常數 ----------------------------------------------------------------

const { ccclass, property } = _decorator;

@ccclass
export default class HorseGameView extends GameView {

    // ---------- 成員變數 --------------------------------------------------------
    get data() { return App.dataCenter.get(HorseGameData) as HorseGameData; };

    @inject("content/result", Node)
    private result: Node = null;

    @inject("content/result/topInfo/periodId", RichText)
    private periodId: RichText = null;

    @inject("content/result/rankContent", Node)
    private rankContent: Node = null;

    @inject("content/rankBar/rankNumbers", Node)
    private rankNumbers: Node = null;

    private rankNumberPosMap: Map<number, number> = new Map(); //key是由左到右的順序 value是位置
    private rankNumberMap: Map<number, UITransform> = new Map(); //key是horseNumber value是節點的UITransform

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

        for (let i = 0; i < this.rankNumbers.children.length; i++) {
            const node = this.rankNumbers.children[i];
            const pos = this.rankNumbers.children[i].position;

            this.rankNumberMap.set(i + 1, node.getComponent(UITransform));
            this.rankNumberPosMap.set(i, pos.x);
        }

        // this.node.active = false;
    }

    private setResult(data: IHorse[]) {
        const { periodId } = this.data.getData();

        for (let i = 0; i < this.rankContent.children.length; i++) {
            this.rankContent.children[i].getComponent(RankItem).setData(data[i]);
        }

        this.periodId.string = `<color=#906914>${periodId}</color>  <color=#ababab>期</color>`;
    }

    private updateRank(currentFrame: IFrameData) {
        const { rankNumbers, goalNumbers } = currentFrame;
        const { framePerTime } = GameConfigModel;
        let showRank: string[] = rankNumbers;

        for (let i = 0; i < goalNumbers.length; i++) {
            showRank[i] = goalNumbers[i];
        }

        for (let i = 0; i < showRank.length; i++) {
            const uiTransform = this.rankNumberMap.get(Number(showRank[i]));
            const size = (i < 3) ? 88.8 : 74;
            const posX = this.rankNumberPosMap.get(i);

            tween(uiTransform.node)
                .to(framePerTime, {
                    position: v3(posX, 0, 0),
                })
                .start();

            tween(uiTransform)
                .to(framePerTime, {
                    width: size,
                    height: size,
                })
                .start();
        }
    }

    // ---------- 外部部呼叫 ------------------------------------------------------

    // ---------- 監聽事件 --------------------------------------------------------

    /** 框架onLoad呼叫 */
    public addEvents() {
        this.on(HorseGameEvent.SET_RESULT_DATA, (event: HorseGameEvent) => {
            this.setResult(event.data);
        });

        this.on(HorseGameEvent.SET_RESULT_ACTIVE, (event: HorseGameEvent) => {
            this.result.active = event.data;
        });

        this.on(HorseGameEvent.UPDATE_RANK_BAR, (event: HorseGameEvent) => {
            this.updateRank(event.data);
        });
    }
}

