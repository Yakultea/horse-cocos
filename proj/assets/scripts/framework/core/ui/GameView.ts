/**@description 遊戲層公共基類 */

import { _decorator } from "cc";
import UIView from "./UIView";

/**
 * @description 遊戲檢視基類,處理了前後臺切換對網路進行後臺最大允許時間做統一處理,
 * 遊戲層設定為ViewZOrder.zero
 */

const {ccclass, property,menu} = _decorator;

@ccclass
@menu("Quick公共元件/GameView")
export default class GameView extends UIView {

    static logicType : ModuleClass<Logic> | null = null;
    protected _logic : Logic | null = null;
    protected get logic(){
        return this._logic;
    }
    /**@description 由管理器統一設定，請勿操作 */
    setLogic(logic : Logic ){
        this._logic = logic;
        if ( logic ){
            logic.onLoad(this);
        }
    }
    onLoad(){
        super.onLoad();
        //進入場景完成，即onLoad最後一行  必須發進入完成事件
        this.onEnterGameView()
    }

    show(args ?: any[] | any){
        super.show(args);
        App.entryManager.onShowGameView(this.bundle,this);
    }

    protected onEnterGameView(){
        App.entryManager.onEnterGameView(this.bundle,this);
    }

    /**
     * @description 進入指定Bundle
     * @param bundle Bundle名
     * @param userData 使用者自定義資料
     */
    enterBundle( bundle : BUNDLE_TYPE , userData ?: any){
        App.entryManager.enterBundle(bundle , userData);
    }

    /**
     * @description 返回上一場景
     * @param userData 使用者自定義資料
     */
    backBundle(userData?:any){
        App.entryManager.backBundle(userData);
    }

    onDestroy(){
        if ( this.audioHelper ){
            //停止背景音樂
            //this.audioHelper.stopMusic();
            this.audioHelper.stopAllEffects();
        }
        if ( this.logic ){
            App.logicManager.destory(this.logic.bundle);
        }
        App.entryManager.onDestroyGameView(this.bundle,this);
        super.onDestroy();
    }

    update(dt:number){
        if ( this.logic ){
            this.logic.update(dt);
        }
    }

    /**@description 遊戲重置 */
    protected reset(){
        if ( this.logic ){
            this.logic.reset(this);
        }
    }
}
