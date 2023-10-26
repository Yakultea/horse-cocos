/**@description 除錯 */
interface Logger {
	/**@description 錯誤日誌 */
	e(...data: any[]): void;
	/**@description debug日誌 */
	d(...data: any[]): void;
	/**@description 警告輸出 */
	w(...data: any[]): void;
	/**
	 * @description dump 物件資料
	 * @param object dump的物件
	 * @param label 標籤
	 * @param deep 深度
	 */
	dump(object: unknown, label?: string, deep?: number): void;
}
declare let Log: Logger;

declare type BUNDLE_TYPE = string | import("cc").AssetManager.Bundle;
declare type SocketBuffer = string | Uint8Array;
/**
 * @description 發事件 參考framework/extentions/extentions dispatch 方法
 * @param name 
 * @param args 
 */
declare function dispatch(name: string, ...args: any[]): void;

declare interface Date {
	/**
	 * @description 格式當前時間 
	 * @example 
	 * y : 年
	 * M ：月
	 * d : 日
	 * h : 時 
	 * m : 分
	 * s : 秒
	 * q : 季度
	 * S ：毫秒
	 * let now = new Date();
	 * let str = now.format("yyyy:MM:dd hh:mm:ss"); //2019:11:07 10:19:51
	 * str = now.format("yyyy/MM/dd");//2019/11/07
	 * str = now.format("hh:mm:ss");//10:19:51
	 * str = now.format("yyyy/MM/dd hh:mm:ss.SS 第qq季度");//2022/07/21 23:32:23.75 第03季度
	 * */
	format(format: string): string;
}

declare interface DateConstructor {
	/**
	 * @description 返回當前時間的秒數
	 * @example 
	 * Date.timeNow()
	 *  */
	timeNow(): number;
	/**
	 * @description 返回格式化後的時間
	 * @param format 
	 * @param date 如果不傳入，則為當前時間
	 */
	format(format: string, date?: Date): string;
}

declare interface StringConstructor {
	/**
	 * @description 格式化字串
	 * @example
	 * String.format("{0}-->{1}-->{2}","one","two","three") | String.format("{0}-->{1}-->{2}",["one","two","three"])
	 * => "one-->two-->three"
	 * */
	format(...args: any[]): string;
}

declare function md5(data: any): any;

/**@description 提示彈出框配置 */
declare interface AlertConfig {
	/**@description 用來標識彈出框，後面可指定tag進行關閉所有相同tag的彈出框 */
	tag?: string | number,
	/**@description 提示內容 richText只能二先1 */
	text?: string,
	/**@description 標題,預設為 : 溫馨提示 */
	title?: string,
	/**@description 確定按鈕文字 預設為 : 確定*/
	confirmString?: string,
	/**@description 取消按鈕文字 預設為 : 取消*/
	cancelString?: string,
	/**@description 確定按鈕回撥 有回撥則顯示按鈕，無回撥則不顯示*/
	confirmCb?: (isOK: boolean) => void,
	/**@description 取消按鈕回撥 有回撥則顯示按鈕，無回撥則不顯示*/
	cancelCb?: (isOK: boolean) => void,
	/**@description 富檔案顯示內容 跟text只能二選1 */
	richText?: string,
	/**@description true 回撥後在關閉彈出 false 關閉彈出框在回撥 預設為 : false */
	immediatelyCallback?: boolean,
	/**@description 是否允許該tag的彈出框重複彈出，預設為true 會彈出同類型的多個 */
	isRepeat?: boolean,
	/**@description 使用者自定義資料 */
	userData?: any,
}

/**
 * @description 處理遊戲事件介面宣告
 * cc.game.EVENT_ENGINE_INITED
 * cc.game.EVENT_GAME_INITED
 * cc.game.EVENT_HIDE
 * cc.game.EVENT_RESTART
 * cc.game.EVENT_SHOW
 **/
declare interface GameEventInterface {

	/**@description 進入後臺 cc.game.EVENT_HIDE*/
	onEnterBackground(): void;

	/**
	 * @description 進入前臺 cc.game.EVENT_SHOW
	 * @param inBackgroundTime 在後臺執行的總時間，單位秒
	 */
	onEnterForgeground(inBackgroundTime: number): void;
}

declare type UIView = import("../assets/scripts/framework/core/ui/UIView").default;
declare interface UIClass<T extends UIView> {
	new(): T;
	/**
	 *@description 檢視prefab 地址 resources目錄下如z_panels/WeiZoneLayer,
	 * 如果是在主場景上的節點
	 * static getPrefabUrl(){
	 *   return `@LoginView`;
	 * } 
	 */
	getPrefabUrl(): string;
}

/**
 * @description 單列介面類
 */
declare interface ISingleton {
	/**@description 初始化 */
	init?(...args: any[]): any;
	/**@description 銷燬(單列銷燬時呼叫) */
	destory?(...args: any[]): any;
	/**@description 清理資料 */
	clear?(...args: any[]): any;
	/**@description 是否常駐，即建立後不會刪除 */
	isResident?: boolean;
	/**@description 不用自己設定，由單列管理器賦值 */
	module: string;
	/**輸出除錯資訊 */
	debug?(...args: any[]): void;
}

declare interface ModuleClass<T> {
	new(): T;
	/**@description 模組名 */
	module: string;
}

/**@description 單列型別限制 */
declare interface SingletonClass<T> extends ModuleClass<T> {
	instance?: T;
}

declare interface EntryClass<T> {
	new(): T;
	/**@description 當前bundle名 */
	bundle: string;
}

declare type Entry = import("../assets/scripts/framework/core/entry/Entry").Entry;
declare type Logic = import("../assets/scripts/framework/core/logic/Logic").Logic;
declare type GameView = import("../assets/scripts/framework/core/ui/GameView").default;
declare interface GameViewClass<T extends UIView> {
	new(): T;
	logicType: ModuleClass<Logic>;
}

declare type Sender = import("../assets/scripts/framework/core/net/service/Sender").Sender;
declare type Handler = import("../assets/scripts/framework/core/net/service/Handler").Handler;
declare type ReconnectHandler = import("../assets/scripts/common/net/ReconnectHandler").ReconnectHandler;

declare type Service = import("../assets/scripts/framework/core/net/service/Service").Service;
declare interface ServiceClass<T extends Service> extends ModuleClass<T> {
}

/**
 * @description 透過預置體路徑建立節點 請使用全域性的匯入
 * @param config 配置資訊
 * @param config.url 預置體路徑
 * @param config.view 預置檢視資源管理器，繼承自UIView
 * @param config.complete 建立完成回撥 
 * @param config.bundle 可不填，預設為開啟UIView時指向的Bundle
 * @example 
 * createPrefab({url :GAME_RES("res/animations/shzDealerCommon"),view:this,complete:(node)=>{
 *     if ( node ){
 *         // to do 
 *     }
 * }});
 **/
declare function createPrefab(
	config: {
		url: string,
		view: UIView,
		complete: (node: import("cc").Node) => void,
		bundle?: BUNDLE_TYPE
	}): void;

/**
* @description 擴充套件一個在介面中載入指定目錄的介面 請使用全域性的匯入
* @param config 配置資訊
* @param config.url 資源路徑
* @param config.view 資源持有者,繼承自UIView
* @param config.onComplete 載入完成回撥 data為ResourceCacheData，用之前先判斷當前返回的data.data是否是陣列
* @param config.onProgress 載入進度
* @param config.bundle 可不填，預設為view指向的bundle
* @param config.type 載入的資源型別
* */
declare function loadDirRes(config: {
	bundle?: BUNDLE_TYPE,
	url: string,
	type: typeof import("cc").Asset,
	view: UIView,
	onProgress?: (finish: number, total: number, item: import("cc").AssetManager.RequestItem) => void,
	onComplete: (data: import("../assets/scripts/framework/core/asset/Resource").Resource.CacheData) => void
}): void;

/**
* @description 擴充套件一個在介面載入指定資源介面 請使用全域性的匯入
* @param config 配置資訊
* @param config.bundle 可不填，預設為view指向的bundle
* @param config.url 資源路徑
* @param config.type 載入的資源型別
* @param config.onProgress 載入進度
* @param config.onComplete 載入完成回撥 data為ResourceCacheData
* @param config.view 資源持有者,繼承自UIView
*/
declare function loadRes(config: {
	bundle?: BUNDLE_TYPE,
	url: string,
	type: typeof import("cc").Asset,
	onProgress?: (finish: number, total: number, item: import("cc").AssetManager.RequestItem) => void,
	onComplete: (data: import("../assets/scripts/framework/core/asset/Resource").Resource.CacheData) => void,
	view: UIView
}): void;


declare type EntryDelegate = import("../assets/scripts/framework/core/entry/EntryDelegate").EntryDelegate;
declare type Message = import("../assets/scripts/framework/core/net/message/Message").Message;

interface IService {
	addListener?(cmd: string, handleType: any, handleFunc: Function, isQueue: boolean, target: any): any;

	removeListeners?(target: any, eventName?: string): any;

	send?(msg: Message): any;
}

/**@description 語言包相關 */
declare namespace Language {
	export interface Data {
		language: string;
		[key:string] : Object;
	}

	export interface LanguageComponent {
		forceDoLayout(): void;
	}
}

/**@description 檢視開啟，關閉，隱藏動畫 */
declare type ViewAction = (complete: () => void) => void;

/**@description UIManager open引數說明 */
declare interface OpenOption {
	/**@description 開啟介面的型別 */
	type: UIClass<UIView>;
	/**@description 檢視繫結預置資源所在bundle,預設為resources目標 */
	bundle?: BUNDLE_TYPE;
	/**@description 節點層級，預設為0 */
	zIndex?: number;
	/**
	 * @description 
	 * delay > 0 時間未載入介面完成顯示載入動畫，
	 * delay = 0 則不顯示載入動畫，但仍然會顯示UILoading,在載入介面時阻擋玩家的觸控事件
	 * delay 其它情況以UILoading的預設顯示時間為準
	 */
	delay?: number;
	/**@description 預設""
	 * 介面名字，如商城，個人資訊,當delay>0時，載入超時後，會提示顯示某某介面失敗 
	 * 否則預設提示載入介面失敗
	 **/
	name?: string;
	/**@description 是否是預載入預置資源，預設為false */
	preload?: boolean;
	/**@description 使用者自定義引數 */
	args?: any | any[];
}

declare interface DefaultOpenOption extends OpenOption {
	/**@description 檢視繫結預置資源所在bundle,預設為resources目標 */
	bundle: BUNDLE_TYPE;
	/**@description 節點層級，預設為0 */
	zIndex: number;
	/**@description 是否是預載入預置資源，預設為false */
	preload: boolean;
}

declare type ByteArray = import("../assets/scripts/framework/plugin/ByteArray").ByteArray;

declare type TableView = import("../assets/scripts/framework/core/ui/TableView").default;

declare type Bundles = import("../assets/scripts/common/data/Bundles").EBundles;

declare let App: import("../assets/Application").Application;

declare type LanguageZH = typeof import("../assets/scripts/common/language/LanguageZH").LanguageZH;
declare type LanguageEN = typeof import("../assets/scripts/common/language/LanguageEN").LanguageEN;

declare type LanguageData = LanguageZH & LanguageEN;

declare function restart(): void;