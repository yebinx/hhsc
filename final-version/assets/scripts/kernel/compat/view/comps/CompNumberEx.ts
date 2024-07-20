import { _decorator, Component, Label, Layout, macro, Node, size, Sprite, UITransform } from 'cc';
import CHandler from '../../../core/datastruct/CHandler';
import { createResInfo } from '../../load/ResInfo';
import SpriteHelper from '../../load/SpriteHelper';
import MoneyUtil from '../../../core/utils/MoneyUtil';


const { ccclass, property } = _decorator;

@ccclass('CompNumberEx')
export class CompNumberEx extends Component {
    private _cb: CHandler = null;
    private _finalValue: number = 0;
    private _curValue: number = 0;
    private _picPath = "fonts/num1/";
    private _firstLay: boolean = true;
    private _valueFormator: (v: any) => string;

    // protected onLoad(): void {
        // let lay = this.node.addComponent(Layout);
        // lay.type = Layout.Type.HORIZONTAL;
        // lay.resizeMode = Layout.ResizeMode.CONTAINER;
    // }

    setStyle(picPath: string) {
        this._picPath = picPath;
    }

    setValue(v: string) {
        let lab = this.getComponent(Label)
        if (lab) {
            lab.string = v
        }
        // let str = v;
        // let lenStr = str.length;

        // for(let i = 0; i < lenStr; i++) {
        //     let num = this.node.children[i];
        //     if(!num) {
        //         num = new Node;
        //         let spr = num.addComponent(Sprite);
        //         spr.sizeMode = Sprite.SizeMode.RAW;
        //         this.node.addChild(num);
        //         num.getComponent(UITransform).anchorY = 0;
        //     }
        //     num.active = true;
        //     if(str[i] == ".") {
        //         SpriteHelper.setNodeSprite(num, createResInfo(this._picPath + "dot", null));
        //     } else if(str[i] == ",") {
        //         SpriteHelper.setNodeSprite(num, createResInfo(this._picPath + "comma", null));
        //     } else {
        //         SpriteHelper.setNodeSprite(num, createResInfo(this._picPath + str[i], null));
        //     }
        // }

        // for(let j = this.node.children.length-1; j >= lenStr; j--) {
        //     this.node.children[j].active = false;
        // }

        // if(this._firstLay) {
        //     let lay = this.node.addComponent(Layout);
        //     if(lay) {
        //         this._firstLay = false;
        //         lay.updateLayout(); 
        //     }
        // }
    }


    private refleshLabel() {
        this.setValue(this.getCurValueStr());
        if (this._cb) {
            this._cb.invokeWithExtra(this._curValue);
        }
    }

    setValueFormater(f: (v: any) => string) {
        this._valueFormator = f;
    }

    getCurValueStr(): string {
        if (this._valueFormator) {
            return this._valueFormator(this._curValue) + "";
        }
        return MoneyUtil.formatGold(this._curValue);
    }

    setCallback(cb: CHandler) {
        this._cb = cb;
    }

    initValue(v: number) {
        this._finalValue = v;
        this._curValue = v;
        this.unscheduleAllCallbacks();
        this.refleshLabel();
    }

    chgValue(v: number, duration: number) {
        if (v === this._finalValue) {
            this.setValue(this.getCurValueStr());
            if (this._endCb) { this._endCb.invoke(); }
            return;
        }
        this._finalValue = v;
        let interval = 0.03;
        let diff = v - this._curValue;
        let totalFrame = duration / interval;
        let tick = Math.max(0.01, Math.round(100 * diff / totalFrame) / 100);

        this.unscheduleAllCallbacks();
        this.schedule(() => {
            this._curValue = this._curValue + tick;
            if (diff > 0) {
                if (this._curValue >= this._finalValue) {
                    this._curValue = this._finalValue;
                    this.unscheduleAllCallbacks();
                    if (this._endCb) { this._endCb.invoke(); }
                }
            } else {
                if (this._curValue <= this._finalValue) {
                    this._curValue = this._finalValue;
                    this.unscheduleAllCallbacks();
                    if (this._endCb) { this._endCb.invoke(); }
                }
            }
            this.refleshLabel();
        }, interval, macro.REPEAT_FOREVER, 0.01);
    }

    private _endCb: CHandler = null;
    setEndCallback(endCb: CHandler) {
        this._endCb = endCb;
    }

}


