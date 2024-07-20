import { Component, Node, _decorator } from "cc";
import {CpnList} from "./CpnList";
import { IListCell } from "./ICell";

const {ccclass, property} = _decorator;

@ccclass('CpnListCell')
export class CpnListCell extends Component {
    private _index:number = 0;
    private _data:any = null;

    private _delegate:IListCell;

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

    doInit(grid:CpnList) {
        if(this._delegate) {
            this._delegate.doInit(this, grid);
        }
    }

    doUpdate(grid:CpnList, data:any, idx:number) {
        if(this._delegate) {
            this._delegate.doUpdate(this, grid, data, idx);
        }
    }

    onSelect(grid:CpnList, bSelected:boolean) {
        if(this._delegate) {
            this._delegate.onSelect(this, grid, bSelected);
        }
    }

    setDelegate(delegate:IListCell) {
        this._delegate = delegate;
    }

}
