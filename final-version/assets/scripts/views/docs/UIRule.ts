import { _decorator, Component, Node } from 'cc';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { EViewNames } from '../../configs/UIConfig';
import { PopupView } from '../../kernel/compat/view/PopupView';
const { ccclass, property } = _decorator;

@ccclass('UIRule')
export class UIRule extends PopupView {
    start() {
        CocosUtil.traverseNodes(this.node, this.m_ui)
        CocosUtil.addClickEvent(this.m_ui.btn_close,()=>{
            UIManager.closeView(EViewNames.UIRule)
        },this)
    }


}


