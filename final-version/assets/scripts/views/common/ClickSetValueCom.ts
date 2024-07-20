import { _decorator, Component, Label, Node } from 'cc';
import CocosUtil from '../../kernel/compat/CocosUtil';
const { ccclass, property } = _decorator;

@ccclass('ClickSetValueCom')
export class ClickSetValueCom extends Component {

    @property(Label)
    lab: Label;

    clickCallBack: Function;

    value: number = 0

    init(value: number, clickCallBack: Function) {
        CocosUtil.addClickEvent(this.node, this.onClickSelf, this)
        this.setValue(value)
        this.clickCallBack = clickCallBack;
    }

    setValue(value: number) {
        this.value = value;
        this.lab.string = value + ""
    }

    onClickSelf() {
        this.clickCallBack(this.value)
    }
}


