import { Component, Node, Size, Layout, ScrollView, UITransform, Vec3, v3, _decorator } from "cc";
import {CpnGridEx} from "./CpnGridEx";
import { IGridCell } from "./ICell";

const {ccclass, property} = _decorator;

@ccclass('CpnGridCell')
export class CpnGridCell extends Component {
    private _index:number = 0;
    private _data:any = null;

    private _delegate:IGridCell;

    setIndex(idx:number) {
        this._index = idx;
    }

    getIndex() : number {
        return this._index;
    }

    setData(data:any) {
        this._data = data;
    }

    getData() : any {
        return this._data;
    }

    doInit(grid:CpnGridEx) {
        if(this._delegate) {
            this._delegate.doInit(this, grid);
        }
    }

    doUpdate(grid:CpnGridEx, data:any, idx:number) {
        if(this._delegate) {
            this._delegate.doUpdate(this, grid, data, idx);
        }
    }

    onSelect(grid:CpnGridEx, bSelected:boolean) {
        if(this._delegate) {
            this._delegate.onSelect(this, grid, bSelected);
        }
    }

    setDelegate(delegate:IGridCell) {
        this._delegate = delegate;
    }
    
}
