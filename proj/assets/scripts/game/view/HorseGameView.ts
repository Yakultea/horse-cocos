// ---------- 引用 ----------------------------------------------------------------

import { _decorator, Label, Node, Toggle, tween, UITransform, v3 } from "cc";
import { CmmUtils } from "../../common/utils/CmmUtils";
import GameView from "../../framework/core/ui/GameView";
import { inject } from "../../framework/defines/Decorators";
import { RankItem } from "../component/RankItem";
import HorseGameData from "../data/HorseGameData";
import { HorseGameEvent } from "../event/HorseGameEvent";
import { HorseGameLogic } from "../logic/HorseGameLogic";
import GameConfigModel, { EMusic } from "../model/GameConfigModel";
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

    @inject("content/result/topInfo/periodId", Label)
    private periodId: Label = null;

    @inject("content/result/rankContent", Node)
    private rankContent: Node = null;

    @inject("content/rankBar/rankNumbers", Node)
    private rankNumbers: Node = null;

    @inject("content/musicToggle", Toggle)
    private musicToggle: Toggle = null;

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

        const musicCheckEvent = CmmUtils.getEventHandler(this.node, 'onMusicCheck');

        this.musicToggle.checkEvents.push(musicCheckEvent);
        this.audioHelper.musicVolume = 1;
        this.audioHelper.effectVolume = 1;
    }

    private setResult(data: IHorse[]) {
        const { periodId } = this.data.getData();

        for (let i = 0; i < this.rankContent.children.length; i++) {
            this.rankContent.children[i].getComponent(RankItem).setData(data[i]);
        }

        this.periodId.string = `${periodId}  期`;
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

    private playBGM(url: EMusic) {
        this.audioHelper.playMusic(url, this.bundle);
    }

    private playBTM(url: EMusic, loop: boolean = false) {
        this.audioHelper.playEffect(url, this.bundle, loop);
    }

    private stopBTM(url: EMusic) {
        this.audioHelper.stopEffect(url, this.bundle);
    }

    private stopBGM() {
        this.audioHelper.stopMusic();
    }

    public onMusicCheck(event: Event): void{
        const isOn = this.musicToggle.isChecked;

        this.audioHelper.musicVolume = isOn ? 1 : 0;
        this.audioHelper.effectVolume = isOn ? 1 : 0;
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

        this.on(HorseGameEvent.PLAY_BGM, (event: HorseGameEvent) => {
            this.playBGM(event.data);
        });

        this.on(HorseGameEvent.PLAY_BTM, (event: HorseGameEvent) => {
            const { url, loop } = event.data;

            this.playBTM(url, loop);
        });

        this.on(HorseGameEvent.STOP_BTM, (event: HorseGameEvent) => {
            this.stopBTM(event.data);
        });

        this.on(HorseGameEvent.STOP_BGM, (event: HorseGameEvent) => {
            this.stopBGM();
        });
    }
}

