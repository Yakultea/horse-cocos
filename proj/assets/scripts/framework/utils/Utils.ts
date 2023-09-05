/**
 * @description 公共工具
 */

import { Tween, Node, tween, Label, Vec3, UITransform, safeMeasureText, Component, EventHandler, v3 } from "cc";

const VIEW_ACTION_TAG = 999;

export interface IlabelMarquee {
    maskNode: Node,
    labelNode: Node,
    originPosX?: number, //isCenter = true的話 可以不帶originPosX
    delayTime: number,
    isCenter: boolean, //label是否為中間對齊
};

export class Utils implements ISingleton {
    static module: string = "【Utils】";
    module: string = null!;
    /**@description 顯示檢視動畫 */
    showView(node: Node | null, complete: Function) {
        if (node) {
            Tween.stopAllByTag(VIEW_ACTION_TAG);
            tween(node).tag(VIEW_ACTION_TAG)
                .set({ scale: new Vec3(0.2, 0.2, 0.2) })
                .to(0.2, { scale: new Vec3(1.15, 1.15, 1.15) })
                .delay(0.05)
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .call(() => {
                    if (complete) complete();
                })
                .start();
        }
    }

    /**@description 隱藏/關閉檢視統一動畫 */
    hideView(node: Node | null, complete: Function) {
        if (node) {
            Tween.stopAllByTag(VIEW_ACTION_TAG);
            tween(node).tag(VIEW_ACTION_TAG)
                .to(0.2, { scale: new Vec3(1.15, 1.15, 1.15) })
                .to(0.1, { scale: new Vec3(0.3, 0.3, 0.3) })
                .call(() => {
                    if (complete) complete();
                })
                .start();
        }
    }

    /**
     * @description 判斷是否是一個有效郵箱
     */
    isMail(mailAddress: string) {
        let regex = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
        return regex.test(mailAddress);
    }

    /**
     * @description 判斷是否是一個有效的電話號碼
     * 注意 : 限中國地區手機號
     * 目前匹配號段
     * 中國電訊號段
     * 133、149、153、173、177、180、181、189、199
     * 中國聯通號段
     * 130、131、132、145、155、156、166、175、176、185、186
     * 
     * 中國移動號段
     * 134(0-8)、135、136、137、138、139、147、150、151、152、157、158、159、178、182、183、184、187、188、198
     * 
     * 其他號段
     * 14號段以前為上網絡卡專屬號段，如聯通的是145，移動的是147等等。
     * 
     * 虛擬運營商
     * 
     * 電信：1700、1701、1702
     * 
     * 移動：1703、1705、1706
     * 
     * 聯通：1704、1707、1708、1709、171
     * 版權宣告：本文為CSDN博主「一木未朽」的原創文章，遵循CC 4.0 BY-SA版權協議，轉載請附上原文出處連結及本宣告。
     * 原文連結：https://blog.csdn.net/gh2537477282/article/details/125297724
     */
    isTEL(tel: string) {
        let regex = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/g;
        return regex.test(tel);
    }

    /**
     * @description 指定寬度顯示字串內容，如果超過指定寬度則顯示為 xxx..的形式
     * @param label 需要限制顯示的Label元件
     * @param content 顯示內容
     * @param width 限制顯示寬度 預設為100px
     * @param suffix 超出顯示寬度時,字尾，預設為..
     * @returns 
     */
    limitString(label: Label | null | undefined, content: string, width: number = 100, suffix = "..") {
        if (label) {
            //計算內容大小
            label.string = content;
            label.forceDoLayout();
            let trans = label.getComponent(UITransform) as UITransform;
            let contentWidth = trans.width;
            if (contentWidth <= width) {
                return;
            }
            //每一個字的寬度
            let singleWidth = contentWidth / content.length;
            let overWidth = contentWidth - width;
            let overCount = overWidth / singleWidth;
            overCount = Math.floor(overCount);
            let subString = content.substring(0, content.length - overCount) + suffix;
            if (label.assemblerData && label.assemblerData.context) {
                let safeWidth = safeMeasureText(label.assemblerData.context, subString)
                while (safeWidth > width) {
                    subString = subString.substring(0, subString.length - suffix.length - 1) + suffix;
                    safeWidth = safeMeasureText(label.assemblerData.context, subString)
                }
            }
            label.string = subString;
        }
    }

    /**
     * @description 轉換成千分位分隔形式
     * @example 
     * 1000000000 -->  1,000,000,000
     * */
    toThousandths(data: number) {
        let prefix: string = "";
        if (data < 0) {
            data *= -1;
            prefix = '-';
        }
        let digitParten = /(^|\s)\d+(?=\.?\d*($|\s))/g;
        let miliParten = /(?=(?!\b)(\d{3})+\.?\b)/g
        let str: string = data.toString().replace(digitParten, (m) => {
            return m.replace(miliParten, ",");
        })
        return prefix + str;
    }

    /**
     * @description 格式化成K,M,B,T計數單位
     * @param data 傳入數值，支援科學計數法
     * @param point 精確小數點位數 預設為2位
     */
    toFormat(data: number, point: number = 2) {
        let K = 1000;
        let scales: { [key: string]: number } = {
            K: K,
            M: K * K,
            B: K * K * K,
            T: K * K * K * K
        }
        let units = ["K", "M", "B", "T"];
        let unit = "";
        let numberString = "";
        let tempValue = 0;
        let flag = 1;
        if (data < 0) {
            flag = -1;
        }
        data = Math.abs(data);
        if (data < K) {
            numberString = data.toFixed(point);
        } else {
            for (let i = units.length - 1; i >= 0; i--) {
                let scale = scales[units[i]];
                tempValue = data / scale;
                if (tempValue >= 1) {
                    numberString = tempValue.toFixed(point);
                    unit = units[i];
                    break;
                }
            }
        }
        tempValue = parseFloat(numberString);
        return `${tempValue * flag}${unit}`;
    }

    /**
     * @description 將K,M,B,T顯示的字串轉換成數值
     * @param formatValue 傳入格式化的字串 1.2K 支援科學計數法
     * @param point 獲取精確小數點位數
     * @example 
     * toNumber("1.234567K",2) = 1234.57
     * toNumber("1.e3K",2) = 1000000
     * toNumber("qqq1.e3Kee",2) = 1000000
     */
    toNumber(formatValue: string, point: number = 2) {
        let reg = /-?\d+e?[+-]?\d+[KMBT]?|-?\d*\.\d*e?[+-]?\d*[KMBT]?|-?\d+[KMBT]?/;
        let matchs = formatValue.match(reg);
        if (matchs && matchs.length > 0) {
            //摘取字串中的數值
            let K = 1000;
            let scales: { [key: string]: number } = {
                K: K,
                M: K * K,
                B: K * K * K,
                T: K * K * K * K
            }
            let valueStr = ""
            for (let index = 0; index < matchs.length; index++) {
                valueStr += matchs[index];
            }
            let unitMatch = valueStr.match(/[KMBT]/);
            let unit: string = "";
            if (unitMatch && unitMatch.length > 0) {
                unit = unitMatch[0];
            }

            let numberPart = valueStr.substring(0, valueStr.length - unit.length);
            let numberValue = parseFloat(numberPart);
            let scale = scales[unit];
            if (scale) {
                //放在整數部分
                numberValue *= scale;
            }
            return parseFloat(numberValue.toFixed(point));
        }
        Log.e(`無法匹配${formatValue}`)
        return 0;
    }

    /**
     * @description 判斷是否是一個有效的中國公民身份證號碼
     * @param id 
     * @returns 
     */
    isIDNumber(id: string) {
        //18 位身份證號
        let test = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/g;
        if (test.test(id)) {
            return true;
        }
        return false;
    }

    /**
     * @description 判斷是否是騰訊QQ號(騰訊QQ號從10000開始)
     * @param qq 
     */
    isTencentQQ(qq: string) {
        let test = /^[1-9][0-9]{4,}$/;
        if (test.test(qq)) {
            return true;
        }
        return false;
    }
}