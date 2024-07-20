import { _decorator, Component, Label, Node, UITransform, v3 } from 'cc';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { BaseComp } from '../../kernel/compat/view/BaseComp';

const { ccclass, property } = _decorator;

@ccclass('UIDetailTip')
export class UIDetailTip extends BaseComp {
    info: any;
    initData(info: { dataArr: string[], item: Node }) {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        this.info = info
        let datas = info.dataArr;
        let str = "";
        for (let i = 0; i < datas.length; i++) {
            if (i == datas.length - 1) {
                str += datas[i];
            } else {
                str += datas[i] + " x ";
            }
        }
        this.m_ui.lab_gongshi.getComponent(Label).string = str;
        if(datas.length == 3){
            this.m_ui.lb_tiptxt.getComponent(Label).string = "投注大小 X Nível de aposta X 符号赔付值";
        }else{
            this.m_ui.lb_tiptxt.getComponent(Label).string = "投注大小 X Nível de aposta X 符号赔付值 X 奖金倍数";
        }


        this.node.getChildByName("bg_corner4").active = false
        this.scheduleOnce(() => {
            this.node.getChildByName("bg_corner4").active = true
            let pos = CocosUtil.convertSpaceAR(info.item, this.node);
            pos.set(pos.x, pos.y - 116, pos.z);
            this.node.getChildByName("bg_corner4").setPosition(pos);
        }, 0.06);
    }

    start() {
        // let pos = CocosUtil.convertSpaceAR(this.info.item, this.node);
        // pos.set(pos.x, pos.y - 116, pos.z);
        // this.node.setPosition(pos);
        CocosUtil.addClickEvent(this.node, function () {
            this.node.active = false;
        }, this);
    }

}


