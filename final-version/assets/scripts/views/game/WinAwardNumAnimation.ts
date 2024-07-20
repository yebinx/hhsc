import { _decorator, Component, Label, Node, sp } from 'cc';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import GameAudio from '../../mgrs/GameAudio';
import { CompNumberEx } from '../../kernel/compat/view/comps/CompNumberEx';
import CHandler from '../../kernel/core/datastruct/CHandler';
import CocosUtil from '../../kernel/compat/CocosUtil';
const { ccclass, property } = _decorator;

@ccclass('WinAwardNumAnimation')
export class WinAwardNumAnimation extends Component {
    @property(sp.Skeleton)
    bgAnimation: sp.Skeleton;
    @property(sp.Skeleton)
    goldAnimation: sp.Skeleton;
    @property(CompNumberEx)
    labNum: CompNumberEx;

    showNum: number = 0;
    showLevel: number = 0;

    protected onLoad(): void {
        this.labNum.setValueFormater(v => {
            return MoneyUtil.rmbStr(v);
        })
    }


    initWin(num: number, level: number = 1) {
        this.node.active = true;
        this.labNum.initValue(num);
        this.goldAnimation.node.active = false;
        this.bgAnimation.setAnimation(0, "win" + level, false)
    }

    showWin(num: number, level: number = 1) {
        return new Promise(async res => {
            this.showNum = num
            this.showLevel = level
            this.node.active = true;
            this.goldAnimation.node.active = true;
            this.bgAnimation.setAnimation(0, "win" + level, false)
            this.goldAnimation.setAnimation(0, "animation", false)
            if (level == 1) {
                // this.bgAnimation.setCompleteListener(res)
                this.labNum.initValue(num);
                GameAudio.winLeve1()
                GameAudio.winPlayerRandom()
                await CocosUtil.wait(1)
                res(null)
            } else if (level == 2) {
                this.labNum.setEndCallback(new CHandler(this, async () => {
                    GameAudio.winLeveEnd2()
                    this.bgAnimation.setAnimation(0, "win" + level, false)
                    await CocosUtil.wait(1)
                    res(null)
                }))
                this.labNum.initValue(0)
                this.labNum.chgValue(num, 1)
                GameAudio.rollScore();
                return
            } else {
                // this.bgAnimation.setCompleteListener(res)
                this.labNum.initValue(num);
                GameAudio.winLeve3()
                await CocosUtil.wait(1)
                res(null)
            }
        })
    }

    hideWin() {
        this.node.active = false;
    }
}


