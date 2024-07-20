import { _decorator, Component, Node, sp, tween, v3 } from 'cc';
import { CompNumberEx } from '../../kernel/compat/view/comps/CompNumberEx';
import { BaseView } from '../../kernel/compat/view/BaseView';
import CHandler from '../../kernel/core/datastruct/CHandler';
import GameEvent from '../../event/GameEvent';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameModel from '../../models/GameModel';
import CocosUtil from '../../kernel/compat/CocosUtil';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import GameAudio from '../../mgrs/GameAudio';
const { ccclass, property } = _decorator;

@ccclass('ResultBigAward')
export class ResultBigAward extends BaseView {

    @property(sp.Skeleton)
    spHuzi: sp.Skeleton;
    @property(sp.Skeleton)
    spHua: sp.Skeleton;
    @property(sp.Skeleton)
    spLight: sp.Skeleton;
    @property(CompNumberEx)
    labNum: CompNumberEx;

    runList: { start: number, end: number }[] = [];
    runIdx: number = 0;
    private autoCloseTime: number = 4;
    private isStartTime: boolean = false;
    private isCloseUi: boolean = false;

    showLevel: number = -1;


    targetNum: number = 0

    targetLevel: number = 0;

    onLoad(): void {
        this.spHuzi.setCompleteListener((t) => {
            let aniName = t.animation.name;
            switch (aniName) {
                case "win_big_in":
                    this.spHuzi.setAnimation(0, "win_big_idle", true)
                    break;
                case "win_big_idle":
                    // this.spHuzi.setAnimation(0, "win_huge_end", true)
                    break;
                case "win_huge_end":
                    // this.spHuzi.setAnimation(0, "win_huge_idle", false)
                    break;
                case "win_huge_in":
                    this.spHuzi.setAnimation(0, "win_huge_idle", true)
                    break;
                case "win_huge_idle":
                    // this.spHuzi.setAnimation(0, "win_huge_end", false)
                    break;
                case "win_huge_end":
                    // this.spHuzi.setAnimation(0, "win_huge_idle", false)
                    break;
                case "win_super_in":
                    this.spHuzi.setAnimation(0, "win_super_idle", true)
                    break;
                case "win_super_idle":
                    // this.spHuzi.setAnimation(0, "win_super_end", false)
                    break;
                case "win_super_end":
                    // this.spHuzi.setAnimation(0, "win_super_end", false)
                    break;
            }
        })
        CocosUtil.addClickEvent(this.node.getChildByName("mesk"), this.onClickMesk, this, null, 1);
        this.initNetEvent()
    }
    private initNetEvent() {
        EventCenter.getInstance().listen(GameEvent.key_down_space, this.onClickMesk, this);
        EventCenter.getInstance().listen(GameEvent.key_pressing_space, this.onClickMesk, this);
    }

    initData(data: { amounts: number[] }) {
        this.targetNum = data.amounts[data.amounts.length - 1]
        this.labNum.setEndCallback(new CHandler(this, this.onValueChangeEnd))
        this.labNum.setValueFormater(v => {
            return MoneyUtil.rmbStr(v);
        })
        this.targetLevel = data.amounts.length;
        let startAmount = 0;
        let totalAward = 0;
        for (let index = 0; index < data.amounts.length; index++) {
            totalAward = data.amounts[index]
            this.runList[index] = { start: startAmount, end: totalAward }
            startAmount = totalAward
        }
        GameAudio.bigWin()
        this.runChange(1)
    }

    private onClickMesk() {
        if (!this.isStartTime) {
            GameAudio.bigWinEnd()
            this.toFinal();
        }
    }

    private toFinal() {
        this.onLevelChg(this.targetLevel);
        this.isStartTime = true
        this.labNum.initValue(this.targetNum);
    }

    setSpAnima(level){
        for (let i = 1; i < 4; i++) {
           let item = this.node.getChildByName("win").getChildByName(`level${i}`)
           if(level == i){
                item.setScale(0,0,0); 
                item.active = true;
                tween(item)
                    .by(0.2, { scale: v3(1, 1, 1) })
                    .start()
           }else{
                item.active = false;
           }
        }
    }

    private showBigAward1() {
        this.spHuzi.setAnimation(0, "win_big_in", false)
        this.spHua.setAnimation(0, "animation", false)
        this.spLight.setAnimation(0, "animation", false)
        this.setSpAnima(1);
    }

    private showBigAward2() {
        this.spHuzi.setAnimation(0, "win_huge_in", false)
        this.spHua.setAnimation(0, "animation2", false)
        this.spLight.setAnimation(0, "animation", false)
        this.setSpAnima(2);
    }

    private showBigAward3() {
        this.spHuzi.setAnimation(0, "win_super_in", false)
        this.spHua.setAnimation(0, "animation2", false)
        this.spLight.setAnimation(0, "animation", false)
        this.setSpAnima(3);
    }

    private onValueChangeEnd(v: number) {
        if (this.runIdx == this.runList.length) {
            this.isStartTime = true
            GameAudio.bigWinEnd()
        } else {
            this.runIdx++;
            this.runChange(this.runIdx)
        }
    }

    runChange(idx) {
        this.runIdx = idx
        let amounts = this.runList[idx - 1]
        this.onLevelChg(idx)
        this.labNum.initValue(amounts.start)
        this.labNum.chgValue(amounts.end, 7);
    }

    onLevelChg(level: number) {
        if (this.showLevel == level) {
            return;
        }
        this.showLevel = level
        switch (level) {
            case 1:
                this.showBigAward1()
                break;
            case 2:
                this.showBigAward2()
                break;
            case 3:
                this.showBigAward3()
                break;
        }
    }

    private closeUI() {
        EventCenter.getInstance().fire(GameEvent.close_bigreward);
    }

    protected onDestroy(): void {
        GameAudio.stopBigAward()
    }

    protected update(dt: number): void {
        if (!this.isCloseUi) {
            if (this.isStartTime) {
                this.autoCloseTime -= dt;
                if (this.autoCloseTime <= 0) {
                    this.isCloseUi = true;
                    this.closeUI();
                }
            }
        }
    }

}


