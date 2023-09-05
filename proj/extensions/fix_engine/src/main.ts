import { parse } from "path";
import Helper from "./impl/Helper";

export class _Helper extends Helper {

    protected get creatorVerion(){
        return Editor.App.version;
    }

    private _path: string | null = null;
    protected get creatorPath(){
        if (this._path) {
            return this._path;
        }
        this._path = Editor.App.path;
        //windows :  D:\Creator\Creator\3.1.0\resources\app.asar
        //mac : /Applications/CocosCreator/Creator/3.3.1/CocosCreator.app/Contents/Resources/app.asar --path
        let parser = parse(this._path);
        this._path = parser.dir;
        return this._path;
    }
}
const Impl = new _Helper();

/**
* @en 
* @zh 為擴充套件的主程序的註冊方法
*/
export const methods = {
    fixEngine() {
        Impl.run();
    },
    onBeforeBuild() {
        if (Impl.isUpdate) {
            console.error(`請先執行【專案工具】->【引擎修正】同步對引擎的修改，再構建!!!`);
        }
    }
};

/**
* @en Hooks triggered after extension loading is complete
* @zh 擴充套件載入完成後觸發的鉤子
*/
export const load = function () {
    console.log("載入fix_engine");
};

/**
* @en Hooks triggered after extension uninstallation is complete
* @zh 擴充套件解除安裝完成後觸發的鉤子
*/
export const unload = function () {
    console.log("解除安裝fix_engine");
};