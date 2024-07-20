import { _decorator, Component, Node } from 'cc';
import GameEvent from '../../event/GameEvent';
import CocosUtil from '../../kernel/compat/CocosUtil';
import EventCenter from '../../kernel/core/event/EventCenter';

const { ccclass, property } = _decorator;

@ccclass('CompDissItem')
export class CompDissItem extends Component {
    private _info: { dataArr: string[], item: Node };

    parent:Node;
    init(parent:Node){
        this.parent=parent
    }

    start() {
        CocosUtil.addClickEvent(this.node, function () {
            EventCenter.getInstance().fire(GameEvent.ui_show_hisdetail_tip, this.parent, this._info);
        }, this, null, 1.01);
    }

    setData(data: { dataArr: string[], item: Node }) {
        this._info = data;
    }
}


