import { Component, Node, Size, UITransform, v3, _decorator, tween, Tween } from "cc";
import { ElementCom } from "./ElementCom";
import { ObjPoolCom } from "./ObjPoolCom";
import MathUtil from "../../kernel/core/utils/MathUtil";
import GameModel from "../../models/GameModel";
import CocosUtil from "../../kernel/compat/CocosUtil";
import EventCenter from "../../kernel/core/event/EventCenter";
import GameEvent from "../../event/GameEvent";
import GameConst from "../../define/GameConst";
import GameCtrl from "../../ctrls/GameCtrl";
import GameAudio from "../../mgrs/GameAudio";

const { ccclass, property } = _decorator;


enum RollState {
    start,
    start_stop,//准备停止
    stop,//完全停止
}

@ccclass('RollAxisCom')
export class RollAxisCom extends Component {

    /**编号 */
    idx: number = -1;

    rollSpeed: number = -60;//滚动速度

    elementList: ElementCom[] = [];

    _tempElementList: Node[] = [];

    state: RollState;


    contentHeight: number = 639 //容器高度 分配元素坐标用

    parent: Node;//顶级父容器 用于坐标装换


    init(idx: number, parent: Node) {
        this.idx = idx;
        this.parent = parent
        this.state = RollState.stop
    }

    pushElement(id: number) {
        let h = this.parent.getComponent(UITransform).contentSize.height
        let y = -h / 2
        let lastElement = this.elementList[this.elementList.length - 1];
        if (lastElement) {
            y = lastElement.node.position.y + lastElement.getSize().height / 2
        }
        let element = ObjPoolCom.objPoolMgr.createElement();
        let com = element.getComponent(ElementCom)
        com.init(id)
        let elementSize = com.getSize()
        element.position = v3(0, y + elementSize.height / 2, 0)
        this.elementList.push(com)
        this.node.addChild(element);
        return com
    }


    changeElementId(ids: number[]) {
        for (let index = 0; index < this.elementList.length; index++) {
            const element = this.elementList[index];
            element.setId(ids[index])
            element.posIdx = this.idx * GameConst.MaxRow + index;
        }
    }

    /**开始转动 */
    startRoll() {
        tween(this.node)
            .by(0.1, { position: v3(0, 20, 0) })
            .by(0.1, { position: v3(0, -20, 0) })
            .call(() => {
                this.state = RollState.start;
            })
            .start();
    }

    /**开始停止 */
    startStopRoll(datas: Array<number>) {
        Tween.stopAllByTarget(this.node)
        datas.forEach((v, i) => {
            let els = this.pushElement(v)
            els.addClickEvent();
            els.updateIcon(false)
            els.posIdx = this.idx * GameConst.MaxRow + i;
        })
        this.state = RollState.start_stop;
    }

    /**转动 */
    roll(dt: number) {
        let frist = this.elementList[0];
        if (!frist) {
            return;
        }
        let last = this.elementList[this.elementList.length - 1]
        let elementSize = frist.getSize()
        let uh = this.parent.getComponent(UITransform).contentSize.height / 2
        let fristPos = CocosUtil.convertSpaceAR(frist.node, this.parent)
        let lastPos = CocosUtil.convertSpaceAR(last.node, this.parent)
        let fristY = uh + (fristPos.y + elementSize.height / 2)
        let lastY = uh - (lastPos.y + elementSize.height / 2)
        if (fristY < 0) {//删除最下面元素
            EventCenter.getInstance().fire(GameEvent.game_axis_roll_frist_move_lowest, this.idx)
        }
        if (lastY > 0) {//添加元素到最上面
            if (this.state == RollState.start) {
                EventCenter.getInstance().fire(GameEvent.game_axis_roll_top_full_move_scene, this.idx)
            } else {
                this.node.position = this.node.position.add3f(0, lastY, 0)
                this.state = RollState.stop;
                this.onRollEnd();
                return
            }
        }
        this.node.position = this.node.position.add3f(0, this.rollSpeed, 0)
    }

    removeFrist() {
        return this.elementList.shift()
    }

    onRollEnd() {
        EventCenter.getInstance().fire(GameEvent.game_axis_ready_roll_end, this.idx)
        tween(this.node)
            .by(0.15, { position: v3(0, -20, 0) })
            .by(0.15, { position: v3(0, 20, 0) })
            .call(() => {
                EventCenter.getInstance().fire(GameEvent.game_axis_roll_end, this.idx)
            })
            .start();
    }

    update(dt: number) {
        switch (this.state) {
            case RollState.start:
                this.roll(dt)
                break;
            case RollState.start_stop:
                this.roll(dt)
                break;
            case RollState.stop:
                break;
        }
    }


}



