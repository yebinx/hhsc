//无限列表网格
import { Component, Node, Size, Layout, ScrollView, UITransform, Vec3, v3, _decorator, size } from "cc";
import { CpnGridCell } from "./CpnGridCell";
import CHandler from "../../../core/datastruct/CHandler";
import { isNil } from "../../../core/Globals";
import logger from "../../../core/logger";


var math_floor = Math.floor;
var math_ceil = Math.ceil;

enum DirTypeEnum {
	h,
	v,
}

const { ccclass, property } = _decorator;

@ccclass('CpnGridEx')
export class CpnGridEx extends Component {
    private _inited:boolean = false;
    protected _direction:DirTypeEnum = DirTypeEnum.v;
    protected _r:number = 1;  //行数
    protected _c:number = 1;  //列数
    protected _spaceX:number = 0;
    protected _spaceY:number = 0;
    protected _cellSize: Size = null;
    protected _content:Node = null;
    protected _scrollNode:Node = null;
    protected _minParentY:number = 0;
    protected _maxParentY:number = 0;
    protected _minParentX:number = 0;
    protected _maxParentX:number = 0;
    protected _minSeeableR:number = -1;
    protected _maxSeeableR:number = -1;
    protected _minSeeableC:number = -1;
    protected _maxSeeableC:number = -1;
    protected _maxRowCount:number = 1;    //可见行数
    protected _maxColCount:number = 1;    //可见列数

    protected _unseeables:Array<Node> = [];
	protected _items:Array<Node> = [];
	protected _dataList:Array<any> = null;

    protected _createFunc:()=>Node = null;
	protected _idGettor:(data:any)=>any = null;

	protected _selectedIndex:number = -1;
	protected _selectListener:CHandler = null;

    onLoad() {
        if(this.node.getComponent(Layout)) {
            this.node.removeComponent(Layout);
			this.scheduleOnce(function(dt){
				this.doLayout();
			}.bind(this), 0);
        }
    }

    getScrollView() : ScrollView {
		return this._scrollNode.getComponent(ScrollView);
	}

    config(r:number, c:number, space:number, scrollNode:Node) {
        if(scrollNode.getComponent(ScrollView).vertical) {
            this._direction = DirTypeEnum.v;
		} else {
            this._direction = DirTypeEnum.h;
		}

        this._content = this.node;
        this._r = r;
        this._c = c;
        this._spaceX = space;
        this._spaceY = space;
        this._scrollNode = scrollNode;
        if(this._direction==DirTypeEnum.v) {
            this.node.getComponent(UITransform).anchorY = 1; //可有可无
            this._c = Math.max(1, c);
            this._minSeeableC = 0;
            this._maxSeeableC = this._c-1;
        } else {
            this.node.getComponent(UITransform).anchorX = 0;  //可有可无
            this._r = Math.max(1, r);
            this._minSeeableR = 0;
            this._maxSeeableR = this._r-1;
        }

        if(this._content.getComponent(Layout)) {
            this._content.removeComponent(Layout);
        }

        if(!this._inited) {
            this._inited = true;
            scrollNode.off("scrolling", this.onPosChanged, this);
            scrollNode.on("scrolling", this.onPosChanged, this);
        }

        this.doLayout();
    }

    setCreateFunc(func:()=>Node, sz?:Size) : CpnGridEx {
        this._createFunc = func;
        this._cellSize = size(sz.width, sz.height);
        return this;
    }

	setSelectListener(func: (cellCpn:CpnGridCell, listCpn:CpnGridEx, bSelected:boolean)=>void, thisObj:any) : CpnGridEx {
		this._selectListener = new CHandler(thisObj, func);
		return this;
	}

	setIdGettor(func:(data:any)=>any) : CpnGridEx {
		this._idGettor = func;
		return this;
	}

    getDataId(data:any):any {
		if(this._idGettor) {
			return this._idGettor(data);
		}
		return null;
	}

    setData(datalist:Array<any>) {
		var oldLen = this._dataList && this._dataList.length || 0;
		this._dataList = datalist;
		var nowLen = this._dataList && this._dataList.length || 0;

        for(var i=this._minSeeableR; i<=this._maxSeeableR; i++) {
            for(var j=this._minSeeableC; j<=this._maxSeeableC; j++) {
                let idx = this.rc2index(i,j);
                this.onUnseeable(this._items[idx], idx);
            }
        }
        if(this._direction==DirTypeEnum.v) {
            this._minSeeableR = -1;
		    this._maxSeeableR = -1;
        } else {
            this._minSeeableC = -1;
		    this._maxSeeableC = -1;
        }

        if(nowLen < oldLen) {
			this._scrollNode.getComponent(ScrollView).stopAutoScroll();
			if(this._direction==DirTypeEnum.v) {
				this._scrollNode.getComponent(ScrollView).scrollToTop();
			} else {
				this._scrollNode.getComponent(ScrollView).scrollToLeft();
			}
		}
		this.doLayout();
		if(nowLen < oldLen) {
			this._scrollNode.getComponent(ScrollView).stopAutoScroll();
			if(this._direction==DirTypeEnum.v) {
				this._scrollNode.getComponent(ScrollView).scrollToTop();
			} else {
				this._scrollNode.getComponent(ScrollView).scrollToLeft();
			}
		}
		this.onPosChanged();
	}

    addData(data:any) {
		if(isNil(this._dataList)) {
			this._dataList = [];
		}
		this._dataList[this._dataList.length] = data;
		this.doLayout();
		this.onPosChanged();
	}

	updateData(idx:number, data:any) {
		if(isNil(this._dataList)) {
			this._dataList = [];
		}
		this._dataList[idx] = data;
		this.updateItem(idx);
	}

    delData(filterFunc:Function, delCnt:number=-1) {
		logger.warn("未实现");
	}

	setSelectedIndex(idx:number) {
		if(this._selectedIndex>=0) {
			this.updateItem(this._selectedIndex);
			this.onSelect(this._items[this._selectedIndex], false, this._dataList[this._selectedIndex]);
		}
		this._selectedIndex = idx;
		if(this._selectedIndex>=0) {
			this.updateItem(this._selectedIndex);
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

    getDataIndexById(id:any) : number {
		for(var idx=this._dataList.length-1; idx>=0; idx--) {
			if(this.getDataId(this._dataList[idx]) === id) {
				return idx;
			}
		}
		return -1;
	}

    scrollToSelected() {
		logger.warn("未实现");
	}

    //----------------------------------------------------------------

    private getItemLocgic(item:Node) : CpnGridCell {
        return item.getComponent(CpnGridCell);
    }

	private onSelect(item:Node, bSelected:boolean, data:any) {
		if(item) {
            this.getItemLocgic(item).onSelect(this, bSelected);
            if(this._selectListener) {
                this._selectListener.invokeWithExtra(this.getItemLocgic(item), this, bSelected);
            }
		}
	}

    private updateItem(idx) {
		if(this._items[idx]) {
		    //	cc.log("update", idx);
            let item = this._items[idx];
            let cellItem = this.getItemLocgic(item);
            cellItem.setIndex(idx);
            cellItem.setData(this._dataList[idx]);
            cellItem.doUpdate(this, this._dataList[idx], idx);
            this.onSelect(item, idx==this._selectedIndex, this._dataList[idx]);
		}
	}

	private createItem(idx:number) : boolean {
		if(idx<0 || isNil(this._dataList) || idx >= this._dataList.length){
		//	cc.log("createItem fial:", idx, this.dataList && this.dataList.length);
			return false;
		}
		var needUpdate = false;
		if(!this._items[idx]) {
			needUpdate = true;
			if(this._unseeables.length>0) {
			//	logger.log("create from cache", idx, this.unseeables.length-1);
				this._items[idx] = this._unseeables.splice(this._unseeables.length-1, 1)[0];
			} else {
                this._items[idx] = this._createFunc();
				this.node.addChild(this._items[idx]);
                this.getItemLocgic(this._items[idx]).doInit(this);
			}
			if(!this._cellSize || this._cellSize.width === 0) {
                this._cellSize = this._cellSize || size(0,0);
				this._cellSize.width = this._items[idx].getComponent(UITransform).width;
				this._cellSize.height = this._items[idx].getComponent(UITransform).height;
				this.doLayout();
			}
		}
		this._items[idx].active = true;
		this._items[idx].position = this.index2pos(idx);
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

    private hideRow(r:number) {
        for(var lie=0; lie<this._c; lie++) {
            let cur = this.rc2index(r,lie);
            this.onUnseeable(this._items[cur], cur);
        }
    }

    private hideCol(c:number) {
        for(let i=0; i<this._r; i++) {
            let cur = this.rc2index(i,c);
            this.onUnseeable(this._items[cur], cur);
        }
    }

    protected onPosChanged() {
        if(!this._scrollNode || !this._cellSize) {
            return;
        }
        
        if(this._direction==DirTypeEnum.v) {
            let minR = math_floor((this._content.position.y - this._minParentY)/(this._cellSize.height+this._spaceY));
            if(minR<0){ minR = 0; }
            let maxR = minR + this._maxRowCount;
            if(maxR>=this._r){ maxR = this._r-1; }
            if(this._minSeeableR != minR || this._maxSeeableR != maxR) {
                for(let i=this._minSeeableR; i<minR; i++) {
                    this.hideRow(i);
                }
                for(let j=maxR+1; j<=this._maxSeeableR; j++) {
                    this.hideRow(j);
                }

                this._minSeeableR = minR;
                this._maxSeeableR = maxR;
            //    logger.log("---", minR, maxR, this._r, this._c, this._maxRowCount, this._maxColCount);
                for(var m=minR; m<=maxR; m++) {
                    for(var n=0; n<this._c; n++) {
                        let iIdx = this.rc2index(m,n);
                        if(this.createItem(iIdx)) {
                            this.updateItem(iIdx);
                        }
                    }
                }
            }
        } else {
            let minC = math_floor((this._maxParentX - this._content.position.x)/(this._cellSize.width+this._spaceX));
            if(minC<0){ minC = 0; }
            let maxC = minC + this._maxColCount;
            if(maxC>=this._c){ maxC = this._c-1; }
            if(this._minSeeableC != minC || this._maxSeeableC != maxC) {
                for(let i=this._minSeeableC; i<minC; i++) {
                    this.hideCol(i);
                }
                for(let j=maxC+1; j<=this._maxSeeableC; j++) {
                    this.hideCol(j);
                }

                this._minSeeableC = minC;
                this._maxSeeableC = maxC;
            //    logger.log("---", minC, maxC, this._r, this._c, this._maxRowCount, this._maxColCount);
                for(var m=0; m<this._r; m++) {
                    for(var n=minC; n<=maxC; n++) {
                        let iIdx = this.rc2index(m,n);
                        if(this.createItem(iIdx)) {
                            this.updateItem(iIdx);
                        }
                    }
                }
            }
        }
    }

    doLayout() {
        if(!this._cellSize) {
            return;
        }

        let len = this._dataList && this._dataList.length || 0;
        let uiTrans = this._content.getComponent(UITransform);
        let parTrans = this._content.parent.getComponent(UITransform);

        if(this._direction==DirTypeEnum.v) {
            let h = this.index2rc(len-1).r;
            this._r = h+1;
            uiTrans.setContentSize(uiTrans.width, this._cellSize.height*(h+1)+this._spaceY*h);
        } else {
            let w = this.index2rc(len-1).c;
            this._c = w+1;
            uiTrans.setContentSize(this._cellSize.width*(w+1)+this._spaceX*w, uiTrans.height);
        }

        for(var idx = 0; idx<len; idx++) {
            if(this._items[idx]) {
                this._items[idx].position = this.index2pos(idx);
            }
        }

        this._minParentY = parTrans.height*parTrans.anchorY - uiTrans.height * (1-uiTrans.anchorY);
        this._maxParentY = this._minParentY + uiTrans.height-parTrans.height;
        this._maxParentX = uiTrans.width*uiTrans.anchorX - parTrans.width*parTrans.anchorX;
        this._minParentX = parTrans.width*(1-parTrans.anchorX) - uiTrans.width*(1-uiTrans.anchorX);
        if(this._minParentX > this._maxParentX) { this._minParentX = this._maxParentX; }

        if(this._direction==DirTypeEnum.v) {
            this._maxRowCount = math_ceil(parTrans.height/(this._cellSize.height+this._spaceY)) + 1;
            this._maxColCount = this._c;
        } else {
            this._maxRowCount = this._r;
            this._maxColCount = math_ceil(parTrans.width/(this._cellSize.width+this._spaceX)) + 1;
        }

    //    logger.log("======", this._r, this._c, this._maxRowCount, this._maxColCount);
        this.onPosChanged();
    }

    protected index2pos(idx:number) : Vec3 {
        let rc = this.index2rc(idx);
        let rlt = v3(0,0,0);
        let uiTrans = this._content.getComponent(UITransform);
        if(this._direction==DirTypeEnum.v) {
            rlt.x = uiTrans.width/this._c * (rc.c+0.5) - uiTrans.width*uiTrans.anchorX;
            rlt.y = uiTrans.height*(1-uiTrans.anchorY) - this._cellSize.height * (1-this._items[idx].getComponent(UITransform).anchorY) - rc.r*this._cellSize.height - this._spaceY*rc.r;
        } else {
            rlt.y = uiTrans.height*(1-uiTrans.anchorY) - uiTrans.height/(this._r) * (rc.r+0.5);
            rlt.x = -uiTrans.width*uiTrans.anchorX + this._cellSize.width * this._items[idx].getComponent(UITransform).anchorX + rc.c*this._cellSize.width + this._spaceX*rc.c;
        }
        return rlt;
    }

    protected rc2index(r:number, c:number) : number {
        if(this._direction==DirTypeEnum.v) {
            return r*this._c+c;
        } else {
            return c*this._r+r;
        }
    }

    protected index2rc(idx:number) : {r:number, c:number} {
        if(this._direction==DirTypeEnum.v) {
            return {r:math_floor(idx/this._c), c:idx%this._c};
        } else {
            return {r:idx%this._r, c:math_floor(idx/this._r)};
        }
    }

}
