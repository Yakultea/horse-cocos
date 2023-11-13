// ---------- 引用 ----------------------------------------------------------------

import { EBundles } from "../../common/data/Bundles";
import { LanguageDelegate, injectLanguageData } from "../../framework/core/language/LanguageDelegate";
import * as languages from "./HorseGameLanguages";

// ---------- 常數 ----------------------------------------------------------------


@injectLanguageData
export class HorseGameLanguage extends LanguageDelegate {

    // ---------- 成員變數 -------------------------------------------------------------
    // ---------- 生命週期 -------------------------------------------------------------
    // ---------- 框架呼叫 -------------------------------------------------------------
    // ---------- 內部呼叫 -------------------------------------------------------------
    // ---------- 外部部呼叫 -----------------------------------------------------------

    init(): void {
        this.importLanguages(languages);
    }

    bundle = EBundles[EBundles.horseGame];
}