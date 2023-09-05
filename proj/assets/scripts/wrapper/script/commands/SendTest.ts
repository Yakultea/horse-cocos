import PlatformModel from "../model/PlatformModel";
import SlotTableModel from "../model/SlotTableModel";
import { IGetSlotTablesVO, WrapperSender, IUpdateSlotTableVO, IBetRecordsVO } from "../net/WrapperSender";

export default class SendTest {
    
    public static getBetRecords() {
        const data: IBetRecordsVO = {
            rows: 16
        };
        App.senderManager.get(WrapperSender).getBetRecords(data);
    }

    public static getBetRecordsForLt() {
        const data: IBetRecordsVO = {
            lt: 0, // 自行帶資料
            rows: 16
        };
        App.senderManager.get(WrapperSender).getBetRecords(data);
    }

    /** 取得房間列表 */
    public static getSlotTables() {
        App.senderManager.get(WrapperSender).getSlotTables();
    }

    /** 取得指定房間 */
    public static getSlotTablesByRoomId() {
        const data: IGetSlotTablesVO = {
            roomId: PlatformModel.getData().table.roomId
        };
        App.senderManager.get(WrapperSender).getSlotTables(data);
    }

    public static updateSlotTable() {
        const data: IUpdateSlotTableVO = {
            table: SlotTableModel.getData()
        };
        App.senderManager.get(WrapperSender).updateSlotTable(data);
    }
}