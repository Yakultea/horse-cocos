/**@description 網路相關 */
export namespace Net {
	/** @description 處理函式宣告 handleType 為你之前註冊的handleType型別的資料 返回值number 為處理函式需要的時間 */
	export type HandleFunc = (handleTypeData: any) => number;
	export interface ListenerData {
		cmd: string,//事件名，如果是主命令跟子命令，按自己的需要返回固定組合如，mainCmd 1 subCmd 2 eventName = "1_2" | "12" 單個消夏碼直接返回 "1"
		func: HandleFunc, //處理函式
		type: (new () => Message) | string, //解包型別
		isQueue: boolean,//是否進入訊息佇列，如果不是，收到網路訊息返回，會立即回撥處理函式
		data?: any, //解包後的資料
		target?: any, //處理者
	}
	export type Type = "ws" | "wss";
	export enum ServiceType {
		Unknown,
		Json,
		Proto,
		BinaryStream,
	}
	export interface HeartbeatClass<T extends Message> {
		type: ServiceType;
		new(): T;
	}

	/**@description proto 網路相關 */
	export namespace Proto {

		/**@description 繫結資訊 */
		export interface BindConfig {
			/**@description cmd */
			cmd: string | number;
			/**@description  proto解析的型別名*/
			className: string;
		}

		/**@description 解析配置 */
		export interface decodeConfig {
			/**@description  proto解析的型別名*/
			className: string;
			/**@description proto網路位元組流 */
			buffer: Uint8Array;
		}

		export interface File {
			/**@description proto檔案路徑 */
			url: string;
			/**@description proto檔案所有bundle */
			bundle: BUNDLE_TYPE;
			/**@description proto副檔名，預設為.proto */
			ext: string;
		}

		/**@description 模組配置 */
		export interface ModuleConfig {
			/**@description 模組名 */
			name: string;
			/**@description 模組下所有proto檔案 */
			files: File[];
		}
	}
}

