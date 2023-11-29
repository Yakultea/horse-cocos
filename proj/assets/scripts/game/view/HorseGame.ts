// ---------- 引用 ----------------------------------------------------------------
import { Animation, BoxCollider, Node, ParticleSystem, Prefab, Tween, _decorator, director, instantiate, macro, sys, tween, v3 } from "cc";
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
    private goalCollider: BoxCollider = null; //終點在x = 652

    @inject("particles", Node)
    private particles: Node = null;

    @inject("people", Node)
    private people: Node = null;

    @inject("plants", Node)
    private plants: Node = null;

    @inject("depth", Node)
    private depth: Node = null;

    private horseMap: Map<number, IHorseConfig> = new Map();
    private particleMap: Map<number, ParticleSystem[]> = new Map();
    private frameDataIndex: number = 0;
    private stopRotateDelay: number = 3;
    private startRunDelay: number = 5;
    private enterCornerDelay: number = 13;
    private startSprintingDelay: number = 20;
    private rotateDirType: number = 0; //0是左到右 1是右到左
    private tweenTag: number = 1234;
    private needSlow: boolean = false;
    private particleCounts: number = 7;
    private stopUpdateTime: number = 1200;
    private sprintingZoomInTime: number = 6;
    private resetNeedSlowTimeOut: any;
    private oldTick = director.tick;

    // ---------- 生命週期 --------------------------------------------------------
    onLoad(): void {
        super.onLoad();
    }

    start(): void {
        this.init();
        director.tick = (dt: number) => { //複寫遊戲整體速率
            this.oldTick.call(director, dt * (this.needSlow ? 0.1 : 1));
        }

        this.goalCollider.on("onTriggerEnter", () => {
            if (this.camera.enabled) {
                this.camera.enabled = false;
            }

            this.setNeedSlow();
            dispatch(HorseGameEvent.STOP_BGM);
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

        // if (typeof (<any>window)?.startRecording == 'function') {
        //     (<any>window)?.startRecording();
        //     console.warn('開始錄製');
        // }

        const { framePerTime, isRecordMode } = GameConfigModel;

        this.frameDataIndex = 0;
        this.needSlow = false;
        this.gate.play('close');
        this.unscheduleAllCallbacks();
        Tween.stopAllByTag(this.tweenTag);

        this.setCameraMoving();
        this.setHorses();
        this.setResult();

        this.schedule(this.playHorseRun, framePerTime, macro.REPEAT_FOREVER, this.startRunDelay);
        if (!isRecordMode) this.schedule(this.setParticle, 0.5, macro.REPEAT_FOREVER, this.startRunDelay);

        dispatch(HorseGameEvent.SET_RESULT_ACTIVE, { data: false });
        dispatch(HorseGameEvent.INIT_RANK_BAR);
        dispatch(HorseGameEvent.STOP_BGM);
        dispatch(HorseGameEvent.STOP_BTM, { data: EMusic.RUNNING });
        dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.CHEER } });
        dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.BRASS } });
    }

    private setHorses() {
        const { frameData, rider, skin } = this.data.getData();
        const firstFrame = frameData[0];
        const horsePosx = 650;

        for (let i = 0; i < firstFrame.horses.length; i++) {
            const { horseNumber, y } = firstFrame.horses[i];
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
                horseScript.setAniSpeed(Math.random() + 4.2);
            }, this.startRunDelay);

            if ((this.rotateDirType && horseNumber == 6) || horseNumber == 5) {
                this.setCameraTarget(horseNumber);
            }

            const newConfig: IHorseConfig = {
                script: horseScript,
                horseData: horseData,
            }

            this.horseMap.set(horseNumber, newConfig);
        }
    }

    private setCameraMoving() {
        const { periodId } = this.data.getData();
        const movePathType = Number(periodId) % 4; //4種

        this.camera.enabled = true;
        this.camera.cameraType = ThirdPersonCameraType.RotationAround;
        this.camera.positionOffset = v3(150, 20, 0);
        this.rotateDirType = MathUtil.getRandomNumber(0, 1);

        if (this.rotateDirType) { //從右到左
            this.camera.rotateAngle = -0.25;
            this.camera.node.setPosition(730, 50, 300);
            this.camera.node.eulerAngles = v3(-11, 120, 0);
        } else { //從左到右
            this.camera.rotateAngle = 0.25;
            this.camera.node.setPosition(730, 50, 460);
            this.camera.node.eulerAngles = v3(-11, 30, 0);
        }

        this.resultCamera.position.set(1000, 80, 0);
        this.resultCamera.active = false;

        this.scheduleOnce(() => {
            this.camera.cameraType = ThirdPersonCameraType.Follow;
            tween(this.camera.positionOffset)
                .to(2, {
                    x: 180,
                    y: 50,
                    z: 0
                })
                .tag(this.tweenTag)
                .start();
        }, this.stopRotateDelay);

        this.scheduleOnce(() => {
            if (movePathType == 0 || movePathType == 1) {
                tween(this.camera.positionOffset)
                    .to(8, {
                        x: 80,
                        z: -100
                    })
                    .tag(this.tweenTag)
                    .start();
            } else {
                tween(this.camera.positionOffset)
                    .to(8, {
                        x: 0,
                        y: 30,
                        z: 150
                    })
                    .tag(this.tweenTag)
                    .start();
            }

            this.gate.play('open');
            dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.GATE } });
            dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.RUNNING } });
            dispatch(HorseGameEvent.PLAY_BGM, { data: EMusic.BGM });
        }, this.startRunDelay);

        this.scheduleOnce(() => {
            this.FocusFirstHorse();

            if (movePathType == 0 || movePathType == 3) {
                this.camera.positionOffset = v3(50, 30, 120);
                tween(this.camera.positionOffset)
                    .to(4, {
                        x: -70,
                        z: 80
                    })
                    .to(4, {
                        x: -100,
                        z: -30
                    })
                    .tag(this.tweenTag)
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
                    .to(2, {
                        z: -30,
                    })
                    .tag(this.tweenTag)
                    .start();
            }
        }, this.enterCornerDelay);

        this.scheduleOnce(() => {
            const { rankCompletedIndex } = this.data;
            const totalFrames = this.data.getData().frameData.length;
            const { goalNumbers } = this.data.getData().frameData[totalFrames - 1];
            const finalFirstHorseNumber = Number(goalNumbers[0]);
            let rankCompletedFrame = this.data.getData().frameData[rankCompletedIndex];

            rankCompletedFrame.horses.sort((a, b) => { return a.y - b.y });

            if (goalNumbers?.length) {
                const horseCube = this.horseMap.get(finalFirstHorseNumber).script.getHorseCube();

                this.camera.target = horseCube;
                this.camera.lookAt = horseCube;
            }

            const index = rankCompletedFrame.horses.findIndex(data => data.horseNumber === finalFirstHorseNumber);
            // const distance = 180 - 9 * index;
            // const height = 90 - 1.5 * index;
            const distance = 180 - 7 * index;
            const height = 80 + 0.1 * index;
            // const height = 80;

            this.camera.positionOffset = v3(-40, height, distance + 90);
            tween(this.camera.positionOffset)
                .to(this.sprintingZoomInTime, {
                    x: 0,
                    z: distance
                })
                .start();

            if (typeof (<any>window)?.startRecording == 'function') {
                (<any>window)?.startRecording();
                console.warn('開始錄製');
            }
        }, this.startSprintingDelay);
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
        const { framePerTime } = GameConfigModel;
        const currentFrame = frameData[this.frameDataIndex];
        const stopRecordingDelay = 1;

        if (this.frameDataIndex == rankCompletedIndex + 8) {
            this.unschedule(this.playHorseRun);
            this.unschedule(this.setParticle);
            dispatch(HorseGameEvent.SET_RESULT_ACTIVE, { data: true });
            dispatch(HorseGameEvent.PLAY_BTM, { data: { url: EMusic.ACHIEVE } });
            this.showResultCamera();

            if (typeof (<any>window)?.stopRecording == 'function') {
                this.scheduleOnce(() => {
                    (<any>window)?.stopRecording();
                    console.warn('結束錄製');
                }, stopRecordingDelay);
            }
            return;
        }

        this.frameDataIndex++;

        if (currentFrame.rankNumbers.length == this.horseMap.size) {
            dispatch(HorseGameEvent.UPDATE_RANK_BAR, { data: currentFrame });
        }

        for (let i = 0; i < currentFrame.horses.length; i++) {
            const { horseNumber, x, y, rotation } = currentFrame.horses[i];
            const { script, horseData } = this.horseMap.get(horseNumber);
            const horse = script.node;
            const newConfig: IHorseConfig = {
                script: script,
                horseData: horseData,
            }

            tween(horse)
                .to(framePerTime, {
                    position: v3(x, 0, y),
                })
                .tag(this.tweenTag)
                .start();

            tween(horse)
                .to(framePerTime * 2, {
                    eulerAngles: v3(0, -rotation, 0)
                })
                .tag(this.tweenTag)
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
        clearTimeout(this.resetNeedSlowTimeOut);

        this.needSlow = true;
        this.resetNeedSlowTimeOut = setTimeout(() => {
            this.needSlow = false;
        }, this.stopUpdateTime);
    }

    private showResultCamera() {
        this.resultCamera.active = true;
        tween(this.resultCamera)
            .to(5, {
                position: v3(1500, 80, 0)
            })
            .tag(this.tweenTag)
            .start();
    }

    private setParticle() {
        let randomHorseNumbers: number[] = [];

        while (randomHorseNumbers.length < this.particleCounts) {
            const randomNum = Math.floor(Math.random() * this.horseMap.size) + 1;

            if (randomHorseNumbers.indexOf(randomNum) === -1) {
                randomHorseNumbers.push(randomNum);
            }
        }

        for (let i = 0; i < this.particleCounts; i++) {
            this.scheduleOnce(() => {
                const horsePos = this.horseMap.get(randomHorseNumbers[i]).script.node.position;
                const particles = this.particleMap.get(i);

                particles.forEach((particle) => {
                    particle.simulationSpeed = Math.random() * (2 - 1) + 1;
                    particle.node.setPosition(horsePos);
                    particle.play();
                });
            }, Math.random() * 5);
        }
    }

    private createParticle() {
        const { clodParticle, dustParticle } = GameConfigModel.getData().filePaths;
        const clodPf = App.cache.get(this.data.module, clodParticle).data as Prefab;
        const dustPf = App.cache.get(this.data.module, dustParticle).data as Prefab;

        for (let i = 0; i < this.particleCounts; i++) {
            const clod = instantiate(clodPf);
            const dust = instantiate(dustPf);

            this.particles.addChild(clod);
            this.particles.addChild(dust);

            clod.setPosition(0, 0, 0);
            dust.setPosition(0, 0, 0);

            this.particleMap.set(i, [clod.getComponent(ParticleSystem), dust.getComponent(ParticleSystem)]);
        }
    }

    private restartGame() { //給window.restart()使用的
        const data = (<any>window)?.animeData || (<any>window.parent)?.animeData;

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
        this.on(HorseGameEvent.ON_ENTER_GAME, () => {
            this.createParticle();
        });

        this.on(HorseGameEvent.PARSE_COMPLETED, () => {
            this.startGame();
        });

        this.on(CommonEvent.RESTART_HORSE_GAME, () => {
            this.restartGame();
        });

        this.on(HorseGameEvent.RECORD_MODE, () => {
            this.people.active = false;
            this.plants.active = false;
            this.depth.active = false;
            this.particles.removeAllChildren();
        });
    }
}