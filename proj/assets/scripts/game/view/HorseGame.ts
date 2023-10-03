// ---------- 引用 ----------------------------------------------------------------
import { _decorator, JsonAsset, macro, Node, tween, v3 } from "cc";
import EventComponent from "../../framework/componects/EventComponent";
import { inject } from "../../framework/defines/Decorators";
import { ThirdFreeLookCamera } from "../camera/ThirdFreeLookCamera";
import { Horse } from "../component/Horse";
import HorseGameData from "../data/HorseGameData";
import { HorseGameEvent } from "../event/HorseGameEvent";
import { IHorse } from "../types/type";

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

    @property(JsonAsset)
    dataJson: JsonAsset = null!;

    private horseMap: Map<number, Node> = new Map();
    private frameDataIndex: number = 0;
    private framePerTime: number = 0.15;
    private focusHorse: Node = null;

    // ---------- 生命週期 --------------------------------------------------------
    onLoad(): void {
        super.onLoad();
    }

    start(): void {
        this.init();

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
            this.horseMap.set(i, this.horses.children[i - 1]);
        }
    }

    private startGame() {
        const { frameData, rider, skin } = this.data.getData();
        const firstFrameData = frameData[0];

        for (let i = 0; i < firstFrameData.horses.length; i++) {
            const { horseNumber, x, y } = firstFrameData.horses[i];
            const horse = this.horseMap.get(horseNumber);
            const horseScript = horse.getComponent(Horse);
            const horseData: IHorse = {
                horseNumber: horseNumber,
                saddle: horseNumber,
                horseBody: skin[i],
                jockey: rider[i],
            }

            horse.setPosition(x, 0, y);
            horse.eulerAngles = v3(0, 0, 0);
            horseScript.setData(horseData);

            if (horseNumber == 5) {
                this.focusHorse = horse;
                this.schedule(this.setCameraTarget, 2, macro.REPEAT_FOREVER);
            }
        }

        this.frameDataIndex = 0;
        this.schedule(this.playHorseRun, this.framePerTime, macro.REPEAT_FOREVER);
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

        for (let i = 0; i < frame.horses.length; i++) {
            const { horseNumber, x, y, rotation } = frame.horses[i];
            const { rankNumbers } = frame;
            const horse = this.horseMap.get(horseNumber);

            tween(horse)
                .to(this.framePerTime + 0.01, {
                    position: v3(x, 0, y),
                    eulerAngles: v3(0, -rotation, 0)
                })
                .start();
            
            if (Number(rankNumbers[0]) == horseNumber) {
                this.focusHorse = horse;
            }
        }
    }

    private setCameraTarget() {
        this.camera.target = this.focusHorse;
        this.camera.lookAt = this.focusHorse;
        // this.camera.setCameraFocus();
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