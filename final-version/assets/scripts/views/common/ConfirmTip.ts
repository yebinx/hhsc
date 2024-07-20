import { _decorator, Component, Label, Node, tween, v3 } from 'cc';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import { EDialogMenuId, ParamConfirmDlg, EDialogType } from '../../kernel/compat/view/ViewDefine';
import CommonUtil from '../../kernel/core/utils/CommonUtil';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { EViewNames } from '../../configs/UIConfig';
import { BaseView } from '../../kernel/compat/view/BaseView';



const { ccclass, property } = _decorator;

@ccclass('ConfirmTip')
export class ConfirmTip extends BaseView {
	private _callback: Function = null;
	private _thisObj: any = null;

	onLoad() {
		CocosUtil.traverseNodes(this.node, this.m_ui);
		CocosUtil.addClickEvent(this.m_ui.btn_ok, this.onBtnOk, this);
	}

	private onBtnOk() {
		if (this._callback) {
			if (this._thisObj) {
				this._callback.call(this._thisObj, EDialogMenuId.ok);
			} else {
				this._callback(EDialogMenuId.ok);
			}
		}
		UIManager.closeView(EViewNames.UIConfirmTip)
	}

	public initData(info: ParamConfirmDlg) {
		this._callback = info.callback;
		this._thisObj = info.thisObj;

		this.m_ui.lb_cont.getComponent(Label).string = info.content;

		if (info.title && this.m_ui.lb_title) {
			this.m_ui.lb_title.getComponent(Label).string = info.title;
		}

		if (info.okTxt) {
			this.m_ui.lb_ok.getComponent(Label).string = info.okTxt;
		}
	}
}


