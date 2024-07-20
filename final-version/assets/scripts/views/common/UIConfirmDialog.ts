import { _decorator, Component, Label, Node, tween, v3 } from 'cc';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import { EDialogMenuId, ParamConfirmDlg, EDialogType } from '../../kernel/compat/view/ViewDefine';
import CommonUtil from '../../kernel/core/utils/CommonUtil';
import { BaseView } from '../../kernel/compat/view/BaseView';



const { ccclass, property } = _decorator;

@ccclass('ConfirmDialog')
export class ConfirmDialog extends BaseView {
    private _callback:Function = null;
	private _thisObj:any = null;

	onLoad() {
		CocosUtil.traverseNodes(this.node, this.m_ui);
		CocosUtil.addClickEvent(this.m_ui.btn_ok, this.onBtnOk, this);
		CocosUtil.addClickEvent(this.m_ui.btn_no, this.onBtnNo, this);
		let bg = this.node.getChildByName("bg");
		bg.scale = v3(1,1,1);
		tween(bg).delay(0.1).to(0.1,{scale:v3(1.08,1.08,1)}).to(0.08,{scale:v3(1,1,1)}).start();
	}

	private onBtnOk() {
		if(this._callback) {
			if(this._thisObj){
				this._callback.call(this._thisObj, EDialogMenuId.ok);
			} else {
				this._callback(EDialogMenuId.ok);
			}
		}
		CommonUtil.safeDelete(this);
	}

	private onBtnNo() {
		if(this._callback) {
			if(this._thisObj){
				this._callback.call(this._thisObj, EDialogMenuId.cancel);
			} else {
				this._callback(EDialogMenuId.cancel);
			}
		}
		CommonUtil.safeDelete(this);
	}

	
	public initData(info:ParamConfirmDlg) {
		this._callback = info.callback;
		this._thisObj = info.thisObj;
        CocosUtil.traverseNodes(this.node, this.m_ui);

		this.m_ui.lb_cont.getComponent(Label).string = info.content;

		if(info.title && this.m_ui.lb_title) {
			this.m_ui.lb_title.getComponent(Label).string = info.title;
		}

        if(info.okTxt) {
            this.m_ui.lb_ok.getComponent(Label).string = info.okTxt;
        }

        if(info.cancelTxt) {
            this.m_ui.lb_no.getComponent(Label).string = info.cancelTxt;
        }

		if(info.dlgType == EDialogType.ok) {
			this.m_ui.btn_no.active = false;
            let pos = this.m_ui.btn_ok.position;
			this.m_ui.btn_ok.setPosition(v3(0, pos.y, pos.z));
		}
	}
}


