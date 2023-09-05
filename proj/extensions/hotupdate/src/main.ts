//@ts-ignore
import { Platform } from '../@types/packages/builder/@types';
import { helper } from './Helper';
/**
 * @en 
 * @zh 為擴充套件的主程序的註冊方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    showPanel() {
        Editor.Panel.open("hotupdate");
    },
    onAfterBuild(dest: string, platform: Platform) {
        if (platform == "android" || platform == "ios" || platform == "mac" || platform == "windows") {
            helper.onAfterBuild(dest);
        }
    },
    onBeforeBuild(platform:Platform){
        console.log(`[熱更新]開始構建，構建平臺:${platform}`);
        if (platform == "android" || platform == "ios" || platform == "mac" || platform == "windows") {
            helper.onBeforeBuild();
        }
    },
    /**@description png圖片壓縮完成 */
    onPngCompressComplete(dest: string, platform: Platform){
        console.log(`[熱更新]png圖片壓縮完成,構建平臺:${platform}`);
        if (platform == "android" || platform == "ios" || platform == "mac" || platform == "windows") {
            helper.onPngCompressComplete();
        }
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
