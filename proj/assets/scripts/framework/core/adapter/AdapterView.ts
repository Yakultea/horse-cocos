/**
 */

import { sys, v3, view, _decorator, screen } from "cc";
import { EDITOR, JSB } from "cc/env";
import { Adapter, SafeArea } from "./Adapter";

const { ccclass, property, executeInEditMode, menu } = _decorator;
/**
 * 安全區域適配元件
 *
 * @author caizhitao
 * @created 2020-12-27 21:22:42
 * @description 該適配方案出處 https://forum.cocos.org/t/cocos-creator/74001
 *
 * 用法：
 *
 * 1. 將本元件掛載在節點上即可（註意該節點不能掛在 Widget 元件）
 *
 * 適配原理：
 *
 * 1. 將節點的寬高設定為安全區域的寬高
 */
@ccclass
@executeInEditMode(true)
@menu("Quick適配元件/AdapterView")
export default class AdapterView extends Adapter {
    protected onChangeSize() {
        AdapterView.safeArea = null as any;
        if (this.node) {

            // 將熒幕尺寸下的安全區域大小，轉換為設計解析度下的大小，重新給節點設定大小
            this.width = AdapterView.safeArea.safeAreaWidth / AdapterView.safeArea.designPxToScreenPxRatio;
            this.height = AdapterView.safeArea.safeAreaHeight / AdapterView.safeArea.designPxToScreenPxRatio;

            // 根據安全區域的 margin 設定節點的偏移，使重置寬高後的節點位置在安全中心
            // 需要將熒幕尺寸下的畫素值轉換為設計費解析度下的畫素值
            this.node.setPosition(
                v3(
                    AdapterView.safeArea.safeAreaXOffset / AdapterView.safeArea.designPxToScreenPxRatio,
                    AdapterView.safeArea.safeAreaYOffset / AdapterView.safeArea.designPxToScreenPxRatio
                )
            );
        }
    }

    private static _safeArea: SafeArea = null!;

    static set safeArea(value: SafeArea) {
        this._safeArea = value as any;
    }

    /**
     * 基於熒幕尺寸的安全區域
     *
     * 可以透過 screenPxToDesignPx 轉換為基於設計畫佈尺寸的畫素大小
     */
    static get safeArea() {
        if (this._safeArea == null || this._safeArea == undefined) {
            // 初始熒幕寬高畫素
            let screenWidth = screen.windowSize.width;
            let screenHeight = screen.windowSize.height;
            if (EDITOR) {
                screenWidth = view.getDesignResolutionSize().width;
                screenHeight = view.getDesignResolutionSize().height;
            }

            // 安全區域距離熒幕邊緣的距離畫素
            let safeAreaMarginTop = 0;
            let safeAreaMarginBottom = 0;
            let safeAreaMarginLeft = 0;
            let safeAreaMarginRight = 0;

            // 「設計解析度」畫素值轉換到 「熒幕解析度」 下的畫素比
            let designWidth = view.getVisibleSize().width;
            let designHeight = view.getVisibleSize().height;
            let designPxToScreenPxRatio = Math.min(screenWidth / designWidth, screenHeight / designHeight);

            if (JSB) {
                // 設計解析度下的安全區域大小
                let safeAreaRectInDesignPx = sys.getSafeAreaRect();

                // 求出設計解析度下，熒幕寬高
                let screenWidthToDesgignWidth = screenWidth / designPxToScreenPxRatio;
                let screenHeightToDesignHeight = screenHeight / designPxToScreenPxRatio;

                // 求出設計解析度下的安全區域的位置（相對於 Cocos 坐標係，X軸正方嚮往右，Y軸正方嚮往上）
                let safeAreaRectLeftBottomXInDesign = -designWidth * 0.5 + safeAreaRectInDesignPx.x;
                let safeAreaRectLeftBottomYInDesign = -designHeight * 0.5 + safeAreaRectInDesignPx.y;
                let safeAreaRectWidthInDesign = safeAreaRectInDesignPx.width;
                let safeAreaRectHeightInDesign = safeAreaRectInDesignPx.height;

                // 求出安全區域在設計解析度下的margin值
                let safeAreaMarginTopInDesign = screenHeightToDesignHeight * 0.5 - (safeAreaRectLeftBottomYInDesign + safeAreaRectHeightInDesign);
                let safeAreaMarginBottomInDesign = Math.abs(-screenHeightToDesignHeight * 0.5 - safeAreaRectLeftBottomYInDesign);
                let safeAreaMarginLeftInDesign = Math.abs(-screenWidthToDesgignWidth * 0.5 - safeAreaRectLeftBottomXInDesign);
                let safeAreaMarginRightInDesign = screenWidthToDesgignWidth * 0.5 - (safeAreaRectLeftBottomXInDesign + safeAreaRectWidthInDesign);

                // 求出安全區域在熒幕解析度下的margin值
                safeAreaMarginTop = safeAreaMarginTopInDesign * designPxToScreenPxRatio;
                safeAreaMarginBottom = safeAreaMarginBottomInDesign * designPxToScreenPxRatio;
                safeAreaMarginLeft = safeAreaMarginLeftInDesign * designPxToScreenPxRatio;
                safeAreaMarginRight = safeAreaMarginRightInDesign * designPxToScreenPxRatio;
            }

            // // 微信平臺 安全區域
            // if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            //     try {
            //         if (wx.getSystemInfoSync) {
            //             let res = wx.getSystemInfoSync();
            //             if (res) {
            //                 screenWidth = res.screenWidth * res.pixelRatio;
            //                 screenHeight = res.screenHeight * res.pixelRatio;

            //                 let safeArea = res.safeArea;
            //                 if (safeArea) {
            //                     safeAreaMarginTop = safeArea.top * res.pixelRatio;
            //                     safeAreaMarginBottom = screenHeight - safeArea.bottom * res.pixelRatio;
            //                     safeAreaMarginLeft = safeArea.left * res.pixelRatio;
            //                     safeAreaMarginRight = screenWidth - safeArea.right * res.pixelRatio;
            //                 }
            //             }
            //         }
            //     } catch (error) {
            //         if (CC_DEBUG) {
            //             cc.error("獲取微信安全區域失敗", error);
            //         }
            //     }
            // }

            // 除錯模式下類比安全區域
            // if (DEBUG) {
            //     safeAreaMarginTop = 0;
            //     safeAreaMarginBottom = 50;
            //     safeAreaMarginLeft = 0;
            //     safeAreaMarginRight = 0;
            // }

            // 計算安全區域的寬高畫素
            let safeAreaWidth = screenWidth - safeAreaMarginLeft - safeAreaMarginRight;
            let safeAreaHeight = screenHeight - safeAreaMarginTop - safeAreaMarginBottom;

            // 計算安全區域 X、Y 偏移畫素（相對於 Cocos 坐標係，X軸正方嚮往右，Y軸正方嚮往上）
            let safeAreaXOffset = (safeAreaMarginLeft - safeAreaMarginRight) * 0.5;
            let safeAreaYOffset = (safeAreaMarginBottom - safeAreaMarginTop) * 0.5;

            this._safeArea = {
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                safeAreaWidth: safeAreaWidth,
                safeAreaHeight: safeAreaHeight,
                safeAreaMarginTop: safeAreaMarginTop,
                safeAreaMarginBottom: safeAreaMarginBottom,
                safeAreaMarginLeft: safeAreaMarginLeft,
                safeAreaMarginRight: safeAreaMarginRight,
                safeAreaXOffset: safeAreaXOffset,
                safeAreaYOffset: safeAreaYOffset,
                designPxToScreenPxRatio: designPxToScreenPxRatio,
            };
        }
        return this._safeArea;
    }

    static screenPxToDesignPx(screenPx: number) {
        return screenPx / this.safeArea.designPxToScreenPxRatio;
    }

    static designPxToScreenPx(designPx: number) {
        return designPx * this.safeArea.designPxToScreenPxRatio;
    }
}
