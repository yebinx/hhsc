import { _decorator, CCBoolean, ccenum, Component, Enum, Label, Node, tween, UITransform, v3, Widget } from 'cc';
import { BaseComp } from './BaseComp';
import { BaseView } from './BaseView';
import CocosUtil from '../CocosUtil';
import { EUIAction, UIActionEx } from '../../../views/common/UIActionEx';
import Adaptor from './Adaptor';

const { ccclass, property } = _decorator;


@ccclass('PopupView')
export class PopupView extends BaseView {

    @property(CCBoolean)
    isAnim: Boolean = false;

    @property({
        type: EUIAction,
        visible: function () {
            return this.isAnim
        },
    })
    uiOpenAction: number = EUIAction.None

    @property({
        type: EUIAction,
        visible: function () {
            return this.isAnim
        },
    })
    uiCloseAction: number = EUIAction.None



    protected onLoad(): void {
        CocosUtil.traverseNodes(this.node, this.m_ui)
    }

    async before(...args) {
        return new Promise(async res => {
            if (this.isAnim) {
                let aniRoot = this.m_ui.aniRoot
                if (aniRoot) {
                    Adaptor.deepUpdateAlignment(aniRoot)
                    let widget = aniRoot.getComponent(Widget)
                    if (widget) {
                        widget.enabled = false;
                    }
                    await UIActionEx.runAction(aniRoot, this.uiOpenAction)
                    if (widget) {
                        widget.enabled = true;
                    }
                }
            } else {
                res(null)
            }
        })
    }

    async closeBefore(): Promise<void> {
        return new Promise(async res => {
            if (this.isAnim) {
                let aniRoot = this.m_ui.aniRoot
                if (aniRoot) {
                    let widget = aniRoot.getComponent(Widget)
                    if (widget) {
                        widget.enabled = false;
                    }
                    // await CocosUtil.wait(0.01)
                    await UIActionEx.runCloseAction(aniRoot, this.uiCloseAction)

                    res(null)
                }
            } else {
                res(null)
            }
        })
    }

}