import { _decorator, ScrollView, UITransform, v3, size, instantiate, Label, Node, Prefab } from "cc";
import { EViewNames } from "../../configs/UIConfig";
import { EDateType } from "../../define/GameConst";
import CocosUtil from "../../kernel/compat/CocosUtil";
import { BaseComp } from "../../kernel/compat/view/BaseComp";
import { UIManager } from "../../kernel/compat/view/UImanager";
import DateUtil from "../../kernel/core/utils/DateUtil";
import RecordMgr from "../../mgrs/RecordMgr";
import { BaseView } from "../../kernel/compat/view/BaseView";


const { ccclass, property } = _decorator;

const MAX_DAYS = 7;

@ccclass('UIDateSelect')
export class UIDateSelect extends BaseView {


    start() {
        this.node.on("REQUEST_CUSTOM_DATE_RECORD", this.onSelectData, this)
        let com = this.getComponent("SharedRecordCustomDate")
        if (com) {
            com["setDate"](this.node)
        }
    }

    onSelectData(startTimestamp, endTimestamp) {
        UIManager.closeView(EViewNames.UIselectdate)
        RecordMgr.getInstance().setFilter(startTimestamp, endTimestamp);
    }

    protected onDestroy(): void {
        UIManager.closeView(EViewNames.UIDateSelect)
    }

}


