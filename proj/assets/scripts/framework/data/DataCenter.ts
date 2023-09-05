import { SingletonT } from "../utils/SingletonT";
import { GameData } from "./GameData";

export class DataCenter extends SingletonT<GameData> implements ISingleton {
    static module: string = "【資料中心】";
    module: string = null!;
}

