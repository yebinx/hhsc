import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { TPrize } from '../../interface/result';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
const { ccclass, property } = _decorator;

@ccclass('HisLineAward')
export class HisLineAward extends Component {
    @property(Sprite)
    lineImg: Sprite;
    @property(Label)
    lblIdx: Label;
    @property(Label)
    lbX10: Label;
    @property(Label)
    lblMu: Label;
    @property(SpriteFrame)
    lineImages: SpriteFrame[] = [];


    setData(data: TPrize, idx: number) {
        let times = data.multi_time || 1
        this.lblIdx.string = `0${idx}`;
        this.lblMu.string = "R$" +MoneyUtil.rmbStr(data.win * times);
        this.lineImg.spriteFrame = this.lineImages[data.index - 1];
        this.lbX10.node.active = times > 1
        if (times > 1) {
            this.lbX10.string = "R$" + MoneyUtil.rmbStr(data.win) + " x " + times
        }
    }
}


