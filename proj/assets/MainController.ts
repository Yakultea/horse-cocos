import { Asset, find, Game, _decorator, Node, Input, profiler, screen } from "cc";
import { Config } from "./scripts/common/config/Config";
import { DebugView } from "./scripts/common/debug/DebugView";
import EventComponent from "./scripts/framework/componects/EventComponent";
import UrlModel from "./scripts/common/model/UrlModel";
import UrlUtils from "./scripts/common/utils/UrlUtils";
import SocketModel from "./scripts/wrapper/script/model/SocketModel";
import { EOrientationType } from "./scripts/framework/core/adapter/AdapterEvent";
import WrapperData from "./scripts/wrapper/script/data/WrapperData";
import { LogLevel } from "./scripts/framework/defines/Enums";
import { DEBUG } from "cc/env";
// ---------- 常數 ----------------------------------------------------------------
/**
 * @description 主控制器 
 */

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("Quick公共元件/MainController")
export default class MainController extends EventComponent {

    // ---------- 成員變數 --------------------------------------------------------
    @property(Asset)
    wssCacert: Asset = null!;

    private debugView: Node | null = null!;

    // ---------- 生命週期 --------------------------------------------------------
    onLoad() {
        super.onLoad();
        App.onLoad(this.node);
        if (this.wssCacert) {
            App.wssCacertUrl = this.wssCacert.nativeUrl;
        }
        let debug = find("debug", this.node);
        this.debugView = find("debugView", this.node);
        if (debug && this.debugView) {
            let isVisibleDebugInfo = App.storage.getItem(Config.SHOW_DEBUG_INFO_KEY, false);
            if (isVisibleDebugInfo) {
                profiler.showStats();
            } else {
                profiler.hideStats();
            }
            if (Config.isShowDebugButton) {
                debug.active = true;
                let view = this.debugView.addComponent(DebugView);
                if (view) {
                    view.debug = debug;
                }
                this.debugView.active = false;

                debug.on(Input.EventType.TOUCH_END, () => {
                    if (debug) debug.active = false;
                    if (this.debugView) {
                        this.debugView.active = true;
                    }
                });
                this.onN(debug, Input.EventType.TOUCH_END, () => {
                    if (debug) debug.active = false;
                    if (this.debugView) {
                        this.debugView.active = true;
                    }
                });
            } else {
                debug.destroy();
                this.debugView.destroy();
            }

        }
        //游戏事件注册
        this.onG(Game.EVENT_HIDE, this.onEnterBackground);
        this.onG(Game.EVENT_SHOW, this.onEnterForgeground);
        //内存警告事件
        this.onG(Game.EVENT_LOW_MEMORY, this.onLowMemory);

        this.setOrientation();
    }

    update(dt: number) {
        App.update(this.node);
    }

    onDestroy() {
        App.onDestroy(this.node);
        super.onDestroy();
    }

    // ---------- 框架呼叫 ------------------------------------------------------
    // ---------- 內部呼叫 --------------------------------------------------------

    private onEnterBackground() {
        App.onEnterBackground();
    }

    private onEnterForgeground() {
        App.onEnterForgeground();
    }

    private onLowMemory() {
        App.onLowMemory();
    }

    /** 設定直橫式 */
    private setOrientation() {
        let canvasSize = screen.windowSize;
        const canvasSizeRate = canvasSize.width / canvasSize.height;
        App.dataCenter.get(WrapperData).orientation = canvasSizeRate > 1 ? EOrientationType.LANDSCAPE : EOrientationType.PORTRAIT;
    }

    // ---------- 外部部呼叫 ------------------------------------------------------
}
