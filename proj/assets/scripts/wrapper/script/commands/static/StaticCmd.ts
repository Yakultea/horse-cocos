
import { ISpinRes, IInitialRes } from '../../types/res-type';
import { initial, spin } from './StaticConfig';

/**
 * 靜態假資料命令
 * StaticFakeCmd
 */
export default class StaticFakeCmd {

    /** initial */
    public static getInitial(): IInitialRes { return initial; }

    /** spin */
    public static getSpin(): ISpinRes { return spin; }
}