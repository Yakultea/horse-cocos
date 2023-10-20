// ---------- 引用 ----------------------------------------------------------------

import { _decorator, Node, RichText, tween, UITransform, v3 } from "cc";
import GameView from "../../framework/core/ui/GameView";
import { inject } from "../../framework/defines/Decorators";
import { RankItem } from "../component/RankItem";
import HorseGameData from "../data/HorseGameData";
import { HorseGameEvent } from "../event/HorseGameEvent";
import { HorseGameLogic } from "../logic/HorseGameLogic";
import GameConfigModel from "../model/GameConfigModel";
import { IFrameData } from "../types/res-type";
import { IHorse } from "../types/type";

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

    private initRankBar() {
        for (let i = 0; i < this.rankNumbers.children.length; i++) {
            const uiTransform = this.rankNumberMap.get(i + 1);
            const size = (i < 3) ? 88.8 : 74;
            const posX = this.rankNumberPosMap.get(i);

            uiTransform.node.setPosition(posX, 0, 0);
            uiTransform.setContentSize(size, size);
        }
    }

    private updateRankBar(currentFrame: IFrameData) {
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

        this.on(HorseGameEvent.INIT_RANK_BAR, (event: HorseGameEvent) => {
            this.initRankBar();
        });

        this.on(HorseGameEvent.UPDATE_RANK_BAR, (event: HorseGameEvent) => {
            this.updateRankBar(event.data);
        });
    }
}

