import { ScrollView, _decorator, Node, Enum, Size, Vec3, UITransform, Vec2, instantiate, v3, v2, ScrollBar, EventMouse } from "cc";
import { LayoutParam, LayoutType } from "../layout/LayoutDefines";
import { CellType, TableViewCell } from "./TableViewCell";

const { ccclass, property , menu} = _decorator;

interface UpdateIndices {
    from: number,
    to: number,
}

enum Direction {
    /**
     * @description 水平方向
     */
    HORIZONTAL,
    /**
     * @description 垂直方向
     * */
    VERTICAL
};

enum FillOrder {
    /**
     * @description 水平方向時，從左到右填充，垂直方向時，從上到下填充
     */
    TOP_DOWN,
    /**
     * @description 水平方向時，從右到左填充，垂直方向時，從下到上填充
     */
    BOTTOM_UP,
}

type CellResult = { isInSight: boolean, offset: number };

/**@description Cell資訊 */
class CellInfo {
    constructor(template: TableViewCell, view: TableView, offset: number, index: number) {
        this._templete = template;
        this._view = view;
        this.index = index;
        this.init(offset);
    }
    private _view: TableView = null!;
    private get isHorizontal() {
        return this._view.direction == Direction.HORIZONTAL;
    }
    private _templete: TableViewCell = null!;
    private get fillOrder() {
        return this._view.fillOrder;
    }
    /**@description 模板節點 */
    get node() {
        return this._templete.node;
    }
    private _offset: Vec2 = null!;
    /**@description 相對父親節點的偏移量 */
    get offset() {
        if (this.isHorizontal) {
            return this._offset.x;
        } else {
            return this._offset.y;
        }
    }

    private index = 0;

    /**@description 以自己錨點為中心有左邊距離 */
    left = 0;
    /**@description 以自己錨點為中心有右邊距離 */
    right = 0;
    /**@description 以自己錨點為中心有上邊距離 */
    top = 0;
    /**@description 以自己錨點為中心有下邊距離 */
    bottom = 0;

    private init(offset: number) {

        const trans = this.node.getComponent(UITransform)!;
        this.left = trans.width * trans.anchorX;
        this.right = trans.width * (1 - trans.anchorX);
        this.top = trans.height * (1 - trans.anchorY);
        this.bottom = trans.height * trans.anchorY;
        if (this.isHorizontal) {
            this._offset = v2(offset, 0);
        } else {
            this._offset = v2(0, offset);
        }
    }

    /**@description 節點位置 */
    position: Vec3 = v3(0, 0, 0);

    calculatePosition() {
        let result = this._align(this.node, this._view.content!, this._offset);
        this.position.x = result.x;
        this.position.y = result.y;
        return this.position;
    }

    clone() {
        let result = new CellInfo(this._templete, this._view, this.offset, this.index);
        result.position.x = this.position.x;
        result.position.y = this.position.y;
        return result;
    }


    /**
     * @description 根據當前填充方式及檢視方向設定Cell的對齊方式
     * @param node 
     * @param target 
     * @param offset 
     * @returns 
     */
    protected _align(node: Node, target: Node, offset: Vec2) {

        let layoutParam = new LayoutParam;
        layoutParam.node = node;
        layoutParam.target = target;
        if (this.isHorizontal) {
            //水平方向
            //居中對齊 y
            if (this.fillOrder == FillOrder.TOP_DOWN) {
                layoutParam.alignFlags = LayoutType.MID_LETF;
                layoutParam.left = offset.x;
            } else {
                layoutParam.alignFlags = LayoutType.MID_RIGHT;
                layoutParam.right = offset.x;
            }
        } else {
            //垂直方向
            //居中對齊 x
            if (this.fillOrder == FillOrder.TOP_DOWN) {
                //頂對齊 y
                layoutParam.alignFlags = LayoutType.CENTER_TOP;
                layoutParam.top = offset.y;
            } else {
                //底對齊 y
                layoutParam.alignFlags = LayoutType.CENTER_BOT;
                layoutParam.bottom = offset.y;
            }
        }

        App.layout.align(layoutParam);
        return layoutParam.result.position;
    }

    debug(began?: string, end?: string) {
        let str = `[${this.index}] 位置 : (${this.position.x},${this.position.y}) , 偏移 : ${this.offset} , 左 : ${this.left} , 右 : ${this.right} , 上 : ${this.top} , 下 : ${this.bottom} `;
        if (began) {
            str = began + str;
        }
        if (end) {
            str += end;
        }
        Log.d(str);
    }

    /**
     * @description 計算Cell距離view檢視(水平方向 : 左邊界,垂直方向 : 上邊界)的偏移量
     * */
    calculateSight(fillOrder: FillOrder, isHorizontal: boolean, vec: Vec2, viewSize: Size): CellResult {
        let result: CellResult = {
            isInSight: false,
            offset: 0
        };
        let trans = this.node.getComponent(UITransform)!;
        if (isHorizontal) {
            //水平方向
            if (fillOrder == FillOrder.TOP_DOWN) {
                let scaleX = this.node.scale.x;
                let x = this.position.x;
                if (scaleX < 0) {
                    x -= this.right;
                }
                //左對齊 計算超出view節點可顯示區域的寬度
                // Log.d(`vec : (${vec.x},${vec.y})`)
                let left = vec.x + x - this.left;
                if (left >= 0) {
                    if (left < viewSize.width) {
                        //自己最左還在檢視內，就處理可顯示區域內
                        // Log.d(`【可見】距離左邊 : ${left}`);
                        result.isInSight = true;
                    } else {
                        // Log.d(`【不可見】距離左邊 : ${left}`);
                    }
                } else {
                    let overLeft = trans.width + left;
                    if (overLeft > 0) {
                        // Log.d(`【可見】超出左邊界 : ${-left}`);
                        result.isInSight = true;
                    } else {
                        // Log.d(`【不可見】距離左邊 : ${overLeft}`);
                    }
                }
                result.offset = left;
            } else {
                let scaleX = this.node.scale.x;
                let x = this.position.x;
                if (scaleX < 0) {
                    x += this.left;
                }
                //左對齊 計算超出view節點可顯示區域的寬度
                // Log.d(`vec : (${vec.x},${vec.y})`)
                let left = vec.x + x - this.left;
                if (left > 0) {
                    if (left < viewSize.width) {
                        //自己最左還在檢視內，就處理可顯示區域內
                        // Log.d(`【可見】距離左邊 : ${left}`);
                        result.isInSight = true;
                    } else {
                        // Log.d(`【不可見】距離左邊 : ${left}`);
                    }
                } else {
                    let overLeft = trans.width + left;
                    if (overLeft > 0) {
                        // Log.d(`【可見】距離左邊 : ${left}`);
                        result.isInSight = true;
                    } else {
                        // Log.d(`【不可見】超出左邊界 : ${-overLeft + this.node.width}`);
                    }
                }
                result.offset = left;
            }
        } else {
            //垂直方向
            if (fillOrder == FillOrder.TOP_DOWN) {
                let scaleY = this.node.scale.y;
                let y = this.position.y;
                if (scaleY < 0) {
                    y += this.bottom;
                }
                //頂對齊 計算超出view節點可顯示區域的高度
                let top = vec.y + y + this.top;
                // Log.d(`top : ${top}`);
                if (top > 0) {
                    if (top > trans.height) {
                        // Log.d(`【不可見】超出上邊界 : ${top}`);
                    } else {
                        // Log.d(`【可見】超出上邊界 : ${top}`);
                        result.isInSight = true;
                    }
                } else {
                    if (viewSize.height + top < 0) {
                        // Log.d(`【不可見】超出下邊界 : ${top}`);
                    } else {
                        // Log.d(`【可見】距離頂部 : ${top}`);
                        result.isInSight = true;
                    }
                }
                result.offset = top;
            } else {
                let scaleY = this.node.scale.y;
                let y = this.position.y;
                if (scaleY < 0) {
                    y -= this.top;
                }
                //底對齊 計算超出view節點可顯示區域的高度
                let top = -(vec.y + y + this.top);
                // Log.d(`top : ${top}`);
                if (top >= 0) {
                    if (viewSize.height - top < 0) {
                        // Log.d(`【不可見】距離上邊界 : ${top}`);
                    } else {
                        // Log.d(`【可見】距離上邊界 : ${top}`);
                        result.isInSight = true;
                    }
                } else {
                    let overTop = -top;
                    if (overTop > trans.height) {
                        // Log.d(`【不可見】超出上邊界 : ${overTop}`);
                    } else {
                        // Log.d(`【可見】超出上邊界 : ${overTop}`);
                        result.isInSight = true;
                    }
                }
                result.offset = top;
            }
        }
        return result;
    }
}

export interface TableViewDelegate {

    /**
     * @description 獲取cell型別
     * @param view 
     * @param index 
     */
    tableCellTypeAtIndex(view: TableView, index: number): CellType;
    /**@description 返回當前TalbeView的總項數 */
    numberOfCellsInTableView(view: TableView): number;
    /**@description 更新cell資料 */
    updateCellData(view: TableView, cell: TableViewCell): void;
    /**@description 列表項進入複用 */
    tableCellWillRecycle?(view: TableView, cell: TableViewCell): void;
    /**@description 獲取資料 */
    tableData?(view: TableView): any[];
    /**@description 除錯資料用 */
    tableDebug?(view: TableView): void;
}

/**
 * @description 擴充套件TableView
 */

@ccclass("TableView")
@menu("QuickUI元件/TableView")
export default class TableView extends ScrollView {
    public static Direction = Direction;
    public static FillOrder = FillOrder;

    @property({
        override: true, displayOrder: 20,
        visible: function (this: TableView) {
            return this.direction == Direction.HORIZONTAL;
        }
    })
    get horizontalScrollBar() {
        return this._horizontalScrollBar;
    }
    set horizontalScrollBar(value: ScrollBar | null) {
        if (this._horizontalScrollBar === value) {
            return;
        }

        this._horizontalScrollBar = value;

        if (this._horizontalScrollBar) {
            this._horizontalScrollBar.setScrollView(this);
            this._updateScrollBar(Vec2.ZERO);
        }
    }

    @property({
        override: true, displayOrder: 21,
        visible: function (this: TableView) {
            return this.direction == Direction.VERTICAL;
        }
    })
    get verticalScrollBar() {
        return this._verticalScrollBar;
    }
    set verticalScrollBar(value: ScrollBar | null) {
        if (this._verticalScrollBar === value) {
            return;
        }

        this._verticalScrollBar = value;

        if (this._verticalScrollBar) {
            this._verticalScrollBar.setScrollView(this);
            this._updateScrollBar(Vec2.ZERO);
        }
    }

    @property({
        tooltip: "滾動方向 \nHORIZONTAL 水平方向 \nVERTICAL 垂直方向", displayName: "Direction", type: Enum(Direction), visible: true, displayOrder: 22
    })
    protected _direction: Direction = Direction.HORIZONTAL;
    /**@description 檢視滾動方向 */
    get direction() {
        return this._direction;
    }
    set direction(v) {
        if (this._direction == v) {
            return;
        }
        this._direction = v;
    }

    /**
     * @deprecated 不支援該方法，請使用direction替代
     */
    @property({ visible: false, override: true })
    public horizontal = true;

    /**
    * @deprecated 不支援該方法，請使用direction替代
    */
    @property({ visible: false, override: true })
    public vertical = true;

    @property({ tooltip: "Cell項模板", displayName: "Template", type: TableViewCell, visible: true, displayOrder: 23 })
    protected _template: TableViewCell[] = [];
    /**
     * @description 使用需要注意，設定模板時，要一次性設定，不要拿著當前模板操作 
     * @example 
     * let template = this.template;
     * template.push(template1)
     * template.push(template2)
     * template.push(template3)
     * this.template = template;
     * */
    get template() {
        return this._template;
    }
    set template(v) {
        this._template = v;
    }

    /**@description 模板大小 */
    protected _templateSize: Map<CellType, Size> = new Map();

    @property({ displayOrder: 24, tooltip: "填充方式 \nTOP_DOWN 水平方向時，從左到右填充，垂直方向時，從上到下填充 \nBOTTOM_UP 水平方向時，從右到左填充，垂直方向時，從下到上填充", type: Enum(FillOrder) })
    fillOrder: FillOrder = FillOrder.TOP_DOWN;

    protected _delegate: TableViewDelegate = null!;
    /**@description 代理 */
    get delegate() {
        if (!this._delegate) {
            Log.e(`【${this.name}】致命錯誤 : 未設定TableView代理`)
        }
        return this._delegate;
    }
    set delegate(v) {
        if (this._delegate === v) {
            return;
        }
        this._delegate = v;
    }

    /**@description 當前正在使用的cell */
    protected _cellsUsed: TableViewCell[] = [];
    /**@description 當前回收複製的cell */
    protected _cellsFreed: TableViewCell[] = [];
    /**@description 儲存Cell的資訊 */
    protected _cellsInfos: CellInfo[] = [];
    /**@description 當前渲染節點索引 */
    protected _indices: Set<number> = new Set();
    /**@description 新增或者刪除時，_cellsUsed並不是按index順序排序的，此時需要重新排序_cellsUsed */
    protected _isUsedCellsDirty = false;
    protected _oldDirection: Direction | null = null;
    /**@description 在插入或刪除時，會收到content的大小改變事件，從來呼叫重新整理，在操作插入刪除時，遮蔽掉 */
    protected _isDoing: boolean = false;

    /**@description 測試用 */
    protected _isShowAllCell = false;


    protected get viewSize() {
        let trans = this.view?.getComponent(UITransform);
        if (trans) {
            return trans.contentSize;
        }
        return Size.ZERO;
    }

    protected get viewAnchor() {
        let out = this.view?.anchorPoint;
        if (out) {
            return out;
        }
        return Vec2.ZERO;
    }

    protected get contentSize() {
        let trans = this.content?.getComponent(UITransform);
        if (trans) {
            return trans.contentSize;
        }
        return Size.ZERO;
    }

    protected get contentAnchor() {
        let trans = this.content?.getComponent(UITransform);
        if (trans) {
            return trans.anchorPoint;
        }
        return Vec2.ZERO;
    }

    /**@description 滾動到指定項 */
    scrollToIndex(index: number, timeInSecond = 0, attenuated = true) {
        if (!this.content) {
            return;
        }
        if (!(index >= 0 && index < this.delegate.numberOfCellsInTableView(this))) {
            Log.e(`錯誤的index : ${index}`)
            return;
        }
        // Log.d(`滾動到 : ${index}`);
        let offset = this.getScrollOffset();
        let info = this._cellsInfos[index]
        // Log.d(`offset : (${offset.x},${offset.y})`)
        if (this.fillOrder == FillOrder.TOP_DOWN) {
            if (this.direction == Direction.HORIZONTAL) {
                offset.x = info.offset;
            } else {
                offset.y = info.offset;
            }
        } else {
            let next = this._cellsInfos[index + 1];
            if (this.direction == Direction.HORIZONTAL) {
                offset.x = this.contentSize.width - next.offset;
            } else {
                offset.y = this.contentSize.height - next.offset;
            }
        }

        this.scrollToOffset(offset, timeInSecond, attenuated);
    }

    /**
     * @description 更新指定項
     * @param index 
     */
    updateCellAtIndex(index: number) {
        let count = this.delegate.numberOfCellsInTableView(this);
        if (!(count > 0 && index < count && index >= 0)) {
            return;
        }
        let cell = this.cellAtIndex(index);
        if (cell) {
            //先移除舊的
            this._moveCellOutOfSight(cell);
        }
        //獲取cell型別
        let type = this.delegate.tableCellTypeAtIndex(this, index);
        //獲取是否有可複用的節點
        cell = this._dequeueCell(type);
        if (!cell) {
            //如果有可複用的，直接重新整理
            let template = this._getTemplete(type);
            if (!template) {
                return;
            }
            let node = instantiate(template.node);
            cell = node.getComponent(TableViewCell);
        }
        if (!cell) {
            return;
        }
        this._setIndexForCell(index, cell);
        this._addCellIfNecessary(cell);
        cell.init();
        this._updateCellData(cell);
    }

    /**
     * @description 插入項，預設為插入到最後,資料先插入才能呼叫，注意：注入時，需要資料項先更新資料
     * 如果是最後插入時，應該返回已經插入資料項的length-1,即最後一個數據項的下標索引
     * @param index 
     */
    insertCellAtIndex(index?: number) {
        let count = this.delegate.numberOfCellsInTableView(this);
        if (count == 0) {
            return;
        }
        if (index == undefined || index == null) {
            index = count - 1;
        }
        if (index > count - 1) {
            return;
        }
        this._isDoing = true;
        let offset = this.getScrollOffset();
        this._updateCellOffsets();
        this._updateContentSize();

        let cell = this.cellAtIndex(index);
        if (cell) {
            Log.d(`插入的Cell[${index}]在顯示區域內`)
            let start = this._getCellIndex(cell);
            this._moveCellIndex(start);
        } else {
            Log.d(`插入的Cell${index}不在顯示區域內,更新顯示區域內的索引`);
            this._moveCellIndex(index);
        }

        let type = this.delegate.tableCellTypeAtIndex(this, index);
        let newCell = this._dequeueCell(type);
        if (!newCell) {
            let template = this._getTemplete(type);
            if (!template) {
                return;
            }
            let node = instantiate(template.node);
            newCell = node.getComponent(TableViewCell);
        }
        if (!newCell) {
            return;
        }
        this._setIndexForCell(index, newCell);
        this._addCellIfNecessary(newCell);
        newCell.init();
        this._updateCellData(newCell);
        this._isDoing = false;
        this._calculateSightArea();
        this.scrollToOffset(offset);
    }

    /**
     * @description 刪除指定項
     * @param index 
     * @description 通知刪除資料，在些回撥用刪除資料來源
     */
    removeCellAtIndex(index: number, deleteDataFunc: (index: number) => void) {
        let count = this.delegate.numberOfCellsInTableView(this);
        if (!(count > 0 && index >= 0 && index < count)) {
            return;
        }
        let offset = this.getScrollOffset();
        //先從顯示區域內獲得該節點

        //通知刪除資料
        deleteDataFunc(index);
        this._isDoing = true;

        this._updateCellOffsets();
        this._updateContentSize();
        this._moveCellIndex(index, true);
        this._isDoing = false;
        this._calculateSightArea();
        this.scrollToOffset(offset);
    }

    /**
     * @description 重置資料
     */
    reloadData(isResePosition = true) {
        if (isResePosition) {
            this._oldDirection = null;
        } else {
            this._oldDirection = this.direction;
        }

        //刪除當前渲染的cell
        for (let i = 0; i < this._cellsUsed.length; i++) {
            let cell = this._cellsUsed[i];
            if (this.delegate.tableCellWillRecycle) {
                this.delegate.tableCellWillRecycle(this, cell);
            }
            this._cellsFreed.push(cell);
            cell.reset();
            if (cell.node.parent == this.content) {
                this.content?.removeChild(cell.node);
            }
        }

        //清空渲染節點索引
        this._indices.clear();
        //清空當前使用的節點
        this._cellsUsed = [];
        this._isDoing = true;
        //重新整理節點的位置
        this._updateCellOffsets();
        this._updateContentSize();
        this._isDoing = false;
        this._calculateSightArea();
        if (this._oldDirection != this.direction) {
            if (this.delegate.numberOfCellsInTableView(this) > 0) {
                if (this.direction == Direction.HORIZONTAL) {
                    this.scrollToLeft();
                } else {
                    this.scrollToTop();
                }
            }
            this._oldDirection = this.direction;
        }
    }


    /**
     * @description 返回指定位置的cell,注意：只會從當前顯示節點中返回，如果沒有在顯示，會返回null
     * @param index 
     * @returns 
     */
    cellAtIndex(index: number): TableViewCell | null {
        if (this._indices.has(index)) {
            for (let i = 0; i < this._cellsUsed.length; i++) {
                if (this._cellsUsed[i].index == index) {
                    return this._cellsUsed[i];
                }
            }
        }
        return null;
    }

    /**
     * @description 更新Cell顯示索引
     * @param data 
     */
    private _updateCellIndices(data: UpdateIndices[]) {
        let origin: number[] = [];
        this._indices.forEach((v, v2, set) => {
            origin.push(v);
        });

        if (origin.length <= 0) {
            return;
        }

        this._indices.clear();
        for (let i = 0; i < origin.length; i++) {
            let changeData = data.find((v) => {
                if (v.from == origin[i]) {
                    return true;
                }
                return false;
            })
            if (changeData) {
                origin[i] = changeData.to;
            }
            this._indices.add(origin[i]);
        }
    }

    /**
     * @description 移動cell的incdex
     * @param start 開始位置
     * @param isDelete 是否是刪除 預設為false
     */
    private _moveCellIndex(start: number, isDelete = false) {
        let update: UpdateIndices[] = [];
        let offset = isDelete ? -1 : 1;
        if (isDelete) {
            let deleteCellIndex = this._cellsUsed.findIndex((v, index, arr) => {
                if (v.index == start) {
                    return true;
                }
                return false;
            })
            if (deleteCellIndex != -1) {
                this._moveCellOutOfSight(this._cellsUsed[deleteCellIndex]);
            }
        }
        for (let i = 0; i < this._cellsUsed.length; i++) {
            let temp = this._cellsUsed[i];
            if (temp.index >= start) {
                if (isDelete && temp.index == start) {
                    continue;
                }
                let from = temp.index;
                let to = temp.index + offset;
                this._setIndexForCell(to, temp);
                this._updateCellData(temp);
                update.push({ from: from, to: to });
            } else {
                //區域外的，需要更新位置
                this._updateCellPosition(temp);
            }
        }
        //更新當前顯示的索引
        this._updateCellIndices(update);
    }

    /**
     * @description 按index的升序排序
     */
    private _sortCell() {
        this._cellsUsed = this._cellsUsed.sort((a, b) => {
            return a.index - b.index;
        });
    }

    private _debugCellInfos(title: string) {
        Log.d(`--------------------- ${title} ---------------------`);
        this._cellsInfos.forEach(v => {
            v.debug();
        })
    }

    private _debugCell(title: string) {
        Log.d(`--------------------- ${title} ---------------------`);
        Log.d(`當前顯示節點 :`, this._indices);

        this._cellsUsed.forEach((v, index, array) => {
            Log.d(`[${index}] , type : ${v.type} ,index : ${v.index} , ${(v as any).string} , position : (${v.node.position.x},${v.node.position.y})`);
        })
    }

    private _getCellIndex(cell: TableViewCell): number {
        for (let i = 0; i < this._cellsUsed.length; i++) {
            if (this._cellsUsed[i] === cell) {
                return this._cellsUsed[i].index;
            }
        }
        return -1;
    }

    private _debugData() {
        if (this.delegate && this.delegate.tableDebug) {
            this.delegate.tableDebug(this);
        }
    }

    protected _updateCellData(cell: TableViewCell) {
        // Log.d(`通知更新Cell[${cell.index}]項`);
        this.delegate.updateCellData(this, cell);
    }

    /**@description 更新Cell位置 */
    protected _updateCellPosition(cell: TableViewCell) {
        let info = this._cellsInfos[cell.index];
        cell.node.setPosition(info.position)
    }

    protected _addCellIfNecessary(cell: TableViewCell) {
        if (cell.node.parent != this.content) {
            this.content?.addChild(cell.node);
        } else {
            Log.e(`新增的Cell 已經有父節點`);
        }
        this._cellsUsed.push(cell);
        this._indices.add(cell.index);
        this._isUsedCellsDirty = true;
    }

    protected _setIndexForCell(index: number, cell: TableViewCell) {
        cell.view = this;
        cell.index = index;
        cell.node.active = true;
        let info = this._cellsInfos[index];
        cell.node.setPosition(info.position);
    }

    /**
    * @description 返回當前可重用節點
    * @param type 指定型別獲取
    * @returns 
    */
    protected _dequeueCell(type: CellType): TableViewCell | null {
        let cell: TableViewCell | null = null;
        if (this._cellsFreed.length <= 0) {
            return cell;
        }
        for (let i = 0; i < this._cellsFreed.length; i++) {
            let v = this._cellsFreed[i];
            if (v.type == type) {
                this._cellsFreed.splice(i, 1);
                return v;
            }
        }
        return cell;
    }

    /**
     * @description 更新Cell位置偏移
     * @param isUpdatePosition 預設為true
     */
    protected _updateCellOffsets() {
        let count = this.delegate.numberOfCellsInTableView(this);
        this._cellsInfos = [];
        if (count > 0) {
            let cur = 0;
            let size = { width: 0, height: 0 };
            let type: CellType;
            let i = 0;
            let cell: TableViewCell = null!;
            for (i = 0; i < count; i++) {
                type = this.delegate.tableCellTypeAtIndex(this, i);
                cell = this._getTemplete(type)!;
                let info = new CellInfo(cell, this, cur, i);
                this._cellsInfos.push(info);
                let trans = cell.node.getComponent(UITransform)!;
                size.width = trans.width;
                size.height = trans.height;
                if (this.direction == Direction.HORIZONTAL) {
                    //水平
                    cur += size.width;
                } else {
                    cur += size.height;
                }
            }
            //最後一項
            let info = new CellInfo(cell, this, cur, i);
            this._cellsInfos.push(info);
        }
    }

    /**@description 更新Cell位置資料 */
    protected _updateCellPositions() {
        this._cellsInfos.forEach(v => {
            v.calculatePosition();
        })
    }

    /**
     * @description 更新content的大小
     */
    protected _updateContentSize() {
        let size = new Size(0, 0);
        let count = this.delegate.numberOfCellsInTableView(this);
        if (count > 0) {
            let maxPos = this._cellsInfos[count].offset;
            if (this.direction == Direction.HORIZONTAL) {
                size = new Size(maxPos, this.viewSize.height);
            } else {
                size = new Size(this.viewSize.width, maxPos);
            }
        }
        if (this.content) {
            let trans = this.content.getComponent(UITransform)!;
            trans.setContentSize(size);
        }
        this._updateCellPositions();
    }

    /**
     * @description 計算顯示區域
     * @returns 
     */
    protected _calculateSightArea() {
        if (!this.content) {
            return;
        }

        if (this._isDoing) {
            return;
        }
        //計算開始點結束點
        let _offset = this.content.position;
        let offset = new Vec2(_offset.x, _offset.y);
        let contentSize = this.contentSize;
        let contentAnchor = this.contentAnchor;
        let viewSize = this.viewSize;
        let viewAnchor = this.viewAnchor;

        let contentBottom = -contentAnchor.y * contentSize.height;
        let viewBottom = -viewAnchor.y * viewSize.height;
        let viewLeft = viewAnchor.x * viewSize.width;

        contentBottom = offset.y + contentBottom;

        let vec: Vec2 = null!;
        if (this.direction == Direction.HORIZONTAL) {
            vec = v2(viewLeft, offset.y).add(offset);
        } else {
            vec = v2(offset.x, viewBottom).add(offset);
        }
        // 要先排序，才能進行計算
        if (this._isUsedCellsDirty) {
            this._sortCell();
        }

        let maxId = Math.max(this.delegate.numberOfCellsInTableView(this) - 1, 0);

        let result = this._calculateInInSight(vec);
        if (result) {
            //移除start之前的不可顯示節點
            if (this._cellsUsed.length > 0) {
                let cell = this._cellsUsed[0];
                let idx = cell.index;
                while (idx < result.start) {
                    this._moveCellOutOfSight(cell);
                    if (this._cellsUsed.length > 0) {
                        cell = this._cellsUsed[0];
                        idx = cell.index;
                    } else {
                        break;
                    }
                }
            }

            //移除end之後的不可顯示節點
            if (this._cellsUsed.length > 0) {
                let cell = this._cellsUsed[this._cellsUsed.length - 1];
                let idx = cell.index;
                while (idx <= maxId && idx > result.end) {
                    this._moveCellOutOfSight(cell);
                    if (this._cellsUsed.length > 0) {
                        cell = this._cellsUsed[this._cellsUsed.length - 1];
                        idx = cell.index;
                    } else {
                        break;
                    }
                }
            }

            //更新顯示項
            for (let i = result.start; i <= result.end; i++) {
                //正在顯示的，跳過更新
                if (this._indices.has(i)) {
                    // Log.d(`Cell[${i}]項已經顯示，跳過更新`);
                    continue;
                }
                this.updateCellAtIndex(i);
            }
        }
    }



    protected _getTemplete(type: CellType) {
        for (let i = 0; i < this.template.length; i++) {
            let v = this.template[i];
            if (v.type == type) {
                return this.template[i];
            }
        }
        return null;
    }

    protected _moveCellOutOfSight(cell: TableViewCell) {
        if (this.delegate && this.delegate.tableCellWillRecycle) {
            this.delegate.tableCellWillRecycle(this, cell);
        }
        // Log.d(`移除Cell ${cell.index}`);
        this._cellsFreed.push(cell);
        let index = this._cellsUsed.indexOf(cell);
        if (index != -1) {
            this._cellsUsed.splice(index, 1);
        }
        this._indices.delete(cell.index);
        cell.reset();
        if (cell.node.parent == this.content) {
            this.content?.removeChild(cell.node);
        }
        this._isUsedCellsDirty = true;
    }

    /**
     * @description 計算當前可見Cell (二分查詢，速度快點)
     * */
    protected _calculateInInSight(offset: Vec2): { start: number, end: number, count: number } | null {
        let result: { start: number, end: number, count: number } | null = null;
        if (this._cellsInfos.length <= 0) {
            return result;
        }
        let count = this.delegate.numberOfCellsInTableView(this);
        if (count <= 0) {
            return result;
        }
        result = { start: 0, end: 0, count: count };
        if (this._isShowAllCell) {
            result.start = 0;
            result.end = count - 1;
            return result;
        }
        if (count == 1) {
            return result;
        }
        let low = 0;
        let high = count;
        let viewSize = this.viewSize;
        let search: number = -1;
        let index = 0;
        while (high >= low) {
            index = Math.floor(low + (high - low) / 2);
            if (index < 0 || index >= this._cellsInfos.length) {
                return null;
            }
            let cellStart = this._cellsInfos[index];
            let startResult = cellStart.calculateSight(this.fillOrder, this.direction == Direction.HORIZONTAL, offset, viewSize);
            if (startResult.isInSight) {
                search = index;
                break;
            }
            if (index + 1 < 0 || index + 1 >= this._cellsInfos.length) {
                return null;
            }
            let cellEnd = this._cellsInfos[index + 1];
            let endResult = cellEnd.calculateSight(this.fillOrder, this.direction == Direction.HORIZONTAL, offset, viewSize);
            if (endResult.isInSight) {
                search = index;
                break;
            }
            //都沒有找到，向偏移為0的靠攏
            if (Math.abs(startResult.offset) < Math.abs(endResult.offset)) {
                high = index - 1;
            } else {
                low = index + 1;
            }
        }

        if (search < 0) {
            return null;
        }

        result.start = search;
        result.end = search;
        //向前找出可顯示Cell
        for (let i = search - 1; i >= 0; i--) {
            let cell = this._cellsInfos[i];
            let temp = cell.calculateSight(this.fillOrder, this.direction == Direction.HORIZONTAL, offset, viewSize);
            if (temp.isInSight) {
                result.start = i;
            } else {
                break;
            }
        }


        //向後找出可顯示Cell
        for (let i = search + 1; i < count; i++) {
            let cell = this._cellsInfos[i];
            let temp = cell.calculateSight(this.fillOrder, this.direction == Direction.HORIZONTAL, offset, viewSize);
            if (temp.isInSight) {
                result.end = i;
            } else {
                break;
            }
        }

        // Log.d(`可顯示節點 : ${result.start} -> ${result.end}`);

        return result;
    }

    /**
     * @description 不支援該方法
     */
    scrollToTopLeft(timeInSecond?: number, attenuated?: boolean): void {
        Log.w(`不支援該方法`);
    }

    /**
     * @description 不支援該方法
     */
    scrollToTopRight(timeInSecond?: number, attenuated?: boolean): void {
        Log.w(`不支援該方法`);
    }

    /**
     * @deprecated 不支援該方法
     */
    scrollToBottomLeft(timeInSecond?: number, attenuated?: boolean): void {
        Log.w(`不支援該方法`);
    }

    /**
     * @description 不支援該方法
     */
    scrollToBottomRight(timeInSecond?: number, attenuated?: boolean): void {
        Log.w(`不支援該方法`);
    }

    protected _onMouseWheel(event: EventMouse, captureListeners?: Node[]) {
        if (!this.enabledInHierarchy) {
            return;
        }

        if (this._hasNestedViewGroup(event, captureListeners)) {
            return;
        }

        const deltaMove = new Vec3();
        const wheelPrecision = -0.1;
        const scrollY = event.getScrollY();
        if (this.direction == Direction.VERTICAL) {
            deltaMove.set(0, scrollY * wheelPrecision, 0);
        } else {
            deltaMove.set(scrollY * wheelPrecision, 0, 0);
        }

        this._mouseWheelEventElapsedTime = 0;
        this._processDeltaMove(deltaMove);

        if (!this._stopMouseWheel) {
            this._handlePressLogic();
            this.schedule(this._checkMouseWheel, 1.0 / 60, NaN, 0);
            this._stopMouseWheel = true;
        }

        this._stopPropagationIfTargetIsMe(event);
    }

    protected _flattenVectorByDirection(vector: Vec3) {
        const result = vector;
        result.x = this.direction == Direction.HORIZONTAL ? result.x : 0;
        result.y = this.direction == Direction.VERTICAL ? result.y : 0;
        return result;
    }

    /**
    * @description 重寫ScrollView的私有方法
    * @param position 
    * @returns 
    */
    private _setContentPosition(position: Vec3) {
        if (!this._content) {
            return;
        }
        const contentPos = this.content?.getPosition()!;
        if (Math.abs(position.x - contentPos.x) < this.getScrollEndedEventTiming() && Math.abs(position.y - contentPos.y) < this.getScrollEndedEventTiming()) {
            return;
        }

        this._content.setPosition(position);
        this._calculateSightArea();
        this._outOfBoundaryAmountDirty = true;
    }
}
