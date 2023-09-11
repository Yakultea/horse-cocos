import { Update } from "../../framework/core/update/Update";
import { GameData } from "../../framework/data/GameData"
import { GameDataBase } from "../../framework/data/GameDataBase";
import { Macro } from "../../framework/defines/Macros"
import { EBundles } from "./Bundles";

interface BundleData {
    /**@description 名稱 */
    name: string;
    /**@description 排序 */
    sort: number;
    /**@description 語言包路徑 */
    language: string;
    /**@description Bundle名 */
    bundle: string;
}

type TYPEBUNDLE = { [key: string]: BundleData };

/**
 * @description Stage資料
 * */

export class StageData extends GameData {
    static module = "【Stage資料】";

    /**@description 進入場景堆疊 */
    private _sceneStack: string[] = [];

    private _where: string = Macro.UNKNOWN;
    /**@description 當前所在bundle */
    get where() {
        return this._where;
    }
    set where(v) {
        Log.d(`${this.module}${this._where} ==> ${v}`)
        let prevWhere = this._where;
        this._where = v;
        if (prevWhere != v) {
            this.push(v);
        }
    }
    /**@description 所有入口配置資訊 */
    private _entrys: Map<string, Update.Config> = new Map();
    /**@description 所有子游戲配置 */
    private _games: BundleData[] = [];

    init() {
        super.init();
        //初始化游戏入口配置
        let games = App.getLanguage("bundles") as any as TYPEBUNDLE;
        let keys = Object.keys(games);
        this._entrys.clear();
        keys.forEach(v => {
            let data = games[v];
            let entry = new Update.Config(`bundles.${v}.name`, v);
            this._entrys.set(v, entry);
            if (!(v == EBundles[EBundles.horseGame] || v == Macro.BUNDLE_RESOURCES)) {
                this._games.push({ name: data.name, sort: data.sort, language: `bundles.${v}.name`, bundle: v });
            }
        })

        this._games.sort((a, b) => {
            return a.sort - b.sort;
        })
    }

    /**
     * @description 是否在登入場景
     * @param bundle  不傳入則判斷當前場景是否在登入，傳為判斷傳入bundle是不是登入場景
     * */
    isLoginStage( bundle ?: string) {
        if ( bundle ){
            return bundle == Macro.BUNDLE_RESOURCES;
        }else{
            return this.where == Macro.BUNDLE_RESOURCES;
        }
    }

    /**
     *  @description 是否在大廳場景
     * @param bundle 不傳入則判斷當前場景是否在大廳場景，傳為判斷傳入bundle是不是大廳場景
     */
    isWrapperStage( bundle ?: string ){
        if ( bundle ){
            return bundle == EBundles[EBundles.horseGame];
        }else{
            return this.where == EBundles[EBundles.horseGame];
        }
    }

    /**
     * @description 獲取Bunlde入口配置
     * */
    getEntry(bundle: string) {
        return this._entrys.get(bundle);
    }

    /**@description 獲取當前所有遊戲 */
    get games() {
        return this._games;
    }

    /**
     * @description 向場景棧中壓入場景
     * */
    private push(bundle: string) {
        let count = 0;
        for (let i = this._sceneStack.length - 1; i >= 0; i--) {
            let v = this._sceneStack[i];
            if (v == bundle) {
                count = this._sceneStack.length - i;
                break;
            }
        }

        while (count > 0) {
            this._sceneStack.pop();
            count--;
        }

        this._sceneStack.push(bundle);
        Log.d(`${this.module}壓入場景 : ${bundle}`)
        Log.d(`${this.module}當前場景堆疊 : ${this._sceneStack.toString()}`);
    }

    get prevWhere() {
        let scene: string | undefined = undefined;
        if (this._sceneStack.length >= 2) {
            scene = this._sceneStack[this._sceneStack.length - 2];
        }
        Log.d(`${this.module}獲取的上一場景 : ${scene}`)
        return scene;
    }

}