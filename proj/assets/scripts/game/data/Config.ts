import { Size, size } from 'cc';

export default class Config {
    // iphone 尺寸列表
    public static IPHONE_SIZE_MAP: Map<string, Size> = new Map([
        ['iPhone X', size(1125, 2436)],
        ['iPhone XR', size(828, 1792)],
        ['iPhone XS Max', size(1242, 2688)],
        ['iPhone XS', size(1125, 2436)],
        ['iPhone 11', size(828, 1792)],
        ['iPhone 11 Pro Max', size(1242, 2688)],
        ['iPhone 11 Pro', size(1125, 2436)],
        ['iPhone 12', size(1170, 2532)],
        ['iPhone 12 mini', size(1080, 2340)],
        ['iPhone 12 Pro Max', size(1284, 2778)],
        ['iPhone 12 Pro', size(1170, 2532)],
        ['iPhone 13', size(1170, 2532)],
        ['iPhone 13 mini', size(1080, 2340)],
        ['iPhone 13 Pro Max', size(1284, 2778)],
        ['iPhone 13 Pro', size(1170, 2532)]
    ]);
}