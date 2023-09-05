import { Enum, Sprite, UITransform, v3, Widget, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { Adapter } from "./Adapter";

const { ccclass, property , executeInEditMode,menu} = _decorator;

/**
 * 縮放方式
 */
export enum SpriteScaleType {
    /**
     * 縮放到填滿父節點（如果父節點有裁剪，影像可能會被裁剪，節點可能會超出父節點）
     */
    FILL,

    /**
     * 縮放到剛好在父節點內部最大化顯示（影像會完整顯示，但父節點上下或者左右可能會留空）
     */
    SUIT,
}

/**
 * 對齊方式
 */
export enum SpriteAlignType {
    /**
     * 縮放後靠左對齊
     */
    LEFT,

    /**
     * 縮放後靠上對齊
     */
    TOP,

    /**
     * 縮放後靠右對齊
     */
    RIGHT,

    /**
     * 縮放後靠下對齊
     */
    BOTTOM,

    /**
     * 縮放後居中對齊
     */
    CENTER,
}

/**
 * Sprite 適配元件
 *
 * @author caizhitao
 * @created 2020-12-27 21:22:43
 */
@ccclass
@executeInEditMode(true)
@menu("Quick適配元件/AdapterSprite")
export default class AdapterSprite extends Adapter {
    @property({
        type: Enum(SpriteScaleType),
        tooltip: `縮放型別:
        -FILL: 縮放到填滿父節點（如果父節點有裁剪，影像可能會被裁剪，節點可能會超出父節點）
        -SUIT: 縮放到剛好在父節點內部最大化顯示（影像會完整顯示，但父節點上下或者左右可能會留空）`,
    })
    get scaleType(){
        return this._scaleType;
    }
    set scaleType(value){
        this._scaleType = value;
        if ( EDITOR ){
            this.updateSprite(this._scaleType,this.alignType);
        }
    }
    private _scaleType: SpriteScaleType = SpriteScaleType.SUIT;

    @property({
        type: Enum(SpriteAlignType),
        tooltip: `齊方式型別:
        -LEFT: 縮放後靠左對齊
        -TOP: 縮放後靠上對齊
        -RIGHT: 縮放後靠右對齊
        -BOTTOM: 縮放後靠下對齊
        -CENTER: 縮放後居中對齊`,
    })
    get alignType(){
        return this._alignType;
    }
    set alignType(value){
        this._alignType = value;
        if ( EDITOR ){
            this.updateSprite(this._scaleType,this._alignType);
        }
    }
    private _alignType: SpriteAlignType = SpriteAlignType.CENTER;

    private _sprite: Sprite = null!;

    onLoad() {
        this._sprite = this.node.getComponent(Sprite) as Sprite;
    }

    start() {
        this.updateSprite(this.scaleType, this.alignType);
    }

    protected onChangeSize() {
        this.updateSprite(this.scaleType, this.alignType);
    }

    updateSprite(scaleType: SpriteScaleType, alignType: SpriteAlignType) {
        if (!this._sprite || !this._sprite.enabled || !this._sprite.spriteFrame) {
            return;
        }
        let widget = this.node.parent?.getComponent(Widget);
        if (widget) {
            widget.updateAlignment();
        }
        this.width = this._sprite.spriteFrame.rect.width;
        this.height = this._sprite.spriteFrame.rect.height;
        let trans = this.parentTrans;
        if (this.width / this.height > trans.width / trans.height) {
            // 設計解析度寬高比大於顯示解析度
            if (scaleType == SpriteScaleType.SUIT) {
                let scale = trans.width / this.width;
                this.node.scale = v3(scale,scale);
            } else if (scaleType == SpriteScaleType.FILL) {
                let scale = trans.height / this.height;
                this.node.scale = v3(scale,scale);
            }
        } else {
            // 設計解析度寬高比小於顯示解析度
            if (scaleType == SpriteScaleType.SUIT) {
                let scale = trans.height / this.height;
                this.node.scale = v3(scale,scale);
            } else if (scaleType == SpriteScaleType.FILL) {
                let scale = trans.width / this.width;
                this.node.scale = v3(scale,scale);
            }
        }

        switch (alignType) {
            case SpriteAlignType.CENTER:
                this.node.setPosition(v3());
                break;
            case SpriteAlignType.LEFT:
                this.node.setPosition(v3(-0.5 * (trans.width - this.width * this.node.scale.x), 0));
                break;
            case SpriteAlignType.RIGHT:
                this.node.setPosition(v3(0.5 * (trans.width - this.width * this.node.scale.x), 0));
                break;
            case SpriteAlignType.TOP:
                this.node.setPosition(v3(0, 0.5 * (trans.height - this.height * this.node.scale.x)));
                break;
            case SpriteAlignType.BOTTOM:
                this.node.setPosition(v3(0, -0.5 * (trans.height - this.height * this.node.scale.x)));
                break;
        }
    }

    private get parentTrans(){
        return this.node.parent?.getComponent(UITransform) as UITransform
    }
}
