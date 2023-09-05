/**
 * UIColor 還在測試階段 請勿使用
 */

// ---------- 引用 ----------------------------------------------------------------
import { CCString, Enum, Label, _decorator, Color, Component, Node, Sprite, Button } from "cc";
import ColorModel, { EUiColorKeys } from "../../../wrapper/script/model/ColorModel";

// ---------- 常數 ----------------------------------------------------------------
const { ccclass, property, menu, executeInEditMode } = _decorator;
const Bundles = Enum(App.Bundles);
const ColorKeys = Enum(EUiColorKeys);
Enum.getList(ColorKeys);
Enum.sortList(ColorKeys, (a, b) => { return a.name > b.name ? 1 : -1; });

@ccclass
@menu("Quick渲染元件/UIColor")
@executeInEditMode()
export default class UIColor extends Component {

    // ---------- 成員變數 -------------------------------------------------------------
    protected targetComponent: Label | Sprite = null;
    protected button: Button = null;

    // ===== 色票相關 =====
    /** 是否啟用系統色票 */
    @property
    protected _sysColor: boolean = false;
    /** 顏色key */
    @property
    protected _colorKey: string = '';

    @property({ displayName: "啟用系統色票", tooltip: "用於 Label | Sprite 是否啟用系統色票,預設為啟用" })
    get isUseSystemColor() {
        return this._sysColor;
    }
    set isUseSystemColor(v) {
        if (v == this._sysColor) {
            return;
        }
        this._sysColor = v;
    }

    /** 顏色key */
    // @ts-ignore
    @property({ displayName: "顏色key", visible() { return this._sysColor; }, type: ColorKeys, tooltip: "顏色key" })
    get colorKey() {
        return this._colorKey as string;
    }
    set colorKey(v: string) {
        if (this._colorKey == v) {
            return;
        }
        this._colorKey = v;

        try {
            // 字串分割 
            const [key, subkey] = (EUiColorKeys as any)[v].split('_');
            this.targetComponent.color = (ColorModel.getData() as any)[key][subkey];
        } catch (error) {
            Log.e('分隔符號需與 ColorModel>EUiColorKeys 動態生成enum的分隔字串同步。', error);
        }

    }

    // ===== Button =====

    /** 是否啟用系統色票 */
    @property
    protected _buttonSysColor: boolean = false;
    /** 顏色key */
    @property
    protected _normal: string = '';
    /** 顏色key */
    @property
    protected _pressed: string = '';
    /** 顏色key */
    @property
    protected _hover: string = '';
    /** 顏色key */
    @property
    protected _disabled: string = '';

    @property({ displayName: "Button色票", tooltip: "是否啟用Button色票,預設為關閉" })
    get isUseButtonSysColor() {
        return this._buttonSysColor;
    }
    set isUseButtonSysColor(v) {
        if (v == this._buttonSysColor) {
            return;
        }
        v && this.initButton();
        this._buttonSysColor = v;
    }

    /** normal 顏色 */
    // @ts-ignore
    @property({ displayName: "normal 顏色", visible() { return this._buttonSysColor; }, type: ColorKeys, tooltip: "normal 顏色" })
    get normal() {
        return this._normal as string;
    }
    set normal(v: string) {
        if (this._normal == v) {
            return;
        }
        this._normal = v;
        try {
            // 字串分割 
            const [key, subkey] = (EUiColorKeys as any)[v].split('_');
            this.button.normalColor = (ColorModel.getData() as any)[key][subkey];
        } catch (error) {
            Log.e('分隔符號需與 ColorModel>EUiColorKeys 動態生成enum的分隔字串同步。', error);
        }
    }
    /** normal 顏色 */
    // @ts-ignore
    @property({ displayName: "pressed 顏色", visible() { return this._buttonSysColor; }, type: ColorKeys, tooltip: "pressed 顏色" })
    get pressed() {
        return this._pressed as string;
    }
    set pressed(v: string) {
        if (this._pressed == v) {
            return;
        }
        this._pressed = v;
        try {
            // 字串分割 
            const [key, subkey] = (EUiColorKeys as any)[v].split('_');
            this.button.pressedColor = (ColorModel.getData() as any)[key][subkey];
        } catch (error) {
            Log.e('分隔符號需與 ColorModel>EUiColorKeys 動態生成enum的分隔字串同步。', error);
        }
    }
    /** normal 顏色 */
    // @ts-ignore
    @property({ displayName: "hover 顏色", visible() { return this._buttonSysColor; }, type: ColorKeys, tooltip: "hover 顏色" })
    get hover() {
        return this._hover as string;
    }
    set hover(v: string) {
        if (this._hover == v) {
            return;
        }
        this._hover = v;
        try {
            // 字串分割 
            const [key, subkey] = (EUiColorKeys as any)[v].split('_');
            this.button.hoverColor = (ColorModel.getData() as any)[key][subkey];
        } catch (error) {
            Log.e('分隔符號需與 ColorModel>EUiColorKeys 動態生成enum的分隔字串同步。', error);
        }
    }
    /** normal 顏色 */
    // @ts-ignore
    @property({ displayName: "disabled 顏色", visible() { return this._buttonSysColor; }, type: ColorKeys, tooltip: "disabled 顏色" })
    get disabled() {
        return this._disabled as string;
    }
    set disabled(v: string) {
        if (this._disabled == v) {
            return;
        }
        this._disabled = v;
        try {
            // 字串分割 
            const [key, subkey] = (EUiColorKeys as any)[v].split('_');
            this.button.disabledColor = (ColorModel.getData() as any)[key][subkey];
        } catch (error) {
            Log.e('分隔符號需與 ColorModel>EUiColorKeys 動態生成enum的分隔字串同步。', error);
        }
    }   


    // ---------- 生命週期 -------------------------------------------------------------
    onLoad(): void {
        this.targetComponent = this.node.getComponent(Sprite) || this.node.getComponent(Label);
        if (this.targetComponent === null) {
            Log.e('UIColor: 此component 不存在 Sprite組件 | Label組件');
            return;
        }
    }

    // ---------- 框架呼叫 -------------------------------------------------------------
    // ---------- 內部呼叫 -------------------------------------------------------------
    private initButton(){
        console.log('初始化 button');
        
        this.button = this.node.getComponent(Button);
        if (this.button === null) {
            Log.e('UIColor: 此component 不存在 Button組件');
            return;
        }
    }
    // ---------- 外部部呼叫 -----------------------------------------------------------

}
