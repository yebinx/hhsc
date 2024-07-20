import { _decorator, Component, director, game, Label, macro, Node } from 'cc';
import CHandler from '../../../core/datastruct/CHandler';
import MoneyUtil from '../../../core/utils/MoneyUtil';

const { ccclass, property } = _decorator;

@ccclass('CompTickLabel')
export class CompTickLabel extends Component {
    private _finalValue:number = 0;
    private _curValue:number = 0;
    private _prefix:string = "";
    private _dot:boolean = false;
    private _cb:CHandler = null;

    setPrefex(prefix:string) {
        this._prefix = prefix;
    }

    setDot(bDot:boolean) {
        this._dot = bDot;
    }

    curValue() {
        return this._curValue;
    }

    initValue(v:number) {
        this._finalValue = v;
        this._curValue = v;
        this.unscheduleAllCallbacks();
        this.refleshLabel();
    }

    setCallback(cb:CHandler) {
        this._cb = cb;
    }
    
    setValue(v:number, duration:number) {
        if(v===this._finalValue) { 
            return; 
        }
        this._finalValue = v;
        let interval = 0.03;
        let diff = v - this._curValue;
        let totalFrame = duration / interval;
        let tick = Math.max(0.01, Math.round(100*diff/totalFrame)/100);
        
        this.unscheduleAllCallbacks();
        this.schedule(()=>{
            this._curValue = this._curValue + tick;
            if(diff > 0) {
                if(this._curValue >= this._finalValue) {
                    this._curValue = this._finalValue;
                    this.unscheduleAllCallbacks();
                }
            } else {
                if(this._curValue <= this._finalValue) {
                    this._curValue = this._finalValue;
                    this.unscheduleAllCallbacks();
                }
            }
            this.refleshLabel();
        }, interval, macro.REPEAT_FOREVER, 0.01);
    }

    getCurValueStr() : string {
        if(this._dot) {
            return this._prefix=="" && MoneyUtil.formatGold(this._curValue) || this._prefix+MoneyUtil.formatGold(this._curValue);
        } else {
            return this._prefix=="" && MoneyUtil.formatGoldEx(this._curValue) || this._prefix+MoneyUtil.formatGoldEx(this._curValue);
        }
    }

    private refleshLabel() {
        let lab = this.node.getComponent(Label);
        if(lab) {
            lab.string = this.getCurValueStr();
        }
        if(this._cb) {
            this._cb.invokeWithExtra(this._curValue);
        }
    }

    getValue() {
        return this._finalValue;
    }

}


