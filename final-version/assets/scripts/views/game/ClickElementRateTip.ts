import { _decorator, Component, Label, Node, NodeEventType, sp, v3, Vec2 } from 'cc';
import { ElementCom } from './ElementCom';
import { AwardElementCom } from './AwardElementCom';
import GameConst from '../../define/GameConst';
const { ccclass, property } = _decorator;




var PosInfo = [
    { position: v3(-162, -195, 0), childListX: [95, 230, 313] },
    { position: v3(-162, 0, 0), childListX: [95, 230, 313] },
    { position: v3(-162, 210, 0), childListX: [95, 230, 313] },

    { position: v3(87, -195, 0), childListX: [95, 230, 313] },
    { position: v3(87, 0, 0), childListX: [95, 230, 313] },
    { position: v3(87, 210, 0), childListX: [95, 230, 313] },

    { position: v3(162, -195, 0), childListX: [270, 20, 115] },
    { position: v3(162, 0, 0), childListX: [270, 20, 115] },
    { position: v3(162, 210, 0), childListX: [270, 20, 115] },
]



@ccclass('ClickElementRateTip')
export class ClickElementRateTip extends Component {
    @property(Node)
    root: Node;
    @property(AwardElementCom)
    awardElementCom: AwardElementCom;
    @property(Node)
    nodes: Node;
    @property(Label)
    txtNum1: Label;
    @property(Label)
    txtNum2: Label;

    start() {
        this.root.on(NodeEventType.TOUCH_END, () => {
            this.hideTip()
        }, this)
    }

    showTip(posIdx: number, id: number) {
        this.node.active = true;
        let info = PosInfo[posIdx]
        this.root.position = info.position;
        this.awardElementCom.init(id)
        this.awardElementCom.playIdle()
        let rate = GameConst.ElementRateList.get(id);
        if (rate) {
            this.txtNum2.string = rate + ""
        }
        this.nodes.children.forEach((v, k) => {
            v.position = v3(info.childListX[k], 0, 0)
        })
    }

    hideTip() {
        this.node.active = false;
    }

}


