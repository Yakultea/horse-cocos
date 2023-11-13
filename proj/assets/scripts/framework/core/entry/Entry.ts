import { js, Node } from "cc";
import { DEBUG } from "cc/env";
import ResourceLoader from "../asset/ResourceLoader";
import { LanguageDelegate } from "../language/LanguageDelegate";
import GameView from "../ui/GameView";

export abstract class Entry {

    static bundle = "";
    gameViewType: typeof GameView = null!;
    /**@description 是否是主包入口，只能有一个主包入口 */
    isMain = false;
    /**@description 當前bundle名,由管理器指定 */
    bundle: string = "";
    /**@description 當前語言包資料來源程式碼，可為null */
    protected language: LanguageDelegate | null = null;

    /**@description 模組資源載入器 */
    protected loader: ResourceLoader = null!;

    /**@description 當前MainController所在節點 */
    protected node: Node = null!;

    /**@description 當膽入口是否已經執行中 */
    isRunning: boolean = false;

    protected _gameView: GameView = null!;
    set gameView(gameView: GameView) {
        this._gameView = gameView;
    }
    get gameView() {
        return this._gameView;
    }

    constructor() {
        this.loader = new ResourceLoader();
    }

    /**@description init之後觸發,由管理器統一排程 */
    onLoad(node: Node): void {
        this.node = node;
        this.isRunning = true;
    }

    /**@description 場景銷燬時觸發,管理器統一排程 */
    onDestroy(): void {
        this.isRunning = false;
    }

    /**@description 管理器通知自己進入GameView */
    onEnter(userData?: any): void {
        //语言包初始化
        App.language.addDelegate(this.language);
        //初始化游戏数据
        this.initData();
        //新增網路事件
        this.addNetHandler();
        //暫停當前網路處理佇列，等資源載入完成後開啟介面
        this.pauseMessageQueue();
        //載入資源
        this.loadResources(() => {
            this.openGameView(userData);
        });
    }

    /**@description 這個位置說明自己GameView 進入onLoad完成 */
    onEnterGameView(gameViw: GameView): void {
        this._gameView = gameViw;
        let viewType = App.uiManager.getViewType(gameViw);
        if (viewType) {
            if (viewType.logicType) {
                viewType.logicType.module = gameViw.bundle as string;
                let logic = App.logicManager.get(viewType.logicType, true);
                if (logic) {
                    gameViw.setLogic(logic);
                }
            } else {
                if (DEBUG) {
                    Log.w(`${js.getClassName(viewType)}未指定logictype`);
                }
            }
        }
    }

    onShowGameView(gameView: GameView) {

    }

    onDestroyGameView(gameView: GameView) {
        this._gameView = null as any;
    }

    /**@description 解除安裝bundle,即在自己bundle刪除之前最後的一條訊息 */
    onUnloadBundle(): void {
        //自己bundle初始卸载前要关闭当前bundle的所有界面
        App.uiManager.closeBundleView(this.bundle);
        //移除入口语言包数据
        App.language.removeDelegate(this.language);
        //移除本模块网络事件
        this.removeNetHandler();
        //解除安裝資源
        this.unloadResources();
    }

    /**@description 新增該模組網路事件 */
    protected abstract addNetHandler(): void;
    protected abstract removeNetHandler(): void;

    /**@description 載入模組資源 */
    protected abstract loadResources(completeCb: () => void): void;
    protected unloadResources(): void {
        this.loader.unLoadResources();
    }

    /**@description 打开游戏主场景视图 */
    protected openGameView(userData?: any): void {
        App.uiManager.open({ type: this.gameViewType, bundle: this.bundle, args: userData });
    }

    protected closeGameView(): void {
        App.uiManager.close(this.gameViewType)
    }

    /**@description 初始化遊戲資料 */
    protected abstract initData(): void;

    /**@description 暫停網路 */
    protected abstract pauseMessageQueue(): void;

    protected abstract resumeMessageQueue(): void;

    /**@description 外部模組可直接指定bund進行去bundle內呼叫 */
    public call(eventName: string, args: any[]): void {

    }
}