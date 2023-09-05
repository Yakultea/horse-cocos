import { Macro } from "../../defines/Macros";
import { UpdateItem } from "../update/UpdateItem";

/**@description entry入口代理 */
export class EntryDelegate {

    /**@description 進入bundle完成 */
    onEnterGameView(entry: Entry | null, gameView: GameView) {
        //刪除除自己之外的其它bundle
        let excludeBundles = this.getPersistBundle();
        if (entry) {
            excludeBundles.push(entry.bundle);
        }

        //进入下一场景，关闭掉当前的场景
        if (App.gameView) {
            App.gameView.close();
        }
        App.gameView = gameView;

        App.bundleManager.removeLoadedBundle(excludeBundles);
    }

    onShowGameView(entry: Entry | null, gameView: GameView) {

    }

    /**@description 主包檢測更新 */
    onCheckUpdate() {
        Log.d(`主包檢測更新`);
        let config = this.getEntryConfig(Macro.BUNDLE_RESOURCES);
        App.bundleManager.enterBundle(config);
    }

    /**@description 獲取常駐於記憶體不釋放的bundle */
    getPersistBundle() {
        return [Macro.BUNDLE_RESOURCES];
    }

    onEnterMain(mainEntry: Entry | null , userData ?: any) {
        if (mainEntry) {
            if (App.gameView) {
                App.gameView.close();
            }
            mainEntry.onEnter(userData);
        }
    }

    getEntryConfig(bundle: BUNDLE_TYPE): UpdateItem | null {
        return null;
    }
}