import { Vec2 } from "cc";

/**
 * 数学工具
 */
export default class MathUtil {

    /**
    * 获取随机数
    * @param min 最小值
    * @param max 最大值
    */
    public static getRandomNumber(min: number = 0, max: number = 1): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 获取一个伪随机数
     * @param seed 随机种子
     * @param key key
     */
    public static getRandomWithSeed(seed: number, key: number) {
        return Math.ceil((((seed * 9301 + 49297) % 233280) / (233280.0)) * key);
    }

    /**
     * 获取两点间的角度
     * @param p1 点1
     * @param p2 点2
     */
    public static getAngle(p1: Vec2, p2: Vec2): number {
        return Math.atan((p2.y - p1.y) / (p2.x - p1.x));
    }

    /**
     * 获取两点间的距离
     * @param p1 点1
     * @param p2 点2
     */
    public static getDistance(p1: Vec2, p2: Vec2): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    /**
     * 将角度转为弧度
     * @param angle 角度
     */
    public static angleToRadian(angle: number): number {
        return angle * Math.PI / 180;
    }


    /**
     * 數字前面補0
     * @param num 數字
     * @param digit 位數
     * @returns 
     */
    public static zeroPad(num: number, digit: number = 2): string {
        return num.toString().padStart(digit, "0");
    }

    /**
     * 2D陣列轉1D陣列
     * @param arr T[][]
     * @returns T[]
     */
    public static flattenArray<T>(arr: T[][]): T[] {
        return arr.reduce((flatArray, subArray) => flatArray.concat(subArray), []);
    }
}
