import Helper from "./impl/Helper";

const helper = new Helper;
/**
 * @en 
 * @zh 為擴充套件的主程序的註冊方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    startServer() {
        helper.start();
    },
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
