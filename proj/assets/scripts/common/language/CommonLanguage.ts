/**@description 語言包具體的程式碼實現 */

import { LanguageZH } from "./LanguageZH";
import { LanguageEN } from "./LanguageEN";
import { LanguageCN } from "./LanguageCN";
import { LanguageVN } from "./LanguageVN";
import { Macro } from "../../framework/defines/Macros";
import { LanguageDelegate } from "../../framework/core/language/LanguageDelegate";
import { Bundles } from "../data/Bundles";

export class CommonLanguage extends LanguageDelegate {
    init(): void {
        this.mergeBundles()
        this.add(LanguageEN);
        this.add(LanguageZH);
        this.add(LanguageCN);
        this.add(LanguageVN);

    }
    bundle = Macro.BUNDLE_RESOURCES;

    /** 合併 bundles 至語系 */
    private mergeBundles() {
        LanguageEN.data.bundles = { ...Bundles.bundles };
        LanguageZH.data.bundles = { ...Bundles.bundles };
        LanguageCN.data.bundles = { ...Bundles.bundles };
        LanguageVN.data.bundles = { ...Bundles.bundles };
    }
}