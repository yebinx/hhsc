export const DESIGN_SIZE = {
	width : 756,
	height : 1668
}

export const SHOT_SCREEN = {
	width : 1080,
	height : 1920
}

export const LONG_SCREEN = {
	width : 1080,
	height : 2440
}

export enum EUILayer {
    Panel,
    GameEff,
    Popup,
    Dialog,
    Tip,
    Loading,
}

//对话框样式
export enum EDialogType {
	ok = 1,			//只有确定按钮
	ok_cancel = 2,	//有确定和取消按钮
}

//对话框菜单ID
export enum EDialogMenuId {
	cancel,
	ok,
}

export class ParamConfirmDlg {
    dlgName?: string;
    content?: string;
    dlgType?: EDialogType;
    callback: (menuId:EDialogMenuId)=>void;
    thisObj?: any;
    title?: string|null = null;
    okTxt?: string|null = null;
    cancelTxt?: string|null = null;

    constructor(name:string, cont:string, dlgType:EDialogType, cbFunc:(menuId:EDialogMenuId)=>void, thisRef?:any) {
        this.dlgName = name;
        this.content = cont;
        this.dlgType = dlgType;
        this.callback = cbFunc;
        this.thisObj = thisRef;
    }
}
