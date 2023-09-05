import { Widget, _decorator } from "cc";
import { Adapter } from "./Adapter";
import AdapterView from "./AdapterView";

const { ccclass, property,executeInEditMode,menu } = _decorator;

/**
 * @author zhitaocai
 * @classdesc  安全區域適配Widget
 * @description
 *
 * 用法：
 *
 * 1. 將本元件掛載在節點上即可（注意：該節點上必須掛在 Widget 元件）
 *
 * 適配原理：
 *
 * 1. 根據安全區域範圍，修改widget元件屬性
 */
@ccclass
@executeInEditMode(true)
@menu("Quick適配元件/AdapterSafeArea")
export default class AdapterSafeArea extends Adapter {
    @property({
        tooltip: "是否包含安全區域和螢幕上邊界之間的縫隙",
    })
    withInsertTop: boolean = false;

    @property({
        tooltip: "是否包含安全區域和螢幕下邊界之間的縫隙",
    })
    withInsertBottom: boolean = false;

    @property({
        tooltip: "是否包含安全區域和螢幕左邊界之間的縫隙",
    })
    withInsertLeft: boolean = false;

    @property({
        tooltip: "是否包含安全區域和螢幕右邊界之間的縫隙",
    })
    withInsertRight: boolean = false;

    protected onChangeSize() {
        let widget = this.getComponent(Widget);
        if (!widget || !widget.enabled) {
            return;
        }
        // 如果對齊上邊界，並且包含安全區域到螢幕上邊界的縫隙
        if (widget.isAlignTop && this.withInsertTop) {
            widget.isAbsoluteTop = true;
            widget.top = -AdapterView.screenPxToDesignPx(AdapterView.safeArea.safeAreaMarginTop);
            this.height += Math.abs(widget.top);
        }
        // 如果對齊下邊界，並且包含安全區域到螢幕下邊界的縫隙
        if (widget.isAlignBottom && this.withInsertBottom) {
            widget.isAbsoluteBottom = true;
            widget.bottom = -AdapterView.screenPxToDesignPx(AdapterView.safeArea.safeAreaMarginBottom);
            this.height += Math.abs(widget.bottom);
        }
        // 如果對齊左邊界，並且包含安全區域到螢幕左邊界的縫隙
        if (widget.isAlignLeft && this.withInsertLeft) {
            widget.isAbsoluteLeft = true;
            widget.left = -AdapterView.screenPxToDesignPx(AdapterView.safeArea.safeAreaMarginLeft);
            this.width += Math.abs(widget.left);
        }
        // 如果對齊右邊界，並且包含安全區域到螢幕右邊界的縫隙
        if (widget.isAlignRight && this.withInsertRight) {
            widget.isAbsoluteRight = true;
            widget.right = -AdapterView.screenPxToDesignPx(AdapterView.safeArea.safeAreaMarginRight);
            this.width += Math.abs(widget.right);
        }
        widget.updateAlignment();
    }
}
