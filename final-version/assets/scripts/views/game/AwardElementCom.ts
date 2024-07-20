import { _decorator, Component, Label, Node, sp, tween, v3 } from 'cc';
import GameConst from '../../define/GameConst';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import CocosUtil from '../../kernel/compat/CocosUtil';
const { ccclass, property } = _decorator;

@ccclass('AwardElementCom')
export class AwardElementCom extends Component {
    @property(sp.Skeleton)
    spElement: sp.Skeleton;
    @property(sp.Skeleton)
    spXing: sp.Skeleton;
    @property(sp.Skeleton)
    bgEffect: sp.Skeleton;
    @property(sp.SkeletonData)
    spineRes: sp.SkeletonData[] = []
    // @property(Label)
    // lblAwardAmount: Label;
    id: number = 0;

    init(id: number) {
        this.id = id
        this.spElement.skeletonData = this.spineRes[id - 1];
        // let name = this.spElement.skeletonData.name.toLocaleLowerCase();
        this.spElement.loop = false;
        this.spElement.timeScale = 0.8;
        if(id == 1){
            this.spElement.premultipliedAlpha = true;
            this.spElement.node.setScale(0.7,0.7,0.7)
        }else{
            this.spElement.premultipliedAlpha = false;
            this.spElement.node.setScale(1,1,1)
        }
        // this.showWinNum(0)
        // this.spElement.setAnimation(0, name + "_idle", false)
    }


    playAward() {
        return new Promise(async res => {
            let name = this.spElement.skeletonData.name.toLocaleLowerCase();
            this.spElement.setCompleteListener(() => {
                res(null)
            })
            this.spXing.setAnimation(0, "animation", false)
            if(this.id == 1){
                this.spElement.setAnimation(0, "win", false)
            }else{
                this.spElement.setAnimation(0, name + "_win", false)
            }
            
        })
    }

    // showWinNum(num: number, y: number = -66) {
    //     this.lblAwardAmount.node.active = num > 0
    //     this.lblAwardAmount.node.position = v3(0, y, 0)
    //     this.lblAwardAmount.string = MoneyUtil.rmbStr(num);
    // }

    addEffect(node: Node) {
        this.node.addChild(node)
    }

    playIdle() {
        this.bgEffect.node.active = false;
        this.spXing.node.active = false;
        let name = this.spElement.skeletonData.name.toLocaleLowerCase();
        if(this.id == 1){
            this.spElement.setAnimation(0, "idle", false)
        }else{
            this.spElement.setAnimation(0, name + "_idle", false)
        }
    }

}


