import { js } from "cc";
import { EventProcessor } from "../event/EventProcessor";
import { Macro } from "../../defines/Macros";

export class Logic extends EventProcessor {
    /**@description 所屬模組,管理器設定，GameView中的bundle的值 */
    static module = Macro.UNKNOWN;
    /**@description 所屬模組,管理器設定，GameView中的bundle的值 */
    module = Macro.UNKNOWN;
    /**@description 當前邏輯管理器bundle */
    get bundle() {
        return this.module;
    }

    protected gameView: GameView = null!;

    /**@description 重置遊戲邏輯 */
    reset(gameView: GameView) { }

    onLoad(gameView: GameView): void {
        this.gameView = gameView;
        super.onLoad(gameView);
    }
    update(dt: number): void { }

    destory(...args: any[]): void {
        this.onDestroy();
    }

    debug(){
        Log.d(`${this.module} : ${js.getClassName(this)}`);
    }
}