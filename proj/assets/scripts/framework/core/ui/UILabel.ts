// ---------- 引用 ----------------------------------------------------------------
import { CCString, Enum, Label, _decorator } from "cc";
import { EColorKeys } from "../../../game/model/ColorModel";

/**
 * @description 支援多語言
 */
const { ccclass, property, menu } = _decorator;

// ---------- 常數 ----------------------------------------------------------------
const Bundles = Enum(App.Bundles);
const ColorKeys = Enum(EColorKeys);

@ccclass
@menu("Quick渲染元件/UILabel")
export default class UILabel extends Label {

    // ---------- 成員變數 -------------------------------------------------------------
    /**@description 多讒言包 */
    @property
    protected _lan: string = "";

    /**@description 語言包所在bundle */
    @property
    protected _bundle = Bundles.resources;

    @property
    protected _params: (string | number)[] = [];

    /**@description 是否是髒資料 */
    protected _isDirty: boolean = true;

    /**@description 是否啟用多語言 */
    @property
    protected _mult = true;

    /**
     * @description 語言包所在bundle
     */
    @property({ displayName: "語言包所在Bundle", type: Bundles, tooltip: "語言包所在bundle" })
    get bundle() {
        return this._bundle;
    }
    set bundle(v) {
        if (this._bundle == v) {
            return;
        }
        this._bundle = v;
        this._isDirty = true;
    }

    /**
     * @description 設定語言包Key
     * 如果語言包在Bundle內，請先用injectLanguageData裝飾語言包資料代理類
     * 注意，語言包只有在編輯器模式下會加入語言包資料代理，執行實需要自己新增
     * 假設resources語言包為
     * @example 示例
     * export let i18n = {
     * language : cc.sys.LANGUAGE_CHINESE,
     *      tips : "您好",
     *      test : "測試 : {0}-->{1}-->{2}"
     * }
     * node.getComponent(cc.Label).language = "tips"; //string顯示為：您好
     * */
    @property({ displayName: "語言包Key", tooltip: "所在Bundle中語言包的key,如果語言包在Bundle內，請先用injectLanguageData裝飾語言包資料代理類" })
    get language() {
        return this._lan;
    }
    set language(v) {
        if (this.language == v) {
            return;
        }
        this._lan = v;
        this._isDirty = true;
    }

    /**
     * @description 附加引數 假設resources語言包為
     * @example 示例
     * export let i18n = {
     * language : cc.sys.LANGUAGE_CHINESE,
     *      tips : "您好",
     *      test : "測試 : {0}-->{1}-->{2}"
     * }
     * node.getComponent(cc.Label).language = "tips"; //string顯示為：您好
     * node.getComponent(cc.Label).language = "test"; //string顯示為：您好
     * node.getComponent(cc.Label).params = [100,200,300]; //string顯示為：測試 : 100-->200-->300
     */
    @property({ displayName: "語言包附加引數", tooltip: "附加引數，如果語言包中有 xx{0}{1},有兩個佔位的引數需要替換", type: CCString })
    get params() {
        return this._params;
    }
    set params(v) {
        this._params = v;
        this._isDirty = true;
    }

    @property({ displayName: "是否啟用多語言", tooltip: "是否啟用多語言,預設為啟用" })
    get isUseMultilingual() {
        return this._mult;
    }
    set isUseMultilingual(v) {
        if (v == this._mult) {
            return;
        }
        this._mult = v;
        this._isDirty = true;
    }

    // ===== 色票相關 =====
    /** 是否啟用系統色票 */
    @property
    protected _sysColor: boolean = false;
    /** 顏色key */
    @property
    protected _colorKey: EColorKeys = EColorKeys.red;
    /** 顏色value */
    @property
    protected _colorValue: string = 'text';

    @property({ displayName: "啟用系統色票", tooltip: "是否啟用系統色票,預設為啟用" })
    get isUseSystemColor() {
        return this._sysColor;
    }
    set isUseSystemColor(v) {
        if (v == this._sysColor) {
            return;
        }
        this._sysColor = v;
        this._isDirty = true;
    }

    /** 顏色key */
    // @ts-ignore
    @property({ displayName: "顏色key", visible() { return this._sysColor; }, type: ColorKeys, tooltip: "顏色key" })
    get colorKey() {
        return this._colorKey;
    }
    set colorKey(v) {
        if (this._colorKey == v) {
            return;
        }
        this._colorKey = v;
        this._isDirty = true;
    }

    /** 顏色value */
    // @ts-ignore
    @property({ displayName: '顏色value', visible() { return this._sysColor && this._colorKey !== null; }, tooltip: '顏色value,若選擇的顏色不存在,則顯示紅色' })
    // @property({ displayName: '顏色value', tooltip: '顏色value,若選擇的顏色不存在,則顯示紅色' })
    get colorValue() {
        return this._colorValue;
    }
    set colorValue(v) {
        if (this._colorValue == v) {
            return;
        }
        this._colorValue = v;
        this._isDirty = true;

        // @ts-ignore
        this.color = ColorModel.getData()[EColorKeys[this._colorKey]][v];
    }

    // ---------- 生命週期 -------------------------------------------------------------
    onLoad(): void {
        super.onLoad();
        App.language.add(this);
        this.update(0);
    }

    onDestroy(): void {
        App.language.remove(this);
        super.onDestroy();
    }

    protected update(dt: number): void {
        if (super.update) {
            super.update(dt);
        }
        if (this._isDirty) {
            this.forceDoLayout();
            this._isDirty = false;
        }
    }

    // ---------- 框架呼叫 -------------------------------------------------------------
    // ---------- 內部呼叫 -------------------------------------------------------------
    // ---------- 外部部呼叫 -----------------------------------------------------------

    forceDoLayout(): void {
        if (this.isUseMultilingual) {
            let bundle = this.bundle;
            let realBundle = Bundles[bundle];
            let str = App.getLanguage(this.language as any, this.params, realBundle);
            this.string = str;
        }
        super.forceDoLayout();
    }
}
