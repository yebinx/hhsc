import CHandler from "../../../core/datastruct/CHandler";
import { isNil } from "../../../core/Globals";
import logger from "../../../core/logger";
import { CompScrollView } from "../comps/CompScrollView";
import {CpnListCell} from "./CpnListCell";
import { Component, Node, Size, Layout, ScrollView, UITransform, Vec3, v3, _decorator, size, v2 } from "cc";


var math_floor = Math.floor;
var math_ceil = Math.ceil;

enum DirTypeEnum {
	h,
	v,
}

const {ccclass, property} = _decorator;

@ccclass('CpnList')
export class CpnList extends Component {
	protected _direction = DirTypeEnum.v;
	protected _itemW:number = 0;
	protected _itemH:number = 0;
	protected _spaceX:number = 0;
	protected _spaceY:number = 0;

	protected _selectedIndex:number = -1;
	protected _selectListener:CHandler = null;

	protected _preTop = -1;
	protected _preBottom = -1;
	protected _unseeables:Array<Node> = [];
	protected _items:Array<Node> = [];
	protected _dataList:Array<any> = null;

	protected _createFunc:()=>Node = null;
	protected _idGettor:(data:any)=>any = null;
	scrollNode:Node = null;

	onLoad() {
		if(this.node.getComponent(Layout)) {
            this.node.removeComponent(Layout);
        }
	}

	getScrollView() : ScrollView {
		return this.scrollNode.getComponent(ScrollView);
	}

	getComScrollView() : CompScrollView {
		return this.scrollNode.getComponent(CompScrollView);
	}

	config(space:number, scrollNode:Node) : CpnList {
		this._spaceX = space;
		this._spaceY = space;
		this.scrollNode = scrollNode;

		if(this.node.getComponent(Layout)) {
            this.node.removeComponent(Layout);
			this.scheduleOnce(function(dt){
				this.fixSize();
				this.onPosChanged();
			}.bind(this), 0);
        }

		if(this.scrollNode.getComponent(ScrollView).vertical) {
			this._direction = DirTypeEnum.v;
			this.node.getComponent(UITransform).anchorY = 1;
			this.node.parent.getComponent(UITransform).anchorY = 1;
			this.scrollNode.getComponent(ScrollView).stopAutoScroll();
			//this.node.y = 0;
		} else {
			this._direction = DirTypeEnum.h;
			this.node.getComponent(UITransform).anchorX = 0;
			this.node.parent.getComponent(UITransform).anchorX = 0;
			this.scrollNode.getComponent(ScrollView).stopAutoScroll();
			//this.node.x = 0;
		}

		scrollNode.off("scrolling", this.onPosChanged, this);
		scrollNode.on("scrolling", this.onPosChanged, this);

		return this;
	}

	setCreateFunc(func:()=>Node, sz?:Size) : CpnList {
        this._createFunc = func;
        
        if(sz) {
            this._itemW = sz.width;
            this._itemH = sz.height;
        }

        return this;
    }

	setSelectListener(func: (cellCpn:CpnListCell, listCpn:CpnList, bSelected:boolean)=>void, thisObj:any) : CpnList {
		this._selectListener = new CHandler(thisObj, func);
		return this;
	}

	setIdGettor(func:(data:any)=>any) : CpnList {
		this._idGettor = func;
		return this;
	}

	getDataId(data:any):any {
		if(this._idGettor) {
			return this._idGettor(data);
		}
		return null;
	}

	dataLen():number {
		return this._dataList && this._dataList.length || 0;
	}

	setData(datalist:Array<any>) {
		var oldLen = this._dataList && this._dataList.length || 0;
		this._dataList = datalist;
		var nowLen = this._dataList && this._dataList.length || 0;

		for(var i=this._preTop; i<=this._preBottom; i++) {
			this.onUnseeable(this._items[i], i);
		}
		this._preTop = -1;
		this._preBottom = -1;

		if(nowLen < oldLen) {
			this.scrollNode.getComponent(ScrollView).stopAutoScroll();
			if(this._direction==DirTypeEnum.v) {
				let pos = this.node.position;
				this.node.setPosition(v3(pos.x, 0));
			} else {
				let pos = this.node.position;
				this.node.setPosition(v3(0, pos.y));
			}
		}
		this.fixSize();
		if(nowLen < oldLen) {
			this.scrollNode.getComponent(ScrollView).stopAutoScroll();
			if(this._direction==DirTypeEnum.v) {
				let pos = this.node.position;
				this.node.setPosition(v3(pos.x, 0));
			} else {
				let pos = this.node.position;
				this.node.setPosition(v3(0, pos.y));
			}
		}
		this.onPosChanged();
	}

	addData(data:any) {
		if(isNil(this._dataList)) {
			this._dataList = [];
		}
		this._dataList[this._dataList.length] = data;
		this.fixSize();
		this.onPosChanged();
	}

	updateData(idx:number, data:any) {
		if(isNil(this._dataList)) {
			this._dataList = [];
		}
		this._dataList[idx] = data;
		this.updateItem(idx);
	}

	delData(filterFunc:(data:any)=>boolean, delCnt:number=-1) {
		let bFinded = false;
		for(var i=this._dataList.length-1; i>=0; i--) {
			if(filterFunc(this._dataList[i])) {
				bFinded = true;
				this._dataList.splice(i, 1);
				if(this._items[i]) {
					this.onUnseeable(this._items[i], i);
				}
				if(this._selectedIndex == i) {
					this._selectedIndex++;
					if(this._selectedIndex>=this._dataList.length) {
						this._selectedIndex = this._dataList.length-1;
					}
				}
				delCnt--;
				if(delCnt===0) {
					break;
				}
			}
		}

		if(bFinded) {
			this.setData(this._dataList);
		}
	}

	private _selectChecker:(data:any)=>boolean = null;
	setSelectChecker(checkFun:(data:any)=>boolean) {
		this._selectChecker = checkFun;
	}

	private canSelect(idx:number) {
		if(idx < 0) { return true; }
		if(this._selectChecker && !this._selectChecker(this._dataList[idx])) {
			return false;
		}
		return true;
	}

	setSelectedIndex(idx:number) {
		if(!this.canSelect(idx)) {
			return;
		}

		if(this._selectedIndex>=0) {
			this.onSelect(this._items[this._selectedIndex], false, this._dataList[this._selectedIndex]);
		}

		this._selectedIndex = idx;

		if(this._selectedIndex>=0) {
			this.onSelect(this._items[this._selectedIndex], true, this._dataList[this._selectedIndex]);
		}
	}

	setSelectedId(id:any) {
		this.setSelectedIndex(this.getDataIndexById(id));
	}

	getSelectedId() : any {
		if(this._selectedIndex < 0) { return null; }
		return this.getDataId(this._dataList[this._selectedIndex]);
	}

	getSelectedIndex() : number {
		return this._selectedIndex;
	}

	getDataIndexById(id:any) : number {
		for(var idx=this._dataList.length-1; idx>=0; idx--) {
			if(this.getDataId(this._dataList[idx]) === id) {
				return idx;
			}
		}
		return -1;
	}

	scrollToSelected() {
		if(this._direction == DirTypeEnum.v) {
			this.scheduleOnce(()=>{
				if(this._selectedIndex < 0) { return; }
				this.scrollNode.getComponent(ScrollView).stopAutoScroll();
				let pos = -this.calItemPos(this._selectedIndex) - this._itemH/2;
				this.scrollNode.getComponent(ScrollView).scrollToOffset(v2(0, pos));
				this.setData(this._dataList);
			}, 0.03);
		} else {
			this.scheduleOnce(()=>{
				if(this._selectedIndex < 0) { return; }
				this.scrollNode.getComponent(ScrollView).stopAutoScroll();
				let pos = -this.calItemPos(this._selectedIndex) + this._itemH/2;
				this.scrollNode.getComponent(ScrollView).scrollToOffset(v2(pos, 0));
				this.setData(this._dataList);
			}, 0.03);
		}
	}

	//----------------------------------------------------------------

	private getItemLocgic(item:Node) : CpnListCell {
        return item.getComponent(CpnListCell);
    }

	private onSelect(item:Node, bSelected:boolean, data:any) {
		if(item) {
            this.getItemLocgic(item).onSelect(this, bSelected);
			if(this._selectListener) {
				this._selectListener.invokeWithExtra(this.getItemLocgic(item), this, bSelected);
			}
		}
	}

	updateItem(idx) {
		if(this._items[idx]) {
		    //	cc.log("update", idx);
            let item = this._items[idx];
            let cellItem = this.getItemLocgic(item);
            cellItem.setIndex(idx);
            cellItem.setData(this._dataList[idx]);
            cellItem.doUpdate(this, this._dataList[idx], idx);
            this.onSelect(item, idx==this._selectedIndex && this.canSelect(idx), this._dataList[idx]);
		}
	}

	private createItem(idx:number) : boolean {
		if(idx<0 || isNil(this._dataList) || idx >= this._dataList.length){
			logger.log("createItem fial:", idx, this._dataList && this._dataList.length);
			return false;
		}
		var needUpdate = false;
		if(!this._items[idx]) {
			needUpdate = true;
			if(this._unseeables.length > 0) {
				this._items[idx] = this._unseeables.splice(this._unseeables.length-1, 1)[0];
			} else {
				this._items[idx] = this._createFunc();
				this.node.addChild(this._items[idx]);
				this.getItemLocgic(this._items[idx]).doInit(this);
			}
			if(this._itemH === 0) {
				this._itemW = this._items[idx].getComponent(UITransform).width;
				this._itemH = this._items[idx].getComponent(UITransform).height;
				this.fixSize();
			}
		}
		this._items[idx].active = true;
		if(this._direction == DirTypeEnum.v) {
			let pos = this._items[idx].position;
			this._items[idx].setPosition(v3(pos.x, this.calItemPos(idx)));
		} else {
			let pos = this._items[idx].position;
			this._items[idx].setPosition(v3(this.calItemPos(idx), pos.y));
		}
		return needUpdate;
	}

	private onUnseeable(item:Node, idx:number) {
	//	logger.log("hide", idx);
		if(!isNil(item)) {
			this._unseeables.push(item);
			item.active = false;
		}
		if(idx>=0){
			this._items[idx] = null;
		}
	}

	private onPosChanged() {
		var topIdx = this.getMinIndex();
		var bottomIdx = topIdx + this.getSeeableCount();
		var dataLen = this._dataList && this._dataList.length || 0;
		if(bottomIdx >= dataLen){ bottomIdx = dataLen-1; }
		//if(bottomIdx<0){ bottomIdx = 0; }
		//logger.log(this.getSeeableCount(), this.node.children.length, "pre", this.preTop, this.preBottom, "now", topIdx, bottomIdx);
		if(this._preTop != topIdx || this._preBottom != bottomIdx) {
			for(var ii = this._preTop; ii < topIdx; ii++) {
				this.onUnseeable(this._items[ii], ii);
			}
			for(var jj = bottomIdx+1; jj<=this._preBottom; jj++) {
				this.onUnseeable(this._items[jj], jj);
			}

			this._preTop = topIdx;
			this._preBottom = bottomIdx;
			for(var i=topIdx; i<=bottomIdx; i++) {
				if(this.createItem(i)) {
					this.updateItem(i);
				}
			}
		}
	}

	private calItemPos(idx:number) : number {
		if(this._direction == DirTypeEnum.v) {
			return -this._itemH/2 - idx*(this._itemH+this._spaceY);
		} else {
			return this._itemW/2 + idx*(this._itemW+this._spaceX);
		}
	}

	private getMinIndex() : number {
		if(this._direction == DirTypeEnum.v) {
			var idx = (this.node.position.y) / (this._itemH+this._spaceY);
			if(idx < 0) { idx = 0; }
			return math_floor(idx);
		} else {
			var idx = (-this.node.position.x) / (this._itemW+this._spaceX);
			if(idx < 0) { idx = 0; }
			return math_floor(idx);
		}
	}

	private getSeeableCount() : number {
		if(this._direction == DirTypeEnum.v) {
			return math_ceil(this.node.parent.getComponent(UITransform).height / (this._itemH+this._spaceY)) + 1;
		} else {
			return math_ceil(this.node.parent.getComponent(UITransform).width / (this._itemW+this._spaceX)) + 1;
		}
	}

	private fixSize() {
		var len = this._dataList && this._dataList.length || 0;
		if(this._direction == DirTypeEnum.v) {
			var h = this._itemH * len + (len-1) * this._spaceY;
			this.node.getComponent(UITransform).height = Math.max(h, 0);
		} else {
			var w = this._itemW * len + (len-1) * this._spaceX;
			this.node.getComponent(UITransform).width = Math.max(w, 0);
		}
	}

}
