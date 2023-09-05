//@ts-ignore
import { Platform } from '../@types/packages/builder/@types';
import { BuilderOptions } from './core/Defines';
import { helper } from './HelperImpl';
/**
 * @en 
 * @zh 為擴充套件的主程序的註冊方法
 */
const PACKAGE_NAME = "png-compress"
export const methods: { [key: string]: (...any: any) => any } = {
    open_panel() {
        Editor.Panel.open(PACKAGE_NAME);
    },
    onBeforeBuild(platform: Platform) {
        helper.read(true);
        if ( helper.data ){
            if (helper.data.enabled) {
                helper.data.isProcessing = true;
                helper.save();
                Editor.Message.send(PACKAGE_NAME, "onStartCompress");
            } else {
                helper.data.isProcessing = false;
                helper.save();
            }
        }
        
        console.log("[圖片壓縮]:", `開始構建,構建平臺:${platform}`);
    },
    onAfterBuild(op: BuilderOptions) {
        helper.read(true)
        if ( helper.data ){
            if (helper.data.enabled) {
                helper.data.isProcessing = true;
                helper.save();
                Editor.Panel.open(PACKAGE_NAME);
            } else {
                helper.data.isProcessing = false;
                helper.save();
            }
        }
        helper.onAfterBuild(op);
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 擴充套件載入完成後觸發的鉤子
 */
export const load = function () { };

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 擴充套件解除安裝完成後觸發的鉤子
 */
export const unload = function () { };
