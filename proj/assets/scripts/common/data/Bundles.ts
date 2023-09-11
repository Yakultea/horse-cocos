
/**
 * @description 語言包用到，定義好之前，請不要隨意修改順序，以免讀取語言包錯誤
 * 所有的 bundle 相關，都為吃 EBundles 參數
 */
export enum EBundles {
    resources,
    horseGame,
}

interface IBundles {
    bundles: {
        [key: string]: {
            name: string;
            sort: number;
        };
    };
}

/** 將Bundle綁訂到Common語系 */
export const Bundles: IBundles = {
    bundles: {}
};

// 迴圈創建bundle資料 
Object.values(EBundles).forEach((key, index) => {
    if (typeof key === "number") return
    Object.assign(Bundles.bundles, {
        [key]: {
            name: key,
            sort: index,
        },
    });
});