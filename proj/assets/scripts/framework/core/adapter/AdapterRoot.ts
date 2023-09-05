/**
 */

import { view, _decorator, screen, ResolutionPolicy } from "cc";
import { Adapter } from "./Adapter";
import { AdapterEvent, EOrientationType } from "./AdapterEvent";
import { Macro } from "../../defines/Macros";
import { CmmUtils } from "../../../common/utils/CmmUtils";

const { ccclass, property, executeInEditMode, menu } = _decorator;

/**
 * 遊戲主內容節點自適應所有解析度的指令碼
 * 
 * @author caizhitao
 * @created 2020-12-27 21:22:43
 * @description 該適配方案出處 https://forum.cocos.org/t/cocos-creator/74001
 *
 * 用法：
 *      1. 將本節點直接掛載到Canvas節點做為根節點的適配
 *
 * 適配原理：
 *      1. 將遊戲主內容節點的寬高設定為畫布的大小
 *
 * 注意：
 *      1. 掛載這個指令碼的節點不能加入Widget元件，不然這個適配是沒有效果的
 *      2. 目前只支援 SHOW_ALL 模式下的背景縮放適配，不支援其他模式的背景縮放
 *
 *  @example
    ```
    // e.g.
    // 程式碼中設定 SHOW_ALL 模式的參考程式碼
    cc.view.setDesignResolutionSize(720, 1280, cc.ResolutionPolicy.SHOW_ALL);

    // 或者 Canvas 元件中，同時勾選 Fit Width 和 Fit Height 
    ```
 */
@ccclass
@executeInEditMode(true)
@menu("Quick適配元件/AdapterRoot")
export default class AdapterRoot extends Adapter {

    /**
     * 視窗尺寸發生改變時，更新適配節點的寬高
     */
    protected onChangeSize(...ggg: any) {
        Log.d('------------------------', ggg);

        // 1. 先找到 SHOW_ALL 模式適配之後，本節點的實際寬高以及初始縮放值
        let canvasSize = screen.windowSize;
        let widthRate = canvasSize.width / this.width;
        let heightRate = canvasSize.height / this.height;
        let scaleForShow = Math.min(widthRate, heightRate);
        Log.d('scaleForShow:' + scaleForShow);
        let realWidth = this.width * scaleForShow;
        let realHeight = this.height * scaleForShow;

        // 2. 基於第一步的資料，再做縮放適配
        widthRate = canvasSize.width / realWidth;
        heightRate = canvasSize.height / realHeight;
        let scaleForShowAll = Math.max(widthRate, heightRate);

        // // 1. 計算 SHOW_ALL 模式下，本節點縮放到完全能顯示節點所有內容的實際縮放值
        let designWidth = view.getVisibleSize().width;
        let designHeight = view.getVisibleSize().height;

        Log.d('designWidth:' + designWidth);
        Log.d('designHeight:' + designHeight);

        // Log.d('realWidth:'+realWidth);
        // Log.d('realHeight:'+realHeight);
        Log.d('scaleForShowAll:' + scaleForShowAll);
        // // 2. 根據縮放值，重新設定節點的寬高

        this.width = realWidth * scaleForShowAll;
        this.height = realHeight * scaleForShowAll;
        // Log.d('width:' + this.width);
        // Log.d('height:' + this.height);
        Log.d(`檢視視窗可見區域解析度: ${view.getVisibleSize().width} x ${view.getVisibleSize().height}`);


        // jojo test

        Log.d('canvasSize.width / canvasSize.height : ', canvasSize.width, canvasSize.height);


        // 長寬比
        const canvasSizeRate = canvasSize.width / canvasSize.height;
        Log.d('canvasSizeRate: ', canvasSizeRate);
        Log.d('canvasSize: ', canvasSize);

        Log.d(canvasSizeRate > 1 ? '橫式' : '直式');


        // 遊戲設計分辨率
        const gmaeDesignWidth = 1280; // view.getDesignResolutionSize().width; // 1280
        const gmaeDesignHeight = 720; // view.getDesignResolutionSize().height; // 720
        // Log.d('遊戲設計分辨率: ', gmaeDesignWidth, gmaeDesignHeight);
        Log.d('遊戲設計分辨率: ', view.getDesignResolutionSize().width, view.getDesignResolutionSize().height);


        // 整理後
        let isLandscape = canvasSizeRate > 1;
        if (!Macro.SUPPORT_ORIENTATION.portrait) isLandscape = true;
        if (!Macro.SUPPORT_ORIENTATION.landscape) isLandscape = false;

        const width = isLandscape ? gmaeDesignWidth : gmaeDesignHeight;
        const height = isLandscape ? gmaeDesignHeight : gmaeDesignWidth;
        const resolutionPolicy = isLandscape ? ResolutionPolicy.FIXED_WIDTH : ResolutionPolicy.FIXED_HEIGHT;
        const orientationType = isLandscape ? EOrientationType.LANDSCAPE : EOrientationType.PORTRAIT;



        if (canvasSizeRate < (isLandscape ? gmaeDesignWidth / gmaeDesignHeight : gmaeDesignHeight / gmaeDesignWidth)) {
            view.setDesignResolutionSize(width, height, resolutionPolicy);
        } else {
            view.setDesignResolutionSize(width, height, ResolutionPolicy.FIXED_HEIGHT);
        }

        dispatch(AdapterEvent.ORIENTATION, orientationType);
        



        // 好讀版本
        // if (canvasSizeRate > 1) {
        //     // 橫式
        //     Log.d('橫式');
        //     if (canvasSizeRate < 1280 / 720) {

        //         view.setDesignResolutionSize(1280, 720, ResolutionPolicy.FIXED_WIDTH);
        //     } else {
        //         view.setDesignResolutionSize(1280, 720, ResolutionPolicy.FIXED_HEIGHT);
        //     }
        //     // view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
        //     dispatch(AdapterEvent.ORIENTATION, EOrientationType.LANDSCAPE);
        // } else {
        //     // 直式
        //     Log.d('直式');

        //     if (canvasSizeRate < 720 / 1280) {

        //         view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_WIDTH);
        //     } else {
        //         view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_HEIGHT);

        //     }
        //     // view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
        //     dispatch(AdapterEvent.ORIENTATION, EOrientationType.PORTRAIT);
        // }
    }
}
