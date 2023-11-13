// ---------- 引用 ----------------------------------------------------------------
import { _decorator, Sprite } from "cc";
import EventComponent from "../../framework/componects/EventComponent";
import { inject } from "../../framework/defines/Decorators";
import HorseGameData from "../data/HorseGameData";
import { IHorse } from "../types/type";

// ---------- 常數 ----------------------------------------------------------------

const { ccclass, property } = _decorator;

@ccclass("RankItem")
export class RankItem extends EventComponent {
    // ---------- 成員變數 --------------------------------------------------------
    private get data() { return App.dataCenter.get(HorseGameData); }

    @inject("horse", Sprite)
    private horse: Sprite = null;

    @inject("jockey", Sprite)
    private jockey: Sprite = null;

    @inject("horseNumber", Sprite)
    private horseNumber: Sprite = null;

    // ---------- 生命週期 --------------------------------------------------------
    onLoad(): void {
        super.onLoad();
    }

    start(): void {
        this.init();
    }

    onDestroy(): void {
        super.onDestroy();
    }

    // ---------- 框架呼叫 ------------------------------------------------------

    // ---------- 內部呼叫 --------------------------------------------------------
    /** 初始化 */
    private init() { }

    // ---------- 外部部呼叫 ------------------------------------------------------
    /** 重置 */
    public reset() { }

    /** 設定資料 載入順序:setData -> onLoad -> start -> init */
    public setData(data: IHorse) {
        const { horseNumber, horseBody, jockey } = data;

        this.horseNumber.spriteFrame = this.data.getGameTexture(`top${horseNumber}`);
        this.horse.spriteFrame = this.data.getGameTexture(`horse${horseBody}`);
        this.jockey.spriteFrame = this.data.getGameTexture(`jockey${jockey}`);
    }

    /** 顯示 */
    public show() {
        this.node.active = true;
    }

    /** 隱藏 */
    public hide() {
        this.node.active = false;
    }

    // ---------- 監聽事件 --------------------------------------------------------
    /** 框架onLoad呼叫 */
    public addEvents() {

    }

}