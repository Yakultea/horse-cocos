/**
 * @description 支援多語言精靈
 * 編輯器模式下只支援resources目錄下資源，其它Bundle資源無法支援,後續考慮支援
 * 需要多語言的圖示，建議專案弄一個全透明圖示，都託入這個圖片
 * 程式碼執行時框架替換
*/
// ---------- 引用 ----------------------------------------------------------------
import { assetManager, CCString, Enum, Sprite, SpriteFrame, _decorator } from "cc";
import { Macro } from "../../defines/Macros";
import { addExtraLoadResource, setSpriteSpriteFrame } from "../../plugin/CocosUtils";
import { Resource } from "../asset/Resource";
import ColorModel, { EColorKeys } from "../../../wrapper/script/model/ColorModel";

// ---------- 常數 ----------------------------------------------------------------
const { ccclass, property, menu } = _decorator;

const Bundles = Enum(App.Bundles);
const ColorKeys = Enum(EColorKeys);

@ccclass
@menu("Quick渲染元件/UISprite")
export default class UISprite extends Sprite {
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
    protected _mult = false;

    onLoadComplete?: (data: SpriteFrame | null) => void;

    /**@description 資源的持有人 */
    @property
    protected _user = Macro.UNKNOWN;

    /**@description 圖集資源 */
    @property
    protected _lanAtlas: string = "";

    /**@description 是否是遠端資源 */
    @property
    protected _remote = false;

    /**  @description 是否啟用多語言,預設為啟用 */ // @ts-ignore
    @property({ displayName: "是否啟用多語言", tooltip: "是否啟用多語言,預設為關閉" })
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

    /** @description 語言包所在bundle */ // @ts-ignore

    @property({ displayName: "語言包所在Bundle", visible() { return this._mult; }, type: Bundles, "tooltip": "語言包所在bundle" })
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
     * */ // @ts-ignore
    @property({ displayName: "語言包Key", visible() { return this._mult; }, tooltip: "所在Bundle中語言包的key,如果語言包在Bundle內，請先用injectLanguageData裝飾語言包資料代理類" })
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

    /**  @description 圖集資源 */ // @ts-ignore
    @property({ displayName: "圖集資源", visible() { return this._mult; }, tooltip: "圖集資源" })
    get languageAtlas() {
        return this._lanAtlas;
    }
    set languageAtlas(v) {
        if (this._lanAtlas == v) {
            return;
        }
        this._lanAtlas = v;
        this._isDirty = true;
    }

    /** @description 圖集資源 */ // @ts-ignore
    @property({ displayName: "遠端地址", visible() { return this._mult; }, tooltip: "遠端地址" })
    get isRemote() {
        return this._remote;
    }
    set isRemote(v) {
        if (this._remote == v) {
            return;
        }
        this._remote = v;
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
     */ // @ts-ignore
    @property({ displayName: "語言包附加引數", visible() { return this._mult; }, tooltip: "附加引數，如果語言包中有 xx{0}{1},有兩個佔位的引數需要替換", type: CCString })
    get params() {
        return this._params;
    }
    set params(v) {
        this._params = v;
        this._isDirty = true;
    }

    /** @description 資源持有人 */ // @ts-ignore
    @property({ displayName: "資源持有人", visible() { return this._mult; }, tooltip: "填寫對應的 ClassName，例如:'TemplateView'。" })
    get user() {
        return this._user;
    }
    set user(v) {
        this._user = v;
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
    async forceDoLayout(): Promise<void> {
        if (this.isUseMultilingual) {
            let bundle = this.bundle;
            let realBundle = Bundles[bundle];
            let loaded = App.bundleManager.getBundle(realBundle);
            if (!loaded) {
                // Log.d(`${realBundle}未載入`);
                return;
            }

            let url = App.getLanguage(this.language as any, this.params, realBundle);
            if (!url) {
                return;
            }
            let view = await App.uiManager.getView(this.user);
            if (this.isRemote) {
                // Log.d("加载远程图片")
                App.asset.remote.loadImage(url, true).then((data) => {
                    if (data) {
                        setSpriteSpriteFrame(view, url, this, data, (data) => {
                            if (this.onLoadComplete) {
                                this.onLoadComplete(data);
                            }
                        }, Macro.BUNDLE_REMOTE, Resource.Type.Remote, false);
                    }
                });
            } else {
                if (this.languageAtlas.length > 0) {
                    // Log.d("设置图集",this.languageAtlas);
                    //在纹理图集中查找
                    let urls = App.getLanguage(this.languageAtlas as any, [], realBundle);
                    App.cache.getSpriteFrameByAsync(urls, url, view, addExtraLoadResource, realBundle).then((data) => {
                        if (data && data.isTryReload) {
                            //來到這裡面程式已經崩潰了，無意義在處理了
                        } else if (data && data.spriteFrame) {
                            setSpriteSpriteFrame(view, data.url, this, data.spriteFrame, (data) => {
                                if (this.onLoadComplete) {
                                    this.onLoadComplete(data);
                                }
                            }, realBundle, Resource.Type.Local, false, true);
                        }
                    });
                } else {
                    url = url + "/spriteFrame";
                    // Log.d(`资源路径：${realBundle}/${url}`);
                    App.cache.getCacheByAsync(url, SpriteFrame, realBundle)
                        .then(spriteFrame => {
                            setSpriteSpriteFrame(view, url, this, spriteFrame, (data) => {
                                if (this.onLoadComplete) {
                                    this.onLoadComplete(data);
                                }
                            }, realBundle);
                        });
                }
            }
        }
    }
    // ---------- 內部呼叫 -------------------------------------------------------------
    // ---------- 外部部呼叫 -----------------------------------------------------------


}
