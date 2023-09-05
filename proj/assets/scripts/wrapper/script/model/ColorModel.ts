// ---------- 引用 ----------------------------------------------------------------

import { Color } from "cc";
import { BaseModel } from "../../../framework/core/event/BaseModel";
import { Logic } from "../../../framework/core/logic/Logic";


// ---------- 常數 ----------------------------------------------------------------
/** @deprecated 棄用 後續將移除 */
export enum EColorKeys {
    yellow,
    green,
    red,
    white,
    record,
    background,
    mainGame,
}
export interface IColorModel {
    yellow: {
        primary: Color;
        secondary: Color;
    };
    green: {
        primary: Color;
    };
    red: {
        primary: Color;
    };
    white: {
        textAuto01: Color;
        labelDefault01: Color;
        hover01: Color;
        default01: Color;
        info01: Color;
    };
    record: {
        5: Color;
        10: Color;
    };
    background: {
        0: Color;
        20: Color;
        40: Color;
        60: Color;
        80: Color;
        100: Color;
    };
    mainGame: {
        auxiliary: Color;
        main: Color;
        mainHover: Color;
        topbar: Color;
    };
}


/**
 * Model 是用來儲存全部共用的資料 
 */
class ColorModel extends BaseModel<IColorModel> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: ColorModel = null;
    public static Instance() { return this._instance || (this._instance = new ColorModel()); }

    constructor() {
        super();

        // 色票 可以使用tools `npm run color` 進行生成

        this.data = {
            mainGame: {
                topbar: new Color(42, 26, 77, 255 * 0.82),
                mainHover: new Color('#896acc'),
                auxiliary: new Color('#4e3487'),
                main: new Color('#ab84ff')
            },
            yellow: {
                secondary: new Color(255, 168, 0, 255 * 0.3),
                primary: new Color('#ffd680')
            },
            white: {
                textAuto01: new Color('#ffffff'),
                labelDefault01: new Color(255, 255, 255, 255 * 0.6),
                hover01: new Color(255, 255, 255, 255 * 0.3),
                default01: new Color(255, 255, 255, 255 * 0.15),
                info01: new Color('#ffffff')
            },
            record: {
                5: new Color(255, 255, 255, 255 * 0.05),
                10: new Color(255, 255, 255, 255 * 0.24)
            },
            green: {
                primary: new Color('#3ae300')
            },
            red: {
                primary: new Color('#ff6433')
            },
            background: {
                0: new Color('#c9c9cc'),
                20: new Color('#a9a9ad'),
                40: new Color('#88898e'),
                60: new Color('#68696f'),
                80: new Color('#474951'),
                100: new Color('#272932')
            }
        };


    }

    // ---------- 框架呼叫 --------------------------------------------------------
    public setData(ColorModelVO: IColorModel) {
        this.data = ColorModelVO;
    }

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------

    /** value1 */
    // public get value1() { return this.data.value1; }
    // public set value1(value: number) { this.data.value1 = value; }

    // public reset() {
    //     this.data = {
    //         value1: null,
    //     };
    // }
}

export default ColorModel.Instance();

// 動態生成 色票enum 使用於 UIColor
const data = ColorModel.Instance().getData();
export enum EUiColorKeys {
    // 透過程式碼生成 enum 成員
    // 格式：'key/subKey'
}

// 將 colorData 轉換成 EColorData enum 成員
let index = 0;
for (const key in data) {
    for (const subKey in (data as any)[key]) {
        (EUiColorKeys as any)[`${key}_${subKey}`] = hashCode(`${key}_${subKey}`);
        index++;
    }
}

/** 哈希算法 英文轉數字 */
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return hash;
}