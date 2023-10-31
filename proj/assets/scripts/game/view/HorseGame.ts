// ---------- 引用 ----------------------------------------------------------------
import { Animation, BoxCollider, Node, Vec3, _decorator, director, macro, tween, v3 } from "cc";
import { CommonEvent } from "../../common/event/CommonEvent";
import MathUtil from "../../common/utils/MathUtil";
import EventComponent from "../../framework/componects/EventComponent";
import { inject } from "../../framework/defines/Decorators";
import { ThirdFreeLookCamera, ThirdPersonCameraType } from "../camera/ThirdFreeLookCamera";
import { Horse } from "../component/Horse";
import HorseGameData from "../data/HorseGameData";
import { HorseGameEvent } from "../event/HorseGameEvent";
import GameConfigModel, { EMusic } from "../model/GameConfigModel";
import { IHorse } from "../types/type";

export interface IHorseConfig {
    script: Horse;
    prePos: Vec3;
    curPos: Vec3;
    horseData: IHorse;
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

    @inject("resultCamera", Node)
    private resultCamera: Node = null;

    @inject("goal", BoxCollider)
    private goalCollider: BoxCollider = null;

    private horseMap: Map<number, IHorseConfig> = new Map();
    private frameDataIndex: number = 0;
    private startRunDelay: number = 8;
    private needSlow: boolean = false;
    private oldTick = director.tick;
    private rotateDirType: number = 0; //0是左到右 1是右到左

    // ---------- 生命週期 --------------------------------------------------------
    onLoad(): void {
        super.onLoad();
    }

    start(): void {
        this.init();
        director.tick = (dt: number) => { //複寫遊戲整體速率
            this.oldTick.call(director, dt * (this.needSlow ? 0.05 : 1));
        }

        this.goalCollider.on("onTriggerEnter", () => {
            this.setNeedSlow()
            this.camera.enabled = false;
            dispatch(HorseGameEvent.STOP_BTM, { data: EMusic.RUNNING });
            dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.GOAL } });
        }, this);
    }

    update(dt: number): void {

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
                horseData: null,
            }

            this.horseMap.set(i, config);
        }

        this.setCameraTarget(5);
    }

    private startGame() {
        if (!this.data.getData()) {
            console.warn('沒有資料', this.data.getData());
            return;
        }

        if (typeof (<any>window)?.startRecording == 'function') {
            (<any>window)?.startRecording();
            console.warn('開始錄製');
        }

        const { framePerTime } = GameConfigModel;

        this.frameDataIndex = 0;
        this.needSlow = false;
        this.gate.play('close');
        this.unscheduleAllCallbacks();
        this.setCameraMoving();
        this.setHorses();
        this.setResult();
        this.schedule(this.playHorseRun, framePerTime, macro.REPEAT_FOREVER, this.startRunDelay);
        dispatch(HorseGameEvent.SET_RESULT_ACTIVE, { data: false });
        dispatch(HorseGameEvent.INIT_RANK_BAR);
    }

    private setHorses() {
        const { frameData, rider, skin } = this.data.getData();
        const firstFrame = frameData[0];
        const horsePosx = 650;

        for (let i = 0; i < firstFrame.horses.length; i++) {
            const { horseNumber, x, y } = firstFrame.horses[i];
            const horseScript = this.horseMap.get(horseNumber).script;
            const horse = horseScript.node;
            const horseData: IHorse = {
                horseNumber: horseNumber,
                saddle: horseNumber,
                horseBody: skin[i],
                jockey: rider[i],
            }

            horse.eulerAngles = v3(0, 0, 0);
            horse.setPosition(horsePosx, 0, y);

            horseScript.setData(horseData);
            horseScript.playAnimation(`idle02`);
            this.scheduleOnce(() => {
                horseScript.playAnimation(`idle0${MathUtil.getRandomNumber(1, 2)}`);
            }, Math.random() + 1);

            this.scheduleOnce(() => {
                horseScript.playAnimation(`run02`);
                horseScript.setAniSpeed(Math.random() + 4);
            }, this.startRunDelay);

            if ((this.rotateDirType && horseNumber == 6) || horseNumber == 5) {
                this.setCameraTarget(horseNumber);
            }

            const newConfig: IHorseConfig = {
                script: horseScript,
                prePos: v3(x, 0, y),
                curPos: v3(x, 0, y),
                horseData: horseData,
            }

            this.horseMap.set(horseNumber, newConfig);
        }
    }

    private setCameraMoving() {
        this.camera.enabled = true;
        this.camera.cameraType = ThirdPersonCameraType.RotationAround;
        this.camera.positionOffset = v3(180, 20, 0);
        this.rotateDirType = MathUtil.getRandomNumber(0, 1);

        if (this.rotateDirType) { //從右到左
            this.camera.rotateAngle = -0.2;
            this.camera.node.setPosition(730, 50, 280);
            this.camera.node.eulerAngles = v3(-11, 120, 0);
        } else { //從左到右
            this.camera.rotateAngle = 0.2;
            this.camera.node.setPosition(730, 50, 480);
            this.camera.node.eulerAngles = v3(-11, 30, 0);
        }

        // this.needSlow = false;
        // this.gate.play('close');

        this.resultCamera.position.set(1000, 80, 0);
        this.resultCamera.active = false;

        dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.CHEER } });
        dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.BRASS } });

        this.scheduleOnce(() => {
            this.camera.cameraType = ThirdPersonCameraType.Follow;
            tween(this.camera.positionOffset)
                .to(1, {
                    x: 180,
                    y: 50,
                    z: 0
                })
                .start();
        }, this.startRunDelay - 2.5);

        this.scheduleOnce(() => {
            const random = MathUtil.getRandomNumber(0, 1);

            if (random) {
                tween(this.camera.positionOffset)
                    .to(8, {
                        x: 80,
                        z: -100
                    })
                    .start();
            } else {
                tween(this.camera.positionOffset)
                    .to(8, {
                        x: 0,
                        y: 30,
                        z: 150
                    })
                    .start();
            }

            this.gate.play('open');
            dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.GATE } });
            dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.RUNNING } });
        }, this.startRunDelay);

        this.scheduleOnce(() => {
            const random = MathUtil.getRandomNumber(0, 1);

            this.FocusFirstHorse();

            if (random) {
                this.camera.positionOffset = v3(50, 30, 120);
                tween(this.camera.positionOffset)
                    .to(5, {
                        x: -70,
                        z: 80
                    })
                    .to(4, {
                        x: -90,
                        z: -30
                    })
                    .start();
            } else {
                this.camera.positionOffset = v3(50, 30, -120);
                tween(this.camera.positionOffset)
                    .to(3, {
                        x: 90,
                        z: 100
                    })
                    .to(3, {
                        x: -90,
                    })
                    .to(3, {
                        z: -30,
                    })
                    .start();
            }

        }, this.startRunDelay + 10);

        this.scheduleOnce(() => {
            this.FocusFirstHorse();
            this.camera.positionOffset = v3(-20, 50, 150);

            this.schedule(this.FocusFirstHorse, 0.5, 5);
        }, this.startRunDelay + 19);
    }

    private setResult() {
        const { frameData } = this.data.getData();
        const lastFrame = frameData[frameData.length - 1];
        let topThreeHorseData: IHorse[] = [];

        for (let i = 0; i < 3; i++) {
            const data = this.horseMap.get(Number(lastFrame.goalNumbers[i])).horseData;

            topThreeHorseData.push(data);
        }

        dispatch(HorseGameEvent.SET_RESULT_DATA, { data: topThreeHorseData });
    }

    private playHorseRun() {
        const { rankCompletedIndex } = this.data;
        const { frameData } = this.data.getData();
        const currentFrame = frameData[this.frameDataIndex];
        const { framePerTime } = GameConfigModel;

        if (this.frameDataIndex == rankCompletedIndex + 8) {
            this.unschedule(this.playHorseRun);
            dispatch(HorseGameEvent.SET_RESULT_ACTIVE, { data: true });
            dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.ACHIEVE } });
            this.showResultCamera();

            if (typeof (<any>window)?.stopRecording == 'function') {
                this.scheduleOnce(() => {
                    (<any>window)?.stopRecording();
                    console.warn('結束錄製');
                }, 5);
            }
            return;
        }

        this.frameDataIndex++;

        if (currentFrame.rankNumbers.length == 10) {
            dispatch(HorseGameEvent.UPDATE_RANK_BAR, { data: currentFrame });
        }

        for (let i = 0; i < currentFrame.horses.length; i++) {
            const { horseNumber, x, y, rotation } = currentFrame.horses[i];
            const { script, curPos, horseData } = this.horseMap.get(horseNumber);
            const horse = script.node;
            const newConfig: IHorseConfig = {
                script: script,
                prePos: curPos,
                curPos: v3(x, 0, y),
                horseData: horseData,
            }

            tween(horse)
                .to(framePerTime, {
                    position: v3(x, 0, y),
                })
                .start();

            tween(horse)
                .to(framePerTime * 2, {
                    eulerAngles: v3(0, -rotation, 0)
                })
                .start();

            this.horseMap.set(horseNumber, newConfig);
        }
    }

    private FocusFirstHorse() {
        const { rankNumbers } = this.data.getData().frameData[this.frameDataIndex];

        if (rankNumbers?.length) {
            this.setCameraTarget(Number(rankNumbers[0]));
        }
    }

    private setCameraTarget(horseNumber: number) {
        const horse = this.horseMap.get(horseNumber).script.node;

        this.camera.target = horse;
        this.camera.lookAt = horse;
    }

    private setNeedSlow() {
        this.needSlow = true;
        setTimeout(() => {
            this.needSlow = false;
        }, 800);
    }

    private showResultCamera() {
        this.resultCamera.active = true;
        tween(this.resultCamera)
            .to(5, {
                position: v3(1500, 80, 0)
            })
            .start();
    }

    private restartGame() { //給window.restart()使用的
        const data = (<any>window)?.animeData || (<any>window.parent)?.animeData ;

        if (!data) {
            console.warn('restartGame data有問題', data);
            return;
        }

        console.warn('restartGame data', data);
        this.data.setData(data);
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

        this.on(CommonEvent.RESTART_HORSE_GAME, () => {
            this.restartGame();
        });
    }
}