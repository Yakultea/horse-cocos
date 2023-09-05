import { size, Size, v2, Vec2, Node, UITransform } from "cc";

/**
 * @description 佈局型別
 */
export enum LayoutType {
    /**@description 頂對齊 */
    TOP = 1 << 0,
    /**@description 垂直居中 */
    MID = 1 << 1,
    /**@description 底對齊 */
    BOT = 1 << 2,
    /**@description 左對齊 */
    LEFT = 1 << 3,
    /**@description 水平居中 */
    CENTER = 1 << 4,
    /**@description 右對齊 */
    RIGHT = 1 << 5,
    /**@description 包含水平方向對齊方式( 左對齊 | 水平居中 | 右對齊 ) */
    HORIZONTAL = LEFT | CENTER | RIGHT,
    /**@description 包含垂直方向對齊方式( 頂對齊 | 垂直居中 | 底對齊 ) */
    VERTICAL = TOP | MID | BOT,
    /**@description 包含垂直方向對齊方式( 頂對齊 | 底對齊 ) */
    TOP_BOT = TOP | BOT,
    /**@description 包含水平方向對齊方式( 左對齊 | 右對齊 ) */
    LEFT_RIGHT,
    /**@description 水平居中，頂對齊 */
    CENTER_TOP = CENTER | TOP,
    /**@description 水平居中，底對齊 */
    CENTER_BOT = CENTER | BOT,
    /**@description 垂直居中，左對齊 */
    MID_LETF = MID | LEFT,
    /**@description 垂直居中，右對齊 */
    MID_RIGHT = MID | RIGHT,
}

/**@description 對齊節點 */
export interface LayoutNode {
    x: number;
    y: number;
    parent: LayoutNode;

}

interface LayoutResult {
    position: Vec2;
    originSize: Size;
}

export class LayoutParam {
    private _alignFlags = 0;
    get alignFlags() {
        return this._alignFlags;
    }
    set alignFlags(v) {
        this._alignFlags = v;
    }

    /**@description 結果 */
    result: LayoutResult = {
        /**@description 佈局後坐標 */
        position: v2(0, 0),
        /**@description 原來節點的大小 */
        originSize: size(0, 0)
    }

    private _setAlign(type: LayoutType, isAlign: boolean) {
        let current = (this._alignFlags & type) > 0;
        if (isAlign === current) {
            return;
        }
        let isHorizontal = (type & LayoutType.LEFT_RIGHT) > 0;
        const trans = this.node.getComponent(UITransform)!;
        if (isAlign) {
            this._alignFlags |= type;
            if (isHorizontal) {
                this.isAlignHorizontalCenter = false;
                if (this.isStretchWidth) {
                    // become stretch
                    this.result.originSize.width = trans.width;
                }
            }
            else {
                this.isAlignVerticalCenter = false;
                if (this.isStretchHeight) {
                    // become stretch
                    this.result.originSize.height = trans.height;
                }
            }
        }
        else {
            if (isHorizontal) {
                if (this.isStretchWidth) {
                    // will cancel stretch
                    trans.width = this.result.originSize.width;
                }
            }
            else {
                if (this.isStretchHeight) {
                    // will cancel stretch
                    trans.height = this.result.originSize.height;
                }
            }

            this._alignFlags &= ~type;
        }
    }
    /**@description 指定一個對齊目標，只能是當前節點的其中一個父節點，預設為空，為空時表示當前父節點。 */
    target: Node = null!;
    private _node: Node = null!;
    /**@description 需要佈局的物件節點,不參為空且必須有一個父節點*/
    get node() {
        return this._node;
    }
    set node(node) {
        const trans = node.getComponent(UITransform)!;
        this.result.originSize.width = trans.width;
        this.result.originSize.height = trans.height;
        this._node = node;
    }
    /**@description 是否對齊上邊。 */
    get isAlignTop() {
        return (this._alignFlags & LayoutType.TOP) > 0;
    }
    set isAlignTop(value) {
        this._setAlign(LayoutType.TOP, value);
    }
    /**@description 是否垂直方向對齊中點，開啟此項會將垂直方向其他對齊選項取消。 */
    get isAlignVerticalCenter() {
        return (this._alignFlags & LayoutType.MID) > 0;
    }
    set isAlignVerticalCenter(value) {
        if (value) {
            this.isAlignTop = false;
            this.isAlignBottom = false;
            this._alignFlags |= LayoutType.MID;
        }
        else {
            this._alignFlags &= ~LayoutType.MID;
        }
    }
    /**@description 是否對齊下邊。 */
    get isAlignBottom() {
        return (this._alignFlags & LayoutType.BOT) > 0;
    }
    set isAlignBottom(value) {
        this._setAlign(LayoutType.BOT, value);
    }
    /**@description 是否對齊左邊 */
    get isAlignLeft() {
        return (this._alignFlags & LayoutType.LEFT) > 0;
    }
    set isAlignLeft(value) {
        this._setAlign(LayoutType.LEFT, value);
    }
    /**@description 是否水平方向對齊中點，開啟此選項會將水平方向其他對齊選項取消。 */
    public get isAlignHorizontalCenter() {
        return (this._alignFlags & LayoutType.CENTER) > 0;
    }
    public set isAlignHorizontalCenter(value) {
        if (value) {
            this.isAlignLeft = false;
            this.isAlignRight = false;
            this._alignFlags |= LayoutType.CENTER;
        }
        else {
            this._alignFlags &= ~LayoutType.CENTER;
        }
    }
    /**@description 是否對齊右邊。 */
    public get isAlignRight(): boolean {
        return (this._alignFlags & LayoutType.RIGHT) > 0;
    }
    public set isAlignRight(value: boolean) {
        this._setAlign(LayoutType.RIGHT, value);
    }
    /**@description 當前是否水平拉伸。當同時啟用左右對齊時，節點將會被水平拉伸，此時節點的寬度只讀。 */
    get isStretchWidth() {
        return (this._alignFlags & LayoutType.LEFT_RIGHT) === LayoutType.LEFT_RIGHT;
    }
    /**@description 當前是否垂直拉伸。當同時啟用上下對齊時，節點將會被垂直拉伸，此時節點的高度只讀。 */
    get isStretchHeight() {
        return (this._alignFlags & LayoutType.TOP_BOT) === LayoutType.TOP_BOT;
    }
    /**@description 本節點頂邊和父節點頂邊的距離，可填寫負值，只有在 isAlignTop 開啟時才有作用。 */
    top: number = 0;
    /**@description 本節點底邊和父節點底邊的距離，可填寫負值，只有在 isAlignBottom 開啟時才有作用。 */
    bottom: number = 0;
    /**@description 本節點左邊和父節點左邊的距離，可填寫負值，只有在 isAlignLeft 開啟時才有作用。 */
    left: number = 0;
    /**@description 本節點右邊和父節點右邊的距離，可填寫負值，只有在 isAlignRight 開啟時才有作用。 */
    right: number = 0;
    /**@description 水平居中的偏移值，可填寫負值，只有在 isAlignHorizontalCenter 開啟時才有作用。 */
    horizontalCenter: number = 0;
    /**@description 垂直居中的偏移值，可填寫負值，只有在 isAlignVerticalCenter 開啟時才有作用。 */
    verticalCenter: number = 0;
    /**@description 如果為 true，"horizontalCenter" 將會以畫素作為偏移值，反之為百分比（0 到 1）。 */
    isAbsoluteHorizontalCenter: boolean = true;
    /**@description 如果為 true，"verticalCenter" 將會以畫素作為偏移值，反之為百分比（0 到 1）。 */
    isAbsoluteVerticalCenter: boolean = true;
    /**@description 如果為 true，"top" 將會以畫素作為邊距，否則將會以相對父物體高度的百分比（0 到 1）作為邊距。 */
    isAbsoluteTop: boolean = true;
    /**@description 如果為 true，"bottom" 將會以畫素作為邊距，否則將會以相對父物體高度的百分比（0 到 1）作為邊距。 */
    isAbsoluteBottom: boolean = true;
    /**@description 如果為 true，"left" 將會以畫素作為邊距，否則將會以相對父物體寬度的百分比（0 到 1）作為邊距。 */
    isAbsoluteLeft: boolean = true;
    /**@description 如果為 true，"right" 將會以畫素作為邊距，否則將會以相對父物體寬度的百分比（0 到 1）作為邊距。 */
    isAbsoluteRight: boolean = true;
}	