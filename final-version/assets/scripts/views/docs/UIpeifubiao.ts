import { _decorator, Component, Node } from 'cc';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import { EViewNames } from '../../configs/UIConfig';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { PopupView } from '../../kernel/compat/view/PopupView';
const { ccclass, property } = _decorator;

@ccclass('UIpeifubiao')
export class UIpeifubiao extends PopupView {
    start() {
        CocosUtil.traverseNodes(this.node, this.m_ui)
        CocosUtil.addClickEvent(this.m_ui.btn_close, () => {
            UIManager.closeView(EViewNames.UIpeifubiao)
        }, this)
    }
}


