/**
 * @description 公共工具
 */

import { Button, Color, Component, EventHandler, EventTouch, Label, Layers, Layout, Node, NodeEventType, Sprite, Tween, UIOpacity, UITransform, Widget, tween, v3 } from "cc";
import { IlabelMarquee, Utils } from "../../framework/utils/Utils";
import DefinitionModel from "../../wrapper/script/model/DefinitionModel";

export interface ITweenNum {
    label: Label,
    start: number,
    end: number,
    tweenTime: number,
    digital: number,
    useThousandsSeparator: boolean;
    callback?: Function,
}

export class CmmUtils extends Utils {

    /**
     * 帶小數的四捨五入
     * @param val 數字
     * @param precision 小數點位數
     * @returns number
     */
    public static roundDecimal(val: number, precision: number): number {
        return Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
    };

    /**
     * 自動取小數 並補上0
     * @param value 
     * @param precision 
     * @returns 
     */
    public static dotFormat(value: number, precision: number): string {
        const isDot = /^[1-9]?[0-9]*\.[0-9]*[1-9]+$/.test(value.toString());
        let digitSetting: number = 0;

        if (isDot) digitSetting = precision;

        return `${this.roundDecimal(value, precision)}`;
    }


    // ============== 神奇小工具-東群 ==============

    /** 程式碼添加事件 */
    public static getEventHandler(target: Node, handler: string, customEventData?: string): EventHandler {
        const event = new Component.EventHandler();
        event.target = target;
        event.component = target.name;
        event.handler = handler;
        if (customEventData) event.customEventData = customEventData;

        return event;
    }

    /** 字串太長的話 跑馬燈功能 */
    public static labelMarquee(config: IlabelMarquee): void {
        let maskWidth = config.maskNode.getComponent(UITransform).width;
        let labelWidth = config.labelNode.getComponent(UITransform).width;
        let offset = labelWidth - maskWidth;
        let moveTime = offset * 0.07;

        if (!config.originPosX) {
            config.originPosX = 0;
        }
        if (config.isCenter) {
            config.originPosX = (labelWidth > maskWidth) ? (labelWidth - maskWidth) / 2 : 0;
        }

        config.labelNode.position = v3(config.originPosX, 0, 0);
        Tween.stopAllByTarget(config.labelNode);
        if (offset > 0) {
            tween(config.labelNode)
                .repeatForever(
                    tween()
                        .delay(config.delayTime)
                        .to(moveTime, { x: config.originPosX - offset })
                        .delay(config.delayTime)
                        .to(moveTime, { x: config.originPosX })
                )
                .start();
        }
    }

    /**
     * 格式化數字
     * @param number 輸入number
     * @param isZeroPadding 是否補0
     * @param useThousandsSeparator 是否使用千分位逗號 
     * @param decimalPlaces 取小數點後幾位
     * @returns string 格式化後的數字
     */
    public static formatNumber(number: number, isZeroPadding: boolean = false, useThousandsSeparator: boolean = true, decimalPlaces?: number): string {
        // 若未指定小數點位數，則依後端位數為主
        if (decimalPlaces === undefined) {
            decimalPlaces = DefinitionModel.getData().digital;
        }
        let formattedNumber = number.toFixed(decimalPlaces);

        if (isZeroPadding) {
            const parts = formattedNumber.split('.');
            if (parts.length === 1) {
                // 整數部分沒有小數點，需要在後面補0
                formattedNumber += '.' + '0'.repeat(decimalPlaces);
            } else if (parts[1].length < decimalPlaces) {
                // 小數位數不足，需要在後面補0
                formattedNumber += '0'.repeat(decimalPlaces - parts[1].length);
            }
        }

        if (useThousandsSeparator) {
            const parts = formattedNumber.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            formattedNumber = parts.join('.');
        }

        return formattedNumber;
    }

    /** 數字前面補0, num是數字, length是數字長度 */
    public static prefixInteger(num: number, length: number) {
        return (Array(length).join('0') + num).slice(-length);
    }

    /** 判斷data是否為空物件 ,true代表data是{} */
    public static isEmptyObject(data: any) {
        return !Object.keys(data).length;
    }

    /** /轉換數字變成 xxxB xxxM xxxK xxx */
    public static formatNumStr(data: number) {
        const unitTypes = ["", "K ", "M ", "B "];
        let numStr = Math.floor(data).toString();
        let numStrLen = numStr.length;
        let counts = Math.floor(numStrLen / 3);
        let strArray = [];
        let newNumStr = "";

        if (counts) {
            for (let i = 0; i <= counts; i++) {
                let start = numStrLen - i * 3;
                let end = (i == counts) ? 0 : numStrLen - (i + 1) * 3;
                let subStr = numStr.substring(start, end);

                subStr = subStr.replace(/^0+/, '');
                if (!subStr.length) continue;

                strArray.push(subStr + unitTypes[i]);
            }
            strArray.reverse();
            strArray.forEach((str) => {
                newNumStr += str;
            });
        } else {
            newNumStr = numStr;
        }

        return newNumStr;
    }

    //複製文字至剪貼簿
    public static CopyText(text: string) {
        let input = text;//this._textDisplayArea.string;

        const el = document.createElement('textarea');

        el.value = input;

        // Prevent keyboard from showing on mobile
        el.setAttribute('readonly', '');

        el.style.contain = 'strict';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.fontSize = '12pt'; // Prevent zooming on iOS

        const selection = getSelection();
        let originalRange;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }

        document.body.appendChild(el);
        el.select();

        // Explicit selection workaround for iOS
        el.selectionStart = 0;
        el.selectionEnd = input.length;

        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) { }

        document.body.removeChild(el);

        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }
    }

    /** 正規表達 取得 <> 內的內容 */
    public static extractContentBetweenAngleBrackets(text: string): string[] {
        const pattern = /<([^<>]+)>/g;
        const matches = text.match(pattern);

        if (matches) {
            return matches.map(match => match.substring(1, match.length - 1));
        }

        return [];
    }

    /**
     * 防止連點
     * @param targetNode 目標node
     * @param delaySeconds 延遲秒數
     * @param callback 回調
     */
    public static addDoubleClickProtection(targetNode: Node, callback: Function, delaySeconds: number = 0.5, touchEvent: NodeEventType = NodeEventType.TOUCH_END) {
        let canClick = true;

        function clickHandler() {
            if (!canClick) {
                return;
            }

            canClick = false;

            callback();

            setTimeout(() => {
                canClick = true;
            }, delaySeconds * 1000);
        }

        targetNode.on(touchEvent, clickHandler);
    }

    /**
     * 針對button組件 新增click事件
     * @param targetNode 目標node
     * @param callback 回調
     * @param options delaySeconds: 延遲秒數
     */
    public static addBtnClickEvent(targetNode: Node, callback: Function, options?: { delaySeconds?: number; }) {
        let canClick = true;

        const clickHandler = (data: EventTouch[]) => {
            if (!canClick) {
                return;
            }

            canClick = false;

            callback(data);

            let _delaySeconds = (options && options.delaySeconds) ? options.delaySeconds : 0.5;
            setTimeout(() => {
                canClick = true;
            }, _delaySeconds * 1000);
        };

        const event: EventHandler = new EventHandler();
        event.target = targetNode;
        event.component = CmmUtils.extractContentBetweenAngleBrackets(targetNode.name)[0];
        event.handler = Node.EventType.TOUCH_END;
        // event.customEventData = customEventData;
        event.emit = (data) => {
            clickHandler(data);
        };
        targetNode.getComponent(Button).clickEvents.push(event);
    }

    /** 字串轉大駝峰 */
    public static toPascalCase(str: string): string {
        return str.replace(/(\w)(\w*)/g, (match, firstChar, rest) => {
            return firstChar.toUpperCase() + rest.toLowerCase();
        });
    }

    /** 第一個字母大寫 */
    public static capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * 設定 widget 上右下左 水平置中 垂直置中
     * @param targetNode 對象
     * @param margins number: 間距, boolean:是否啟用
     */
    public static setWidget(targetNode: Node, margins: Array<number | boolean>) {
        const widget = targetNode.getComponent(Widget);
        if (!widget) {
            Log.e('!!! 查無 widget 組件 請新增widget !!!');
            return;
        }

        // 上右下左
        const keys = ['top', 'right', 'bottom', 'left', 'horizontalCenter', 'verticalCenter'];

        keys.forEach((key, index) => {
            if (typeof margins[index] === 'boolean' && margins[index] === false) {
                (widget as any)[`isAlign${CmmUtils.capitalizeFirstLetter(key)}`] = false;

                return;
            }
            (widget as any)[`isAlign${CmmUtils.capitalizeFirstLetter(key)}`] = true;
            (widget as any)[key] = margins[index];
        });
        // 必須在下一幀(ㄓㄥˋ)進行更新，否則他無法正確執行。
        targetNode.getComponent(Component).scheduleOnce(() => {
            widget.updateAlignment();
        });
    }

    /**
     * 取漸層色算法
     * @param startColor 開始顏色
     * @param endColor 結束顏色
     * @param percentages 漸層色百分比趴數
     * @returns 
     */
    public static calculateGradientColors(startColor: string, endColor: string = '#FFFFFF', percentages: number[] = [100, 80, 60, 40, 20]): string[] {
        const colorRegex = /^#([0-9A-Fa-f]{6})$/; // 顏色值的正規表示式

        // 驗證並提取起始色票和結束色票的顏色值
        const startMatch = startColor.match(colorRegex);
        const endMatch = endColor.match(colorRegex);
        if (!startMatch || !endMatch) {
            throw new Error('Invalid color format');
        }
        const startValue = parseInt(startMatch[1], 16);
        const endValue = parseInt(endMatch[1], 16);

        // 提取起始色票和結束色票的 RGB 值
        const startR = (startValue >> 16) & 255;
        const startG = (startValue >> 8) & 255;
        const startB = startValue & 255;
        const endR = (endValue >> 16) & 255;
        const endG = (endValue >> 8) & 255;
        const endB = endValue & 255;

        // 生成漸變色色碼陣列
        const gradientColors: string[] = [];
        for (let i = 0; i < percentages.length; i++) {
            const percent = percentages[i] / 100;
            const r = Math.round(startR + (endR - startR) * percent);
            const g = Math.round(startG + (endG - startG) * percent);
            const b = Math.round(startB + (endB - startB) * percent);
            const colorCode = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
            gradientColors.push(colorCode);
        }

        return gradientColors;
    }

    /**
     * 取漸層色算法
     * @param startColor 開始顏色
     * @param endColor 結束顏色
     * @param steps 步進
     * @returns 
     */
    public static calculateGradientColors2(startColor: string, endColor: string, steps: number): string[] {
        const colorRegex = /^#([0-9A-Fa-f]{6})$/; // 顏色值的正規表示式

        // 驗證並提取起始色票和結束色票的顏色值
        const startMatch = startColor.match(colorRegex);
        const endMatch = endColor.match(colorRegex);
        if (!startMatch || !endMatch) {
            throw new Error('Invalid color format');
        }
        const startValue = parseInt(startMatch[1], 16);
        const endValue = parseInt(endMatch[1], 16);

        // 提取起始色票和結束色票的 RGB 值
        const startR = (startValue >> 16) & 255;
        const startG = (startValue >> 8) & 255;
        const startB = startValue & 255;
        const endR = (endValue >> 16) & 255;
        const endG = (endValue >> 8) & 255;
        const endB = endValue & 255;

        // 計算每個色票之間的 RGB 值步長
        const stepR = (endR - startR) / (steps - 1);
        const stepG = (endG - startG) / (steps - 1);
        const stepB = (endB - startB) / (steps - 1);

        // 生成漸變色色碼陣列
        const gradientColors: string[] = [];
        for (let i = 0; i < steps; i++) {
            const r = Math.round(startR + stepR * i);
            const g = Math.round(startG + stepG * i);
            const b = Math.round(startB + stepB * i);
            const colorCode = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
            gradientColors.push(colorCode);
        }

        return gradientColors;
    }

    /** 創建node */
    public static createNode(name: string = 'newNode', options?: { Widget?: boolean, UIOpacity?: boolean, Layout?: boolean, Button?: boolean, Sprite?: boolean, subLabel?: boolean; }): Node {
        const newNode = new Node();

        newNode.name = name;
        newNode.layer = Layers.Enum.UI_2D;

        if (options?.Widget) {
            newNode.addComponent(Widget);
        }
        if (options?.UIOpacity) {
            newNode.addComponent(UIOpacity);
        }
        if (options?.Layout) {
            newNode.addComponent(Layout);
        }
        if (options?.Button) {
            newNode.addComponent(Button);
            newNode.addComponent(Sprite);
        }
        if (options?.subLabel) {
            const label = this.createNode('Label');
            label.addComponent(Label);
            label.setParent(newNode);
        }
        if (options?.Sprite) {
            newNode.addComponent(Sprite);
        }

        return newNode;
    }

    public static tweenNum(config: ITweenNum): Tween<any> {
        const { label, start, end, tweenTime, digital, useThousandsSeparator, callback } = config;
        const obj = { value: start };

        return tween(obj)
            .to(tweenTime, {
                value: end,
            }, {
                // easing: 'quintOut',
                onUpdate: () => {
                    label.string = this.formatNumber(obj.value, false, useThousandsSeparator, digital);
                },
                onComplete: () => {
                    label.string = this.formatNumber(end, false, useThousandsSeparator, digital);
                    callback && callback();
                }
            },)
            .start();
    }

    /**
     * 顏色加深 (會失去原本顏色資訊)
     * @param color Color
     * @param darkenValue 調整加深的係數 預設0.5
     * @returns Color
     */
    public static rgbaToDarkGray(color: Color, darkenValue: number = 0.5): Color {
        const { r, g, b, a } = color;
        const darkR = Math.round(r * darkenValue);
        const darkG = Math.round(g * darkenValue);
        const darkB = Math.round(b * darkenValue);

        // 計算灰階值
        const grayValue = Math.round(0.299 * darkR + 0.587 * darkG + 0.114 * darkB);

        // 創建新的 Color 物件，套用灰階值至 R、G、B 通道，同時保留原始的 A 值
        const grayColor = new Color(grayValue, grayValue, grayValue, a);

        return grayColor;
    }

    /**
     * Debounce（防抖）：
     * 當一個事件觸發時，防抖的目標是等待一段時間，確保在這段時間內不再觸發該事件。
     * 如果在這段時間內又有新事件觸發，計時器將被重設。
     * 防抖通常用於需要等待用戶在操作完成後進行事件處理的情況，例如：
     * 搜尋框自動完成功能：在用戶停止輸入一段時間後再進行搜尋。
     * 視窗大小調整：等待用戶完成調整視窗大小後再進行重新渲染。
     * 遊戲中的連續動作：等待玩家停止移動遊戲角色後再更新遊戲狀態。
     * @param func 
     * @param delay 
     * @returns Function
     */
    public static debounce(func: Function, delay: number = 250): Function {
        let timeoutId: ReturnType<typeof setTimeout>;

        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    /**
     * Throttle（節流）：
     * 當一個事件觸發時，節流會限制該事件的觸發頻率，確保在一段時間內只有一次事件觸發。
     * 節流通常用於需要控制頻繁觸發的事件，避免過多的處理，例如：
     * 滾動事件：限制滾動事件觸發的頻率，以減少滾動時的處理次數。
     * 鼠標移動事件：限制鼠標移動事件的觸發頻率，避免過於頻繁的更新。
     * @param func 
     * @param delay 
     * @returns Function
     */
    public static throttle(func: Function, delay: number = 500): Function {
        let lastExecution = 0;

        return (...args: any[]) => {
            const now = Date.now();
            if (now - lastExecution >= delay) {
                func.apply(this, args);
                lastExecution = now;
            }
        };
    }
}