import { _decorator, Component, instantiate, Label, Node, Prefab } from 'cc';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import StringUtil from '../../kernel/core/utils/StringUtil';
import { THhscRoundDetailInfo } from '../../interface/recorddetail';
import { HisElementItem } from './HisElementItem';
import { HisLineAward } from './HisLineAward';
import { CompDissItem } from './CompDissItem';
const { ccclass, property } = _decorator;




const Line2Pos = [
    [1, 4, 7],
    [0, 3, 6],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
]

@ccclass('CompHisPage')
export class CompHisPage extends BaseComp {
    @property(Node)
    ndElementParent: Node;
    @property(Prefab)
    prfElement: Prefab;
    @property(Prefab)
    prfAwardLine: Prefab
    @property(Node)
    ndIsAward: Node
    @property(Node)
    ndAwardLineParent: Node;

    protected onLoad(): void {
    }

    setData(data: THhscRoundDetailInfo, isHhsc: boolean, idx: number, len: number) {
        let labs: { [key: string]: Label } = {};
        CocosUtil.traverseNodes(this.node, this.m_ui)
        CocosUtil.traverseLabels(this.node, labs)
        let isShowHhscRestRoll = false//是否显示虎虎生财 重新旋转 的标题
        if (isHhsc) {
            isShowHhscRestRoll = !(idx == len - 1);//虎虎生财模式下 最后一次不需要显示这个 "重新旋转" 的标题
        }
        this.m_ui.nd_hhsc_reset_roll_tip.active = isShowHhscRestRoll
        labs.lb_order_no.string = StringUtil.lineStr(data.order_id) || ""; // 交易单号
        labs.lb_bet_num.string = data.bet_s || "0.00"; //投注
        labs.lb_profit_num.string = isHhsc && idx == 0 ? "-" + data.bet_s : (data.player_win_lose_s || "0.00"); //hhsc模式下 第一轮盈利显示为"-下注额"
        labs.lb_balance_num.string = data.balance_s || "0.00"; //余额
        labs.lb_betvalue.string = "投注大小 " + (data.bet_size_s || "0.00"); //投注大小
        labs.lb_betrate.string = "投注倍数 " + (data.bet_multiple || "0.00"); //投注倍数
        let isAwardPosList: number[] = [];
        this.ndIsAward.active = !data.prize_list || data.prize_list.length == 0;
        this.m_ui.nd_x10.active = data.multi_time == 10 && (idx == len - 1)

        if (data.prize_list) {
            for (let index = 0; index < data.prize_list.length; index++) {
                const element = data.prize_list[index];
                isAwardPosList.push(...Line2Pos[element.index - 1])
                if(!isShowHhscRestRoll){
                    let nd = instantiate(this.prfAwardLine)
                    let datas = [];
                    datas.push(data.bet_size_s);
                    datas.push(data.bet_multiple);
                    datas.push(element.rate);
                    if (data.multi_time == 10) { //x10倍 才显示
                        datas.push(data.multi_time);
                    }
                    let tmpdata = {
                        dataArr: datas,
                        item: nd,
                    }
                    nd.getComponent(CompDissItem).init(this.m_ui.last)
                    nd.getComponent(CompDissItem).setData(tmpdata)
                    nd.getComponent(HisLineAward).setData(element, index + 1)
                    this.ndAwardLineParent.addChild(nd)
                }
            }
        }
        for (let index = 0; index < data.item_type_list.length; index++) {
            const element = data.item_type_list[index];
            let item = instantiate(this.prfElement)
            item.getComponent(HisElementItem).setId(element)
            let isAward = isAwardPosList.indexOf(index) != -1
            if (isAward) {
                if(isHhsc && idx != len - 1){
                    item.getComponent(HisElementItem).setIsAward(2)
                }else{
                    item.getComponent(HisElementItem).setIsAward(1)
                }
            } else {
                item.getComponent(HisElementItem).setIsAward(0)
            }
            this.ndElementParent.addChild(item)
        }
    }
}


