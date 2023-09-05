import { EDITOR } from "cc/env";

/**
 * @description 語言包資料代理
 */
export abstract class LanguageDelegate{
    constructor(){
        this.init();
    }
    /**@description 語言包所在bundle */
    abstract bundle : string;
    private datas : Map<string,Language.Data> = new Map();
    /**
     * @description 資料初始化
     * @example 
     * init(): void {
     *     this.add(TANK_LAN_EN);
     *     this.add(TANK_LAN_ZH);
     * }
     */
    abstract init():void;
    add( data : Language.Data ){
        this.datas.set(data.language,data);
    }

    /**
     * @description 資料合併,由管理器Language呼叫
     * @param language 語言
     * @param source 總語言包資料
     */
    merge( language : string , source : Language.Data): Language.Data {
        let realData = this.datas.get(language);
        if ( realData ){
            source[this.bundle] = realData.data;
        }
        return source;
    }

    /**
     * 導入語言包
     * @param languages 自定義生成語言包
     */
    importLanguages(languages:any){
        for (const key in languages) {
            if (Object.prototype.hasOwnProperty.call(languages, key)) {
                const element = (languages as any)[key];
                this.add(element);
            }
        }
    }
}

/**
 * @description 編輯器模式下注入Bundle語言包資料
 * @param type Language.DataSourceDelegate
 */
export function injectLanguageData( type : any ){
    if ( EDITOR ){
        let data = new (type as any);
        App.language.addDelegate(data);
    }
}