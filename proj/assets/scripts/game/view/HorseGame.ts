// ---------- 引用 ----------------------------------------------------------------
import { Animation, Game, JsonAsset, Node, Vec3, _decorator, director, game, macro, tween, v3 } from "cc";
import MathUtil from "../../common/utils/MathUtil";
import EventComponent from "../../framework/componects/EventComponent";
import { inject } from "../../framework/defines/Decorators";
import { ThirdFreeLookCamera } from "../camera/ThirdFreeLookCamera";
import { Horse } from "../component/Horse";
import HorseGameData from "../data/HorseGameData";
import { HorseGameEvent } from "../event/HorseGameEvent";
import { IHorse } from "../types/type";

export interface IHorseConfig {
    script: Horse;
    prePos: Vec3;
    curPos: Vec3;
    preDistance: number;
}

// ---------- 常數 ----------------------------------------------------------------
const { ccclass, property } = _decorator;

@ccclass("HorseGame")
export class HorseGame extends EventComponent {
    // ---------- 成員變數 --------------------------------------------------------
    private get data() { return App.dataCenter.get(HorseGameData); }

    @inject("horses", Node)
    private horses: Node = null;

    @inject("Camera", ThirdFreeLookCamera)
    private camera: ThirdFreeLookCamera = null;

    @inject("gate", Animation)
    private gate: Animation = null;

    @inject("goalCamera", Node)
    private goalCamera: Node = null;

    @property(JsonAsset)
    dataJson: JsonAsset = null!;

    private horseMap: Map<number, IHorseConfig> = new Map();
    private frameDataIndex: number = 0;
    private framePerTime: number = 0.04;
    private focusHorse: Node = null;
    private startRunDelay: number = 2;
    private needSlow: boolean = false;
    private oldTick = director.tick;

    // ---------- 生命週期 --------------------------------------------------------
    onLoad(): void {
        super.onLoad();
    }

    start(): void {
        this.init();
        director.tick = (dt: number) => { //複寫遊戲整體速率
            this.oldTick.call(director, dt * (this.needSlow ? 0.15 : 1));
        }

        // this.data.setData(this.dataJson.json.data);

        // this.scheduleOnce(()=>{
        //     App.gameLoading.complete();
        //     this.startGame();
        // }, 5)
    }

    onDestroy(): void {
        super.onDestroy();
    }

    // ---------- 框架呼叫 ------------------------------------------------------

    // ---------- 內部呼叫 --------------------------------------------------------
    /** 初始化 */
    private init() {
        for (let i = 1; i <= this.horses.children.length; i++) {
            const config: IHorseConfig = {
                script: this.horses.children[i - 1].getComponent(Horse),
                prePos: v3(0, 0, 0),
                curPos: v3(0, 0, 0),
                preDistance: 0,
            }

            this.horseMap.set(i, config);
        }

        this.focusHorse = this.horseMap.get(5).script.node;
        this.setCameraTarget();
    }

    private startGame() {
        if (!this.data.getData()) {
            console.warn('沒有資料', this.data.getData());
            return;
        }

        this.unschedule(this.playHorseRun);
        this.unschedule(this.setCameraTarget);
        this.switchCamera(true);
        this.needSlow = false;

        const { frameData, rider, skin } = this.data.getData();
        const firstFrameData = frameData[0];

        for (let i = 0; i < firstFrameData.horses.length; i++) {
            const { horseNumber, x, y } = firstFrameData.horses[i];
            const horseScript = this.horseMap.get(horseNumber).script;
            const horse = horseScript.node;
            const horseData: IHorse = {
                horseNumber: horseNumber,
                saddle: horseNumber,
                horseBody: skin[i],
                jockey: rider[i],
            }

            horseScript.setData(horseData);
            horse.eulerAngles = v3(0, 0, 0);
            horse.setPosition(315, 0, y);
            this.gate.play('close');
            horseScript.playAnimation('idle02');
            horseScript.setAniSpeed(Math.random()*3);

            this.scheduleOnce(() => {
                horseScript.playAnimation(`run0${MathUtil.getRandomNumber(1, 2)}`);
                horseScript.setAniSpeed(3);
                this.gate.play('open');
            }, this.startRunDelay);

            if (horseNumber == 5) {
                this.focusHorse = horse;
                this.setCameraTarget();
                // this.schedule(this.setCameraTarget, 1, macro.REPEAT_FOREVER);
            }

            const newConfig: IHorseConfig = {
                script: horseScript,
                prePos: v3(x, 0, y),
                curPos: v3(x, 0, y),
                preDistance: 0,
            }

            this.horseMap.set(horseNumber, newConfig);
        }

        this.frameDataIndex = 0;
        this.schedule(this.playHorseRun, this.framePerTime, macro.REPEAT_FOREVER, this.startRunDelay);
    }

    private playHorseRun() {
        const { frameData } = this.data.getData();
        const frame = frameData[this.frameDataIndex];
        const totalFrame = frameData.length;

        if (totalFrame == this.frameDataIndex + 1) {
            this.unschedule(this.playHorseRun);
            this.unschedule(this.setCameraTarget);
            return;
        }

        this.frameDataIndex++;

        if (this.frameDataIndex == this.data.firstRankIndex - 9) {
            this.switchCamera(false);
            this.needSlow = true;
        }

        for (let i = 0; i < frame.horses.length; i++) {
            const { horseNumber, x, y, rotation } = frame.horses[i];
            const { rankNumbers } = frame;
            const { script, curPos, preDistance } = this.horseMap.get(horseNumber);
            const horse = script.node;

            tween(horse)
                .to(this.framePerTime, {
                    position: v3(x, 0, y),
                    eulerAngles: v3(0, -rotation, 0)
                })
                .start();

            if (Number(rankNumbers[0]) == horseNumber) {
                this.focusHorse = horse;
            }

            const distance = curPos.subtract(v3(x, 0, y)).length().toFixed(2);
            const newConfig: IHorseConfig = {
                script: script,
                prePos: curPos,
                curPos: v3(x, 0, y),
                preDistance: parseFloat(distance),
            }

            this.horseMap.set(horseNumber, newConfig);

            if (preDistance && distance) {
                const ratio = parseFloat(distance) / preDistance;
                const randomSpeed = (ratio > 1) ? MathUtil.getRandomNumber(4, 5) : MathUtil.getRandomNumber(2, 3);

                script.setAniSpeed(randomSpeed);
            }
        }
    }

    private setCameraTarget() {
        this.camera.target = this.focusHorse;
        this.camera.lookAt = this.focusHorse;
    }

    private switchCamera(isActive: boolean) {
        this.camera.node.active = isActive;
        this.goalCamera.active = !isActive;
    }

    // ---------- 外部部呼叫 ------------------------------------------------------
    /** 重置 */
    public reset() { }

    /** 設定資料 載入順序:setData -> onLoad -> start -> init */
    public setData(data: any) { }

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
        this.on(HorseGameEvent.PARSE_COMPLETED, () => {
            this.startGame();
        });
    }
}