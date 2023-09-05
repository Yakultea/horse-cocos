/**
 * 框架常量宏觀定義
 */

import { EBundles } from "../../common/data/Bundles";
import { Endian } from "../plugin/ByteArray";

export namespace Macro {
    /** 網路資料全以大端方式進行處理 */
    export const USING_LITTLE_ENDIAN = Endian.BIG_ENDIAN;
    /** 主包bundle名 */
    export const BUNDLE_RESOURCES = EBundles[EBundles.resources];
    /** 遠端資源包bundle名 */
    export const BUNDLE_REMOTE = "__Remote__Caches__";
    /** 是否允許遊戲啟動後切換語言 */
    export const ENABLE_CHANGE_LANGUAGE = true;
    /** 語言包路徑使用字首 */
    export const USING_LAN_KEY = "i18n.";
    /** 螢幕適配 */
    export const ADAPT_SCREEN = "Event_ADAPT_SCREEN";
    /** 未知 */
    export const UNKNOWN = "UNKNOWN";
    /** 應該層主動關閉Socket */
    export const ON_CUSTOM_CLOSE = "ON_CUSTOM_CLOSE";
    /** 主包熱更新模擬bundle名 */
    export const MAIN_PACK_BUNDLE_NAME = "main";
    /** 
     * 大廳bunlde名 
     * @deprecated 棄用
     * */
    export const BUNDLE_HALL = "hall";

    /** 鎖定橫式 */
    // export const IS_LANDSCAPE = true;

    export const SUPPORT_ORIENTATION = {
        landscape: true,
        portrait: false,
    };
}