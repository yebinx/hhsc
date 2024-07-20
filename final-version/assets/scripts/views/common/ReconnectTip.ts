import { _decorator, Component, Label, Node } from 'cc';
import { BaseView } from '../../kernel/compat/view/BaseView';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameEvent from '../../event/GameEvent';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { EViewNames } from '../../configs/UIConfig';
import { setTimeout } from 'timers/promises';
const { ccclass, property } = _decorator;

@ccclass('ReconnectTip')
export class ReconnectTip extends BaseView {

    onLoad(): void {
        CocosUtil.traverseNodes(this.node, this.m_ui)
        this.onAutoCloseSelf();
    }


    start() {
        EventCenter.getInstance().listen(GameEvent.reconnect_tip, this.onUpdateTip, this)
        EventCenter.getInstance().listen(GameEvent.reconnect_tip_close, this.onCloseSelf, this)
    }

    onAutoCloseSelf() {
        this.scheduleOnce(() => {
            this.onCloseSelf()
        }, 2)
    }

    onCloseSelf() {
        UIManager.closeView(EViewNames.ReconnectTip)
    }

    initData(cnt: number): void {
        this.onUpdateTip(cnt)
    }

    onUpdateTip(cnt: number) {
        this.m_ui.tip.getComponent(Label).string = `网络繁忙，正在重试...第${cnt}次`
    }
}


