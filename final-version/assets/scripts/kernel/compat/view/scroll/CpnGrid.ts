import { Component, Node, Size, Layout, ScrollView, UITransform, Vec3, v3, _decorator } from "cc";

// 对scrollview上的子节点进行可见性判断及动态设置其子节点的可见行
var math_floor = Math.floor;
var math_ceil = Math.ceil;

export enum StableTypeEnum {
    wid,    //固定宽
    hei     //固定高
}

enum DirTypeEnum {
	h,
	v,
}

const { ccclass, property } = _decorator;

@ccclass('GameView')
export class CpnGrid extends Component {
    protected direction = DirTypeEnum.v;
    protected _inited:boolean = false;
    protected _stableType:StableTypeEnum = StableTypeEnum.wid;    //布局方式
    protected _r:number = 1;  //行数
    protected _c:number = 1;  //列数
    protected _spaceX:number = 0;
    protected _spaceY:number = 0;
    protected _content:Node = null;
    protected _cellSize: Size = null;

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

    onLoad() {
        if(this.node.getComponent(Layout)) {
            this.node.removeComponent(Layout);
			this.scheduleOnce(function(dt){
				this.doLayout();
			}.bind(this), 0);
        }
    }

    config(r:number, c:number, space:number, scrollNode:Node) {
        let stableType:StableTypeEnum = StableTypeEnum.hei;
        if(scrollNode.getComponent(ScrollView).vertical) {
			stableType = StableTypeEnum.wid;
            this.direction = DirTypeEnum.v;
		} else {
			stableType = StableTypeEnum.hei;
            this.direction = DirTypeEnum.h;
		}

        this._content = this.node;
        this._stableType = stableType;
        this._r = r;
        this._c = c;
        this._spaceX = space;
        this._spaceY = space;
        this._scrollNode = scrollNode;
        if(stableType==StableTypeEnum.wid) {
            this._c = Math.max(1, c);
            this._minSeeableC = 0;
            this._maxSeeableC = this._c-1;
        } else {
            this._r = Math.max(1, r);
            this._minSeeableR = 0;
            this._maxSeeableR = this._r-1;
        }

        if(this._content.getComponent(Layout)) {
            this._content.removeComponent(Layout);
        }

        if(scrollNode) {
            if(!this._inited) {
                this._inited = true;
                scrollNode.off("scrolling", this.onPosChanged, this);
                scrollNode.on("scrolling", this.onPosChanged, this);
            }
        }

        this.doLayout();
    }

    protected onPosChanged() {
        if(!this._scrollNode) {
            return;
        }

        if(!this._cellSize) {
            this.doLayout();
            if(!this._cellSize) {
                return;
            }
        }
        
        if(this._stableType==StableTypeEnum.wid) {
            let minR = math_floor((this._content.position.y - this._minParentY)/(this._cellSize.height+this._spaceY));
            let maxR = minR + this._maxRowCount;
            if(minR<0){ minR = 0; }
            if(maxR>=this._r){ maxR = this._r-1; }
            if(this._minSeeableR != minR || this._maxSeeableR != maxR) {
                this._minSeeableR = minR;
                this._maxSeeableR = maxR;
            //    logger.log("---", minR, maxR, this._r, this._c, this._maxRowCount, this._maxColCount);
                for(var i=0,len=this._content.children.length; i<len; i++) {
                    var curR = math_floor(i/this._c);
                    this._content.children[i].active = curR >= minR && curR <= maxR;
                }
            }
        } else {
            let minC = math_floor((this._maxParentX - this._content.position.x)/(this._cellSize.width+this._spaceX));
            let maxC = minC + this._maxColCount;
            if(minC<0){ minC = 0; }
            if(maxC>=this._c){ maxC = this._c-1; }
            if(this._minSeeableC != minC || this._maxSeeableC != maxC) {
                this._minSeeableC = minC;
                this._maxSeeableC = maxC;
            //    logger.log("---", minC, maxC, this._r, this._c, this._maxRowCount, this._maxColCount);
                for(var i=0,len=this._content.children.length; i<len; i++) {
                    var curC = math_floor(i/this._r);
                    this._content.children[i].active = curC >= minC && curC <= maxC;
                }
            }
        }
    }

    doLayout() {
        if(!this._content.children[0]) {
            return;
        }

        this._cellSize = this._content.children[0].getComponent(UITransform).contentSize;

        let uiTrans = this._content.getComponent(UITransform);
        let parTrans = this._content.parent.getComponent(UITransform);

        if(this._stableType==StableTypeEnum.wid) {
            let h = this.index2rc(this._content.children.length-1).r;
            this._r = h+1;
            uiTrans.setContentSize(uiTrans.width, this._cellSize.height*(h+1)+this._spaceY*h);
        } else {
            let w = this.index2rc(this._content.children.length-1).c;
            this._c = w+1;
            uiTrans.setContentSize(this._cellSize.width*(w+1)+this._spaceX*w, uiTrans.height);
        }

        for(var idx = 0; idx<this._content.children.length; idx++) {
            this._content.children[idx].position = this.index2pos(idx);
        }

        this._minParentY = parTrans.height*parTrans.anchorY - uiTrans.height * (1-uiTrans.anchorY);
        this._maxParentY = this._minParentY + uiTrans.height-parTrans.height;
        this._maxParentX = uiTrans.width*uiTrans.anchorX - parTrans.width*parTrans.anchorX;
        this._minParentX = parTrans.width*(1-parTrans.anchorX) - uiTrans.width*(1-uiTrans.anchorX);
        if(this._minParentX > this._maxParentX) { this._minParentX = this._maxParentX; }

        if(this._stableType==StableTypeEnum.wid) {
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
        if(this._stableType==StableTypeEnum.wid) {
            rlt.x = uiTrans.width/this._c * (rc.c+0.5) - uiTrans.width*uiTrans.anchorX;
            rlt.y = uiTrans.height*(1-uiTrans.anchorY) - this._cellSize.height * (1-this._content.children[idx].getComponent(UITransform).anchorY) - rc.r*this._cellSize.height - this._spaceY*rc.r;
        } else {
            rlt.y = uiTrans.height*(1-uiTrans.anchorY) - uiTrans.height/(this._r) * (rc.r+0.5);
            rlt.x = -uiTrans.width*uiTrans.anchorX + this._cellSize.width * this._content.children[idx].getComponent(UITransform).anchorX + rc.c*this._cellSize.width + this._spaceX*rc.c;
        }
        return rlt;
    }

    protected index2rc(idx:number) : {r:number, c:number} {
        if(this._stableType==StableTypeEnum.wid) {
            return {r:math_floor(idx/this._c), c:idx%this._c};
        } else {
            return {r:idx%this._r, c:math_floor(idx/this._r)};
        }
    }

    protected rc2index(r:number, c:number) : number {
        if(this._stableType==StableTypeEnum.wid) {
            return r*this._c+c;
        } else {
            return c*this._r+r;
        }
    }

}
