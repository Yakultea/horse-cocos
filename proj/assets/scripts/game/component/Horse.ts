// ---------- 引用 ----------------------------------------------------------------
import { _decorator, BoxCollider, Node, SkeletalAnimation, SkinnedMeshRenderer, tween } from "cc";
import EventComponent from "../../framework/componects/EventComponent";
import { inject } from "../../framework/defines/Decorators";
import HorseGameData from "../data/HorseGameData";
import { IHorse } from "../types/type";

// ---------- 常數 ----------------------------------------------------------------
const { ccclass, property } = _decorator;

@ccclass("Horse")
export class Horse extends EventComponent {
    // ---------- 成員變數 --------------------------------------------------------
    private get data() { return App.dataCenter.get(HorseGameData); }

    @inject("player_gp/horse_gp/saddle_lod", SkinnedMeshRenderer)
    private saddle: SkinnedMeshRenderer = null;

    @inject("player_gp/horse_gp/new_horse", SkinnedMeshRenderer)
    private horseBody: SkinnedMeshRenderer = null;

    @inject("player_gp/jockey_gp/jockey", SkinnedMeshRenderer)
    private jockey: SkinnedMeshRenderer = null;

    private horseNumber: number = null;
    private horseAnimations: SkeletalAnimation = null;
    private curAniName: string = null;

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
    private init() {
        this.horseAnimations = this.node.getComponent(SkeletalAnimation);
    }

    // ---------- 外部部呼叫 ------------------------------------------------------
    /** 重置 */
    public reset() { }

    /** 設定資料 載入順序:setData -> onLoad -> start -> init */
    public setData(data: IHorse) {
        const { horseNumber, horseBody, saddle, jockey } = data;
        const saddleMat = this.data.getHorseMaterial(`saddle_${saddle.toString().padStart(2, '0')}`);
        const horseBodyMat = this.data.getHorseMaterial(`horseBody_${horseBody.toString().padStart(2, '0')}`);
        const jockeyMat = this.data.getHorseMaterial(`jockey_${jockey.toString().padStart(2, '0')}`);

        this.horseNumber = horseNumber;
        this.saddle.setMaterial(saddleMat, 0);
        this.horseBody.setMaterial(horseBodyMat, 0);
        this.jockey.setMaterial(jockeyMat, 0);
    }

    public playAnimation(name: string) {
        this.curAniName = name;
        this.horseAnimations.play(name);
    }

    public setAniSpeed(speed: number) {
        const state = this.horseAnimations.getState(this.curAniName);

        tween(state)
            .to(0.3, {
                speed: speed
            })
            .start();
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