import { _decorator, Color, Component, Label, Node, Sprite, Tween, tween, v3 } from 'cc';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { BaseView } from '../../kernel/compat/view/BaseView';
import GameEvent from '../../event/GameEvent';
import EventCenter from '../../kernel/core/event/EventCenter';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import GameCtrl from '../../ctrls/GameCtrl';
import { CompNumberEx } from '../../kernel/compat/view/comps/CompNumberEx';
import GameConst from '../../define/GameConst';
const { ccclass, property } = _decorator;


var BLUE = new Color("#42D1D1")

@ccclass('GameUI')
export class GameUI extends BaseView {
    @property(Label)
    txtBalanceAmount: Label;
    @property(Label)
    txtBetAmount: Label;
    @property(Label)
    txtWinAmount: Label;

    winAmount: number = 0;
    balanceAmount: number = 0;

    protected onLoad(): void {
        this.txtWinAmount.addComponent(CompNumberEx).setValueFormater((v: any) => {
            return this.changeMoney(v)
        })
        this.txtBalanceAmount.addComponent(CompNumberEx).setValueFormater((v: any) => {
            return this.changeMoney(v)
        })
        // this.txtBalanceAmount.addComponent(CompNumberEx)
    }
    setBalanceAmount(amount: number) {
        this.balanceAmount = amount;
        this.txtBalanceAmount.string = "R$" + MoneyUtil.rmbStr(amount);
    }

    changeMoney(amount) {
        return "R$" + MoneyUtil.rmbStr(amount)
    }

    setBetAmount(amount: number, isAnim: boolean = false) {
        this.txtBetAmount.string = "R$" + MoneyUtil.rmbStr(amount);
        if (isAnim) {
            tween(this.txtBetAmount.node)
                .to(0.1, { scale: v3(1.5, 1.5, 1) })
                .to(0.1, { scale: v3(0.9, 0.9, 1) })
                .to(0.1, { scale: v3(1.1, 1.1, 1) })
                .to(0.1, { scale: v3(1.0, 1.0, 1) })
                .start()
        }
    }

    setWinAmount(amount: number) {
        this.winAmount = amount;
        this.txtWinAmount.string = "R$" + MoneyUtil.rmbStr(amount);
    }

    playAddWinAnimation(amount: number) {
        this.winAmount = amount;
        this.txtWinAmount.getComponent(CompNumberEx).initValue(0)
        this.txtWinAmount.getComponent(CompNumberEx).chgValue(amount, 0.4)
    }

    playAddBlanceAnimation(amount: number) {
        this.txtBalanceAmount.getComponent(CompNumberEx).initValue(this.balanceAmount)
        this.txtBalanceAmount.getComponent(CompNumberEx).chgValue(amount,0.4)
        this.balanceAmount = amount;
    }

    setLabelColor(isGreen: boolean) {
        this.txtBalanceAmount.color = isGreen ? BLUE : Color.WHITE
        this.txtBetAmount.color = isGreen ? BLUE : Color.WHITE
        this.txtWinAmount.color = isGreen ? BLUE : Color.WHITE
    }






}


