/**
 * @description 大厅网络逻辑流程控制器  
*/
// ---------- 引用 ----------------------------------------------------------------

import { EBundles } from "../../common/data/Bundles";
import { Handler } from "../../framework/core/net/service/Handler";
import { WrapperService } from "./WrapperService";

// ---------- 常數 ----------------------------------------------------------------

export default class WrapperHandler extends Handler {
    // ---------- 成員變數 -------------------------------------------------------------

    static module = EBundles[EBundles.horseGame];
    protected get service() { return App.serviceManager.get(WrapperService); }

    // ---------- 生命週期 -------------------------------------------------------------

    onLoad() {
        super.onLoad();
        this.addListeners();
    }

    // ---------- 框架呼叫 -------------------------------------------------------------

    // ---------- 內部呼叫 -------------------------------------------------------------

    private addListeners(): void {

    }

    // ---------- 外部部呼叫 -----------------------------------------------------------

}
