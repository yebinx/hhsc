import { _decorator, Component, Node } from 'cc';
import { RollAxisCom } from './RollAxisCom';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameEvent from '../../event/GameEvent';
import { ElementLayer } from './ElementLayer';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import GameConst from '../../define/GameConst';
import { ObjPoolCom } from './ObjPoolCom';
import MathUtil from '../../kernel/core/utils/MathUtil';
import GameAudio from '../../mgrs/GameAudio';
const { ccclass, property } = _decorator;

@ccclass('ElementCtrl')
export class ElementCtrl extends BaseComp {


    rollCnt: number = 0;
    /*列滚动轴 */
    @property(RollAxisCom)
    rollAxisList: RollAxisCom[] = []

    randomElementIdList: number[] = []

    start() {
        this.initNetEvent()
    }

    private initNetEvent() {
        EventCenter.getInstance().listen(GameEvent.game_axis_roll_end, this.onAxisRollEnd, this);
        EventCenter.getInstance().listen(GameEvent.game_axis_roll_frist_move_lowest, this.onFristElementMoveLowest, this);
        EventCenter.getInstance().listen(GameEvent.game_axis_roll_top_full_move_scene, this.onTopElementMoveScene, this);
    }

    init(elementList: Array<Array<number>>) {
        this.restRandomElementList()
        for (let col = 0; col < elementList.length; col++) {
            let elementDatas = elementList[col];
            this.rollAxisList[col].init(col, this.getComponent(ElementLayer).node)
            for (let row = 0; row < elementDatas.length; row++) {
                const data = elementDatas[row]
                let el = this.rollAxisList[col].pushElement(data)
                el.posIdx = col * GameConst.MaxRow + row;
                el.addClickEvent();
                el.updateIcon(false)
            }
        }
    }

    /**开始转动 */
    startRoll(isFast) {
        this.rollCnt = 0;
        for (let index = 0; index < this.rollAxisList.length; index++) {
            this.rollCnt++;
            const element = this.rollAxisList[index];
            if (isFast) {
                element.startRoll()
            } else {
                this.scheduleOnce(() => {
                    element.startRoll()
                }, index * 0.2)
            }
        }
    }


    /**停止转动 */
    stopRoll(datas: Array<Array<number>>, isFast: boolean) {
        for (let index = 0; index < this.rollAxisList.length; index++) {
            const element = this.rollAxisList[index];
            if(isFast){
                this.unscheduleAllCallbacks();
                element.startStopRoll(datas[index])
            }else{
                this.scheduleOnce(() => {
                    element.startStopRoll(datas[index])
                }, index * 0.2)
            }
        }
    }

    changeElementId(datas: Array<Array<number>>) {
        for (let index = 0; index < this.rollAxisList.length; index++) {
            const element = this.rollAxisList[index];
            element.changeElementId(datas[index])
        }
    }

    onAxisRollEnd(idx: number) {
        this.rollCnt--;
        if (this.rollCnt <= 0) {
            EventCenter.getInstance().fire(GameEvent.game_roll_complete)
        }
    }

    getElementNode(col: number, row: number) {
        let axis = this.rollAxisList[col];
        if (axis) {
            return axis.elementList[row];
        }
    }

    onFristElementMoveLowest(col: number) {
        let axis = this.rollAxisList[col];
        if (axis) {
            let element = axis.removeFrist()
            if (element) {
                ObjPoolCom.objPoolMgr.delElement(element.node);
            }
        }
    }

    setRandomElementList(list: number[]) {
        this.randomElementIdList = list
    }

    restRandomElementList() {
        this.randomElementIdList = GameConst.ElementList;
    }

    onTopElementMoveScene(col: number) {
        let axis = this.rollAxisList[col];
        if (axis) {
            let min = 0
            let max = this.randomElementIdList.length;
            let idx = MathUtil.getRandomInt(min, max - 1)
            let element = axis.pushElement(this.randomElementIdList[idx])
            element.updateIcon(true)
        }
    }

    update(dt: number) {
        // this.rollAxisList.forEach(v => v.update(dt))
    }
}


