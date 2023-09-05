import EventComponent from "../../componects/EventComponent";
import AudioComponent from "../../componects/AudioComponent";
import { _decorator, Node, game, Game, EventKeyboard, macro, input, Input } from "cc";
import { Macro } from "../../defines/Macros";

/**
 * @description 檢視基類
 */
const { ccclass, property , menu} = _decorator;

@ccclass
@menu("Quick公共元件/UIView")
export default class UIView extends EventComponent {

    /**
	 *@description 檢視prefab 地址 resources目錄下如z_panels/WeiZoneLayer,如果是在主場景(main.scene)上的節點，
     * 使用Canvas:xx/xx
	 * ex:
     * static getPrefabUrl(){
	 *   return `@LoginView`;
	 * } 
	 */
    public static getPrefabUrl(): string {
        Log.e(`請求實現public static getPrefabUrl`);
        return Macro.UNKNOWN;
    }

    /**@description ViewOption.args引數 */
    private _args?: any[] | any;
    /**@description 透過UI管理器開啟時的傳入ViewOption.args引數 */
    public get args() {
        return this._args;
    }
    public set args(args) {
        this._args = args;
    }

    /**本組件的類名 */
    private _className: string = "unknow";
    public set className(value: string) {
        this._className = value;
    }
    public get className(): string {
        return this._className;
    }

    private _bundle: BUNDLE_TYPE = null!;
    /**指嚮當前View開啟時的bundle */
    public set bundle(value) {
        this._bundle = value;
    }
    public get bundle() {
        return this._bundle;
    }

    /**@description 關閉介麵動畫 */
    protected get closeAction() : ViewAction | null{
        return null;
    } 

    public close( ) {
        if ( this.closeAction ){
            this.closeAction(()=>{
                App.uiManager.close(this.className);
            });
        }else{
            App.uiManager.close(this.className);
        }
    }

    protected get showAction() : ViewAction | null{
        return null;
    }

    /**@description args為open代入的引數 */
    public show( args ?: any[] | any) {
        //再如果介麵已經存在於介麵管理器中，此時傳入新的引數，隻從show裡麵過來,這裡重新對_args重新賦值
        this._args = args;
        if (this.node) this.node.active = true;
        if ( this.showAction ){
            this.showAction(()=>{});
        }
    }

    protected get hideAction() : ViewAction | null{
        return null;
    }

    public hide( ) {
        if ( this.hideAction ){
            this.hideAction(()=>{
                if (this.node) this.node.removeFromParent();
            });
        }else{
            if (this.node) this.node.removeFromParent();
        }
    }

    protected _enabledKeyUp: boolean = false;
    /**@description 是否啟用鍵盤擡起事件 */
    protected get enabledKeyUp() {
        return this._enabledKeyUp;
    }
    protected set enabledKeyUp(value) {
        this._enabledKeyUp = value;
        if (value) {
            this.onI(Input.EventType.KEY_UP, this.onKeyUp);
        } else {
            this.offI(Input.EventType.KEY_UP, this.onKeyUp);
        }
    }

    protected _enabledKeyDown: boolean = false;
    /**@description 是否啟用鍵盤按下事件 */
    protected get enabledKeyDown() {
        return this._enabledKeyUp;
    }
    protected set enabledKeyDown(value) {
        this._enabledKeyUp = value;
        if (value) {
            this.onI(Input.EventType.KEY_DOWN, this.onKeyDown);
        } else {
            this.offI(Input.EventType.KEY_DOWN, this.onKeyDown);
        }
    }

    protected onKeyUp(ev: EventKeyboard) {
        if (ev.keyCode == macro.KEY.escape) {
            this.onKeyBackUp(ev);
        } else {
            ev.propagationStopped = true;
        }
    }

    protected onKeyDown(ev: EventKeyboard) {
        if (ev.keyCode == macro.KEY.escape) {
            this.onKeyBackDown(ev);
        } else {
            ev.propagationStopped = true;
        }
    }

    protected onKeyBackUp(ev: EventKeyboard) {
        //隻有一個接受，不再嚮上傳播
        ev.propagationStopped = true;
    }

    protected onKeyBackDown(ev: EventKeyboard) {
        ev.propagationStopped = true;
    }

    audioHelper: AudioComponent = null!;

    onLoad() {
        this.audioHelper = <AudioComponent>(this.addComponent(AudioComponent));
        this.audioHelper.owner = this;
        super.onLoad();
    }

    private _enterBackgroundTime = 0;
    private _enableFrontAndBackgroundSwitch = false;
    protected set enableFrontAndBackgroundSwitch(value) {
        this._enableFrontAndBackgroundSwitch = value;
        if (value) {
            this.onG(Game.EVENT_SHOW, this._onEnterForgeGround);
            this.onG(Game.EVENT_HIDE, this._onEnterBackground);
        } else {
            this.offG(Game.EVENT_SHOW, this._onEnterForgeGround);
            this.offG(Game.EVENT_HIDE, this._onEnterBackground);
        }
    }
    protected get enableFrontAndBackgroundSwitch() {
        return this._enableFrontAndBackgroundSwitch;
    }

    private _onEnterBackground() {
        this._enterBackgroundTime = Date.timeNow();
        this.onEnterBackground();
    }

    private _onEnterForgeGround() {
        let now = Date.timeNow();
        let inBackgroundTime = now - this._enterBackgroundTime;
        this.onEnterForgeground(inBackgroundTime);
    }

    protected onEnterForgeground(inBackgroundTime: number) {

    }
    protected onEnterBackground() {

    }
}