import { _decorator, Component, Label, Node } from 'cc';
import { EDateType } from '../../define/GameConst';

const { ccclass, property } = _decorator;

@ccclass('CompDateSelect')
export class CompDateSelect extends Component {
    private _valu:number = 0;
    private _dateType:EDateType = EDateType.day;
    private _isStart:boolean = true;

    setValue(v:number) {
        this._valu = v;
        this.node.getChildByName("lb_title").getComponent(Label).string = v.toString();
    }

    getValue() {
        return this._valu;
    }

    setDateType(v:EDateType, bStart:boolean) {
        this._dateType = v;
        this._isStart = bStart;
    }

    getDateType() {
        return this._dateType;
    }

    isStart() {
        return this._isStart;
    }
}


