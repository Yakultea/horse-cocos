
import { _decorator, Component, Node, find, Toggle, view, Input, profiler ,screen, input } from 'cc';
import EventComponent from '../../framework/componects/EventComponent';
import { inject } from '../../framework/defines/Decorators';
import { LogLevel } from '../../framework/defines/Enums';
import Singleton  from '../../framework/utils/Singleton';
import { Config } from '../config/Config';
const { ccclass, property } = _decorator;

@ccclass('DebugView')
export class DebugView extends EventComponent {

    @inject("logView",Node)
    private logView: Node = null!;
    @inject("content",Node)
    private content: Node = null!;
    @inject("background",Node)
    private background : Node = null!;
    @inject("background",Node,"logView")
    private logViewBackground : Node = null!;
    onLoad() {

        //顯示介面資訊
        this.bindEvent("showUI", this.onShowUI);
        //顯示節點資訊
        this.bindEvent("showNode", this.onShowNode);
        //顯示資源快取資訊
        this.bindEvent("showRes", this.onShowRes);
        //顯示當前元件資訊
        this.bindEvent("showComponent", this.onShowComp);
        //顯示除錯資訊
        this.bindEvent("showDebugInfo", this.onShowDebugInfo);
        this.bindEvent("log", this.onLog);
        //邏輯管理器資訊輸出
        this.bindEvent("logic", this.onLogicManager);
        //資料中心
        this.bindEvent("dataCenter", this.onDataCenter);
        //bundle入口管理器
        this.bindEvent("entry", this.onEntry);
        //proto 資訊輸出 
        this.bindEvent("proto", this.onProto);
        //bundle管理器
        this.bindEvent("bundleMgr", this.onBundleMgr);
        //節點快取池
        this.bindEvent("pool", this.onPool);
        //Senders
        this.bindEvent("sender", this.onSender);
        this.bindEvent("handler", this.onHandler);
        //網路管理器
        this.bindEvent("serviceManager", this.onServiceManager);
        //熱火更新管理
        this.bindEvent("hotupdate", this.onHotUpdate);
        //記憶體警告
        this.bindEvent("lowMemory", this.onLowMemory);
        //釋放管理器
        this.bindEvent("releaseManager", this.onReleaseManager);
        //介面卡
        this.bindEvent("adaptor", this.onAdaptor);
        //當前所有單例
        this.bindEvent("singleton", this.onSingleton);
        // TODO: 新增 commandManager、FlowManager debugView
        
        this.doOther();
    }
    debug: Node = null!;

    private doOther() {
        if (this.logView) {
            this.logView.active = false;
            this.initLogView();
        }
        this.onN(this.background,Input.EventType.TOUCH_END, () => {
            this.node.active = false;
            if (this.debug) this.debug.active = true;
        });
    }

    private bindEvent(path: string, cb: ()=>void) {
        let node = find(path, this.content);
        this.onN(node!,Input.EventType.TOUCH_END,cb);
    }

    private initLogView() {
        this.onN(this.logViewBackground,Input.EventType.TOUCH_END, () => {
            this.logView.active = false;
        });

        let level = find("level", this.logView);
        if (level) {
            for (let i = 0; i < level.children.length - 1; i++) {
                let node = find(`type${i}`, level);
                if (node) {
                    let toggle = node.getComponent(Toggle);
                    if (toggle) {
                        toggle.isChecked = App.logger.isValid(this.getLogLevel(i));
                    }
                    this.onN(node,"toggle", (toggle: Toggle) => {
                        if (toggle.isChecked) {
                            App.logger.attach(this.getLogLevel(i));
                        } else {
                            App.logger.detach(this.getLogLevel(i));
                        }
                    });
                }
            }
        }
    }

    private getLogLevel(index: number) {
        switch (index) {
            case 0: return LogLevel.DEBUG;
            case 1: return LogLevel.WARN;
            case 2: return LogLevel.ERROR;
            case 3: return LogLevel.DUMP;
            default: return LogLevel.DEBUG;
        }
    }

    private onLogicManager() {
        App.logicManager.debug();
    }

    private onDataCenter() {
        App.dataCenter.debug();
    }

    private onEntry() {
        App.entryManager.debug();
    }

    private onProto() {
        App.protoManager.debug()
    }

    private onBundleMgr() {
        App.bundleManager.debug();
    }

    private onPool() {
        App.pool.debug();
    }

    private onLog() {
        this.logView.active = true;
    }

    private onShowDebugInfo() {
        if (profiler.isShowingStats() ){
            profiler.hideStats();
        }else{
            profiler.showStats();
        }
        App.storage.setItem(Config.SHOW_DEBUG_INFO_KEY, profiler.isShowingStats());
    }

    private onShowUI() {
        App.uiManager.debug({showViews:true});
    }

    private onShowNode() {
        App.uiManager.debug({showChildren:true});
    }

    private onShowRes() {
        App.cache.debug();
    }

    private onShowComp() {
        App.uiManager.debug({showComp:true});
    }

    private onSender() {
        App.senderManager.debug();
    }

    private onHandler(){
        App.handlerManager.debug();
    }

    private onServiceManager() {
        App.serviceManager.debug();
    }

    private onHotUpdate() {
        App.updateManager.debug()
    }

    private onLowMemory() {
        App.onLowMemory();
    }

    private onReleaseManager() {
        App.releaseManger.debug()
    }

    private onAdaptor() {
        Log.d(`-----------------------------適配資訊-----------------------------------------------`);
        Log.d(`螢幕解析度: ${screen.windowSize.width} x ${screen.windowSize.height}`);
        Log.d(`檢視視窗可見區域解析度: ${view.getVisibleSize().width} x ${view.getVisibleSize().height}`);
        Log.d(`檢視中邊框尺寸: ${screen.windowSize.width} x ${screen.windowSize.height}`);
        Log.d(`裝置或瀏覽器畫素比例: ${screen.devicePixelRatio}`);
        Log.d(`返回檢視視窗可見區域畫素尺寸: ${view.getVisibleSizeInPixel().width} x ${view.getVisibleSizeInPixel().height}`);
        Log.d(`當前場景設計解析度: ${view.getDesignResolutionSize().width} x ${view.getDesignResolutionSize().height}`);
        let viewRate = screen.windowSize.width/screen.windowSize.height;
        let designRate = view.getDesignResolutionSize().width/view.getDesignResolutionSize().height;
        Log.d(`檢視寬高比:${viewRate}`);
        Log.d(`設定解析度寬高比:${designRate}`);
    }

    private onSingleton() {
        Singleton.instance.debug();
    }
}

