import {CpnGridCell} from "./CpnGridCell";
import {CpnGridEx} from "./CpnGridEx";
import {CpnList} from "./CpnList";
import {CpnListCell} from "./CpnListCell";

export interface IListCell {
    doInit(cellCpn:CpnListCell, listCpn:CpnList):void;
    doUpdate(cellCpn:CpnListCell, listCpn:CpnList, data:any, idx:number):void;
    onSelect(cellCpn:CpnListCell, listCpn:CpnList, bSelected:boolean):void;
}

export interface IGridCell {
    doInit(cellCpn:CpnGridCell, listCpn:CpnGridEx):void;
    doUpdate(cellCpn:CpnGridCell, listCpn:CpnGridEx, data:any, idx:number):void;
    onSelect(cellCpn:CpnGridCell, listCpn:CpnGridEx, bSelected:boolean):void;
}
