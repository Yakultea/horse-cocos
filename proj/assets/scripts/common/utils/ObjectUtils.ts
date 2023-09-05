export class ObjectUtils {

	public static isObject(x: any): boolean {
		return Object.prototype.toString.call(x) === '[object Object]';
	}

	public static isEmpty(obj: {}): boolean {
		return Object.keys(obj).length === 0;
	}

	public static copyTo(source: any, target: any): void {
		for (let prop in source) {
			target[prop] = source[prop];
		}
	}

	/**
	 * 它將一個或多個源物件的所有可列舉自有屬性的值複製到目標物件中。
	 * 這基本上就是 Object.assign 所做的事情，但在撰寫時，由於我們仍然針對 ES5，因此它尚不可用。
	 * 備註1：您需要將空物件 {} 作為第一個引數傳遞，以避免改變目標，就像 Object.assign 的工作方式一樣。
	 * 備註2：可能的巢狀物件和陣列將保留為引用，就像 Object.assign 的工作方式一樣。
	 * @param {Object} target
	 * @param {Object} source
	 * @param {Object} sources
	 * @returns {Object}
	 */
	public static assign(target: Object, source: Object, ...sources: Object[]): Object {
		if (typeof Object['assign'] === 'function') {
			return Object['assign'].apply(null, [target, source, ...sources]);
		}

		// polyfill
		[source, ...sources]
			.filter(n => n)				// filter empty entries
			.map(el => {
				Object.keys(el).map(key => {
					// @ts-ignore
					target[key] = el[key];
				});
			});

		return target;
	}

	/**
	 * 遞迴地從一個或多個源物件複製所有可列舉自有屬性的值到目標物件中。
	 * 它將返回合併後的物件作為新的引用。
	 * @param {Object} base
	 * @param {Object} child
	 * @param {Object} children
	 * @returns {any}
	 */
	public static deepExtend(base: Object, child: Object, ...children: Object[]): Object {
		const extended: Object = {};

		// 將物件合併到擴展的物件中。
		// @ts-ignore
		const merge = obj => {
			Object.keys(obj).forEach(key => {
				if (this.isObject(obj[key])) {
					// @ts-ignore
					extended[key] = this.deepExtend(extended[key] || {}, obj[key]);
				} else {
					// @ts-ignore
					extended[key] = obj[key];
				}
			});
		};

		[base, child, ...children]
			.filter(n => n)				// filter empty entries
			.forEach(el => merge(el));

		return extended;
	}

	/**
	 * 將一個或多個來源對象的所有可枚舉自有屬性的值遞歸地複製到目標對象中。
	 * 它將返回合併後的對象作為一個新的引用。
	 * 潛在的巢狀對象和數組也將被複製為新的引用。
	 * @param {Object} source
	 * @returns {Object}
	 */
	public static clone(source: Object): Object {
		const cloned: Object = Array.isArray(source) ? [] : {};

		const deepClone = (value: any): any => {
			if (this.isObject(value)) {
				return this.clone(value);
			} else if (Array.isArray(value)) {
				return this.clone(value);
			} else {
				return value;
			}
		};

		Object.keys(source).map(key => {
			// @ts-ignore
			cloned[key] = deepClone(source[key]);
		});

		return cloned;
	}

	public static entries(obj: Object): any[] {
		if (typeof Object['entries'] === 'function') {
			return Object['entries'].call(null, obj);
		}

		// polyfill
		const ownProps = Object.keys(obj);
		let i = ownProps.length;
		const resArray = new Array(i); // preallocate the Array
		while (i--) {
			// @ts-ignore
			resArray[i] = [ownProps[i], obj[ownProps[i]]];
		}
		return resArray;
	}

	/**
	 * 展平物件 字串化
	 * @param obj 物件對象
	 * @param parentKey 預設不用帶
	 * @returns Object { [key: string]: any; } 
	 * ex: 
	 * const nestedObject = {
	 *   level1: {
	 *     level2: {
	 *       key1: 'value1',
	 *       key2: 'value2'
	 *     },
	 *     key3: 'value3'
	 *   },
	 *   key4: 'value4'
	 * };
	 * export:
	 * {
	 *     "level1.level2.key1": "value1",
	 *     "level1.level2.key2": "value2",
	 *     "level1.key3": "value3",
	 *     "key4": "value4"
	 * }
	 */
	public static flattenObject(obj: any, parentKey = ''): { [key: string]: any; } {
		let result: { [key: string]: any; } = {};

		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {
				const currentKey = parentKey ? `${parentKey}.${key}` : key;

				if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
					const nestedObj = this.flattenObject(obj[key], currentKey);
					result = { ...result, ...nestedObj };
				} else {
					result[currentKey] = obj[key];
				}
			}
		}
		return result;
	}

	/**
	 * 比較兩物件差異的值 
	 * @param preObj 舊物件
	 * @param newObj 新物件
	 * @returns 回傳 有變化的 資料
	 */
	public static diffObjects(preObj: any, newObj: any): object {
		const diffObj: any = {};

		for (const key in preObj) {
			if (preObj.hasOwnProperty(key) && newObj.hasOwnProperty(key)) {
				if (preObj[key] !== newObj[key]) {
					diffObj[key] = newObj[key];
				}
				if (preObj[key] === undefined) {
					diffObj[key] = newObj[key];
				}
			}
		}

		return diffObj;
	}
}
