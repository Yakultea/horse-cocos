// ---------- 引用 ----------------------------------------------------------------
import { LanguageDelegate, injectLanguageData } from "../../../../scripts/framework/core/language/LanguageDelegate";
import { EBundles } from "../../../common/data/Bundles";
import * as languages from "./WrapperLanguages";

// ---------- 常數 ----------------------------------------------------------------


@injectLanguageData
export class WrapperLanguage extends LanguageDelegate {

    // ---------- 成員變數 -------------------------------------------------------------
    // ---------- 生命週期 -------------------------------------------------------------
    // ---------- 框架呼叫 -------------------------------------------------------------
    // ---------- 內部呼叫 -------------------------------------------------------------
    // ---------- 外部部呼叫 -----------------------------------------------------------

    init(): void {
        this.importLanguages(languages);
    }
    bundle = EBundles[EBundles.wrapper];
}