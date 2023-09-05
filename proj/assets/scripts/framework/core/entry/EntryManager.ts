import { EntryDelegate } from "./EntryDelegate";
import { Node } from "cc";
import { DEBUG } from "cc/env";
import { Macro } from "../../defines/Macros";
import { UpdateItem } from "../update/UpdateItem";
import GameView from "../ui/GameView";

/**@description 入口管理 */
export class EntryManager implements ISingleton{
    static module: string = "【入口管理器】";
    module: string = null!;
    isResident?: boolean  = true;
    private _entrys: Map<string, Entry> = new Map();

    /**@description 預設代理，可根據自己專案需要重新實現 */
    public delegate: EntryDelegate = new EntryDelegate();

    private node: Node | null = null;

    /**@description 注册入口 */
    register(entryClass: EntryClass<Entry>,type:typeof GameView) {
        let entry = this.getEntry(entryClass.bundle);
        if (entry) {
            if ( DEBUG ){
                Log.w(`${this.module}更新Bundle : ${entryClass.bundle} 入口程式!!!`);
            }
            this._entrys.delete(entryClass.bundle);
        }
        entry = new entryClass;
        entry.bundle = entryClass.bundle;
        entry.gameViewType = type;
        this._entrys.set(entry.bundle, entry);
        if (this.node) {
            if ( DEBUG ){
                Log.d(`${this.module} ${entry.bundle} onLoad`);
            }
            entry.onLoad(this.node);
        }
    }

    onLoad(node: Node) {
        this.node = node;
        this._entrys.forEach((entry,key)=>{
            if ( !entry.isRunning ){
                entry.onLoad(this.node as Node);
                if ( entry.isMain ){
                    if ( DEBUG ){
                        Log.d(`${this.module}${entry.bundle} onEnter`);
                    }
                    //啟動主程式入口
                    entry.onEnter();
                }
            }
        });
    }

    onDestroy(node: Node) {
        this._entrys.forEach((entry) => {
            entry.onDestroy();
        });
    }

    /**@description 主包檢測更新 */
    onCheckUpdate() {
        this.delegate.onCheckUpdate();
    }

    call(bundle: BUNDLE_TYPE, eventName: string, ...args: any[]) {
        let entry = this.getEntry(bundle);
        if (entry) {
            entry.call(eventName, args);
        }
    }

    /**
     * @description 進入bundle,預設代理沒辦法滿足需求的情況，可自行定製 
     * @param bundle bundle
     * @param userData 使用者自定義資料
     **/
    
    enterBundle(bundle: BUNDLE_TYPE , userData ?: any) {
        let config = this.delegate.getEntryConfig(bundle);
        if (config) {
            if (bundle == Macro.BUNDLE_RESOURCES) {
                let entry = this.getEntry(bundle);
                this.delegate.onEnterMain(entry,userData);
            } else {
                config.userData = userData;
                App.bundleManager.enterBundle(config);
            }
        }
    }

    /**
     * @description 返回上一場景 
     * */
    backBundle( userData ?: any ){
        let bundle = App.stageData.prevWhere;
        if ( bundle ){
            this.enterBundle(bundle,userData);
        }else{
            Log.d(`${this.module}已經是最後一個場景，無法返回`);
        }
    }

    /**@description 載入bundle完成 */
    onLoadBundleComplete(item:UpdateItem) {
        // 加载完成后，记录加载过的标识
        item.isLoaded = true;
        //通知入口管理进入bundle
        let entry = this.getEntry(item.bundle);
        if (entry) {
            entry.onEnter(item.userData);
        }
    }

    /**@description 進入GameView完成，解除安裝除了自己之外的其它bundle */
    onEnterGameView(bundle: BUNDLE_TYPE, gameView: GameView) {
        let entry = this.getEntry(bundle);
        if (entry) {
            this.delegate.onEnterGameView(entry, gameView);
            entry.onEnterGameView(gameView);
        }
    }

    /**@description 管理器呼叫show時,在GameView的onLoad之後  */
    onShowGameView(bundle : BUNDLE_TYPE , gameView : GameView){
        let entry = this.getEntry(bundle);
        if ( entry ){
            this.delegate.onShowGameView(entry,gameView);
            entry.onShowGameView(gameView);
        }
    }

    /**@description bundle管事器解除安裝bundle前通知 */
    onUnloadBundle(bundle: BUNDLE_TYPE) {
        let entry = this.getEntry(bundle);
        if (entry) {
            entry.onUnloadBundle();
        }
    }

    onDestroyGameView(bundle: BUNDLE_TYPE, gameView: GameView) {
        let entry = this.getEntry(bundle);
        if (entry) {
            entry.onUnloadBundle();
            entry.onDestroyGameView(gameView);
        }
    }

    /**@description 獲取bundle入口 */
    getEntry(bundle: BUNDLE_TYPE) {
        let name = App.bundleManager.getBundleName(bundle);
        let entry = this._entrys.get(name)
        if (entry) {
            return entry;
        }
        return null;
    }

    debug(){
        Log.d(`-------Bundle入口管理器-------`)
        this._entrys.forEach(v=>{
            Log.d(`bundle : ${v.bundle}`);
        })
    }
}