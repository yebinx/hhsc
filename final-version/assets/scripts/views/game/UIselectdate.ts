import { _decorator, color, Component, Label, Node } from 'cc';
import { EViewNames } from '../../configs/UIConfig';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { EUILayer } from '../../kernel/compat/view/ViewDefine';
import RecordMgr from '../../mgrs/RecordMgr';


const { ccclass, property } = _decorator;

@ccclass('UIselectdate')
export class UIselectdate extends BaseComp {
    start() {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        CocosUtil.setModal(this.node, true);

        CocosUtil.addClickEvent(this.m_ui.btn_close, function(){
            UIManager.closeView(EViewNames.UIselectdate);
        }, this);
        
        CocosUtil.addClickEvent(this.m_ui.btn_selfdef, function(){
            UIManager.showView(EViewNames.UIDateSelect, EUILayer.Dialog);
        }, this);

        CocosUtil.addClickEvent(this.m_ui.btn_today, function(){
            RecordMgr.getInstance().setFilter(1,1);
            UIManager.closeView(EViewNames.UIselectdate);
        }, this);

        CocosUtil.addClickEvent(this.m_ui.btn_7day, function(){
            RecordMgr.getInstance().setFilter(7,7);
            UIManager.closeView(EViewNames.UIselectdate);
        }, this);

        let cur = RecordMgr.getInstance().filterFrom;
        this.m_ui.btn_7day.getChildByName("lb_title").getComponent(Label).color = cur==7 ? color(255,200,36,255) : color(255,255,255,160);
        this.m_ui.btn_today.getChildByName("lb_title").getComponent(Label).color = cur==1 ? color(255,200,36,255) : color(255,255,255,160);
        this.m_ui.btn_selfdef.getChildByName("lb_title").getComponent(Label).color = (cur!=1 && cur!=7) ? color(255,200,36,255) : color(255,255,255,160);
    }


}

