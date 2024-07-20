import { _decorator, Component, Label, Node } from 'cc';
import { EViewNames } from '../../configs/UIConfig';
import GameEvent from '../../event/GameEvent';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import { UIManager } from '../../kernel/compat/view/UImanager';
import EventCenter from '../../kernel/core/event/EventCenter';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import { BaseView } from '../../kernel/compat/view/BaseView';
import GameCtrl from '../../ctrls/GameCtrl';
import { PopupView } from '../../kernel/compat/view/PopupView';


const { ccclass, property } = _decorator;

@ccclass('UImoney')
export class UImoney extends PopupView {

    start() {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        CocosUtil.addClickEvent(this.m_ui.btn_close, function () {
            UIManager.closeView(EViewNames.UImoney);
        }, this);
        GameCtrl.getIns().reqGetBanlance((b) => {
            if (this?.node?.isValid) {
                this.m_ui.lb_money.getComponent(Label).string = "R$" + MoneyUtil.rmbStr(b)
                EventCenter.getInstance().fire(GameEvent.ui_req_loading_complete, this.node)
            }
        })
    }

}


