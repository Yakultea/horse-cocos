import { SpriteFrame } from "cc";
import { EBundles } from "../data/Bundles";

export class LoadUtils {

    /**
     * 取得 目錄下圖片資源
     * @param dir 檔案路徑
     * @returns 
     */
    public static getDirSp(bundle: BUNDLE_TYPE, dir: string, fileName: string): SpriteFrame {
        const spriteFrames = App.cache.get(bundle, dir).data as SpriteFrame[];
        const sp = spriteFrames.find(item => item.name === fileName);
        if (!sp) throw new Error(`NOT FIND 所需SpriteFrame ${fileName}`);
        return sp;
    }
}