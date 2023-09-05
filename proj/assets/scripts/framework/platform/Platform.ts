import { isValid, native, Size, SpriteFrame, sys, Node } from "cc";
import { Snapshot } from "../componects/Snapshot";

/**
 * @description 平臺相關程式碼處理
 */
export class Platform implements ISingleton {
    static module: string = "【平臺管理器】";
    module: string = null!;

    /**
     * @en Try to open a url in browser, may not work in some platforms
     * @zh 嘗試開啟一個 web 頁面，並非在所有平臺都有效
     */
    openURL(url: string) {
        sys.openURL(url);
    }

    /**
     * @en Copy text to clipboard 
     * @zh 複製字串到剪下板
     * @param text
     */
    copyText(text: string) {
        native.copyTextToClipboard(text);
    }

    /**
     * @en Get the network type of current device, return `sys.NetworkType.LAN` if failure.
     * @zh 獲取當前裝置的網路型別, 如果網路型別無法獲取，預設將返回 `sys.NetworkType.LAN`
     */
    getNetworkType() {
        return sys.getNetworkType();
    }

    /**
     * @en Get the battery level of current device, return 1.0 if failure.
     * @zh 獲取當前裝置的電池電量，如果電量無法獲取，預設將返回 1
     * @return - 0.0 ~ 1.0
     */
    getBatteryLevel() {
        return sys.getBatteryLevel();
    }

    /**
     * @description 截圖
     * @param node 需要截圖的節點
     * @param onCaptureComplete 截圖完成回撥
     */
    snapshot(node: Node, onCaptureComplete?: (sp: SpriteFrame, size: Size) => void) {
        if (isValid(node)) {
            let snapshot = node.addComponent(Snapshot);
            snapshot.onCaptureComplete = onCaptureComplete;
        }
    }

    /**
     * @description 截圖檔案儲存路徑
     */
    private _screenshotsPath: string = null!;
    get screenshotsPath() {
        if (this._screenshotsPath) {
            return this._screenshotsPath;
        }
        if (sys.isNative) {
            this._screenshotsPath = native.fileUtils.getWritablePath() + "Screenshots";
            if (!native.fileUtils.isDirectoryExist(this._screenshotsPath)) {
                native.fileUtils.createDirectory(this._screenshotsPath);
            }
        }
        return this._screenshotsPath;
    }
}