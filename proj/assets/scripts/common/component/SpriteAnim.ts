import { CCFloat, Component, Sprite, SpriteFrame, _decorator } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class SpriteAnim extends Component {
    @property(CCFloat)
    duration: number = 0.1; // 帧的时间间隔

    // 帧动画的图片, 多张图片
    @property({
        type: SpriteFrame
    })
    spriteFrames: SpriteFrame[] = [];

    public loop = false; // 是否循环播放;
    public playOnload = false; // 是否在加载的时候就开始播放;

    private endFunc: Function = null;
    private isPlaying: boolean = false;
    private playTime: number = null;
    private sprite: Sprite = null;

    onLoad() {
        this.isPlaying = false; // 加一个变量
        this.playTime = 0; // 播放的时间

        // 获得了精灵组件
        this.sprite = this.getComponent(Sprite);
        if (!this.sprite) {
            this.sprite = this.addComponent(Sprite);
        }
        // end

        if (this.playOnload) { // 如果在加载的时候开始播放
            if (this.loop) { // 循环播放
                this.playLoop();
            }
            else { // 播放一次
                this.playOnce(null);
            }
        }
    }

    playLoop() {
        if (this.spriteFrames.length <= 0) {
            return;
        }

        this.loop = true;
        this.endFunc = null;

        this.isPlaying = true; // 正在播放
        this.playTime = 0; // 播放的时间

        this.sprite.spriteFrame = this.spriteFrames[0];
    }

    // 需要播放结束以后的回掉, callback
    playCount(count: number, callback: Function) {
        let currentCount = 0;
        let playOnce = () => this.playOnce(() => {
            currentCount += 1;
            if (currentCount === count) {
                callback();
            } else {
                playOnce();
            }
        });
        playOnce();
    }

    // 需要播放结束以后的回掉, callback
    playOnce(callback: Function) {
        if (this.spriteFrames.length <= 0) {
            return;
        }

        this.endFunc = callback;
        this.loop = false;
        this.isPlaying = true; // 正在播放
        this.playTime = 0; // 播放的时间

        this.sprite.spriteFrame = this.spriteFrames[0];
    }

    update(dt: number) {
        if (!this.isPlaying) {
            return;
        }

        this.playTime += dt; // 当前我们过去了这么多时间;
        var index = Math.floor(this.playTime / this.duration);

        // 非循环播放
        if (!this.loop) {
            if (index >= this.spriteFrames.length) { // 如果超过了，播放结束
                this.isPlaying = false;
                if (this.endFunc) {
                    this.endFunc();
                }
            }
            else {
                this.sprite.spriteFrame = this.spriteFrames[index]; // 修改当前时刻显示的正确图片;
            }
        }
        else { // 循环播放
            while (index >= this.spriteFrames.length) {
                index -= this.spriteFrames.length;
                this.playTime -= (this.spriteFrames.length * this.duration);
            }
            this.sprite.spriteFrame = this.spriteFrames[index];
        }
    }
}