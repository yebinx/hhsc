import { _decorator, Label, instantiate, UITransform, tween, v3, NodeEventType, EventTouch, Node, Button } from "cc";
import { EViewNames } from "../../configs/UIConfig";
import GameConst from "../../define/GameConst";
import GameEvent from "../../event/GameEvent";
import CocosUtil from "../../kernel/compat/CocosUtil";
import { BaseComp } from "../../kernel/compat/view/BaseComp";
import { UIManager } from "../../kernel/compat/view/UImanager";
import CHandler from "../../kernel/core/datastruct/CHandler";
import EventCenter from "../../kernel/core/event/EventCenter";
import MoneyUtil from "../../kernel/core/utils/MoneyUtil";
import { CompBetScroll } from "./CompBetScroll";
import GameCtrl from "../../ctrls/GameCtrl";
import { BaseGoldInfo } from "../../models/GameModel";
import { BaseView } from "../../kernel/compat/view/BaseView";
import GameAudio from "../../mgrs/GameAudio";
import { PopupView } from "../../kernel/compat/view/PopupView";


const { ccclass, property } = _decorator;
@ccclass('UIBetSetting')
export class UIBetSetting extends PopupView {
    @property(Label)
    txtMoney: Label;
    @property(Label)
    txtBet: Label;
    @property(Label)
    txtAward: Label;

    isSelectMax: boolean = false;

    private curSelectBetId: number = 0;

    initData(data: BaseGoldInfo) {
        this.txtMoney.string = "R$" + MoneyUtil.rmbStr(data.balance);
        this.txtBet.string = "R$" + MoneyUtil.rmbStr(data.curBetAmount);
        this.txtAward.string = "R$" + MoneyUtil.rmbStr(data.lastWinAmount);
    }

    protected onLoad(): void {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        // CocosUtil.setModal(this.node, true);
        EventCenter.getInstance().listen(GameEvent.game_update_player_blance, function (amount: number) {
            this.txtMoney.string = MoneyUtil.rmbStr(amount);
        }, this);
        EventCenter.getInstance().listen(GameEvent.comp_bet_scroll_opt_start, () => {
            this.onOpt(true)
        }, this);
        EventCenter.getInstance().listen(GameEvent.comp_bet_scroll_opt_end, () => {
            this.onOpt(false)
        }, this);

        this.initLists();
    }

    start() {
        // let betValue = GameMgr.getInstance()._betGold;
        let idx = GameCtrl.getIns().getModel().getCurBetId();
        let info = GameCtrl.getIns().getModel().getBetIdInfo(idx);
        let amountIdx = GameCtrl.getIns().getModel().getBetAmountIdx(info.bet_size / GameConst.BeseGold)
        let rateIdx = GameCtrl.getIns().getModel().getBetMultipleIdx(info.bet_multiple)
        this.m_ui.list_daxiao.getComponent(CompBetScroll).scrollToIndex(amountIdx + 1, false);
        this.m_ui.list_beishu.getComponent(CompBetScroll).scrollToIndex(rateIdx + 1, false);
        this.curSelectBetId = idx;


        let lenTotalAmount = GameCtrl.getIns().getModel().optionalTotalAmountLists.length
        let info1 = GameCtrl.getIns().getModel().getBetInfoByTotal(GameCtrl.getIns().getModel().optionalTotalAmountLists[lenTotalAmount - 1] * GameConst.BeseGold)
        this.isSelectMax = info1.id == this.curSelectBetId
        this.initUIEvent();

        this.refreshBettotal(false);

        // this.enabledButton(this.m_ui.btn_maxbet, !this.isSelectMax)
        // this.animAct()

        // GameUtil.showAni(this.node);
    }

    private initUIEvent() {
        CocosUtil.addClickEvent(this.m_ui.btn_close, function () {
            GameAudio.clickClose();
            UIManager.closeView(EViewNames.UIBetSetting);
        }, this);
        CocosUtil.addClickEvent(this.m_ui.btn_maxbet, this.onBtnMaxbet, this);
        CocosUtil.addClickEvent(this.m_ui.btn_sure, this.onBtnSure, this);
    }

    private onBtnMaxbet() {
        let lenBetAmount = GameCtrl.getIns().getModel().optionalBetAmountLists.length
        let lenTotalAmount = GameCtrl.getIns().getModel().optionalTotalAmountLists.length
        let lenMultiple = GameCtrl.getIns().getModel().optionalMultipleLists.length
        this.m_ui.list_daxiao.getComponent(CompBetScroll).scrollToIndex(lenBetAmount);
        this.m_ui.list_beishu.getComponent(CompBetScroll).scrollToIndex(lenMultiple);
        this.m_ui.list_bettotal.getComponent(CompBetScroll).scrollToIndex(lenTotalAmount);
        let info = GameCtrl.getIns().getModel().getBetInfoByTotal(GameCtrl.getIns().getModel().optionalTotalAmountLists[lenTotalAmount - 1] * GameConst.BeseGold)
        this.curSelectBetId = info.id
        GameAudio.clickClose();
        this.isSelectMax = true
        this.enabledButton(this.m_ui.btn_maxbet, false)
        // this.refreshBettotal(true)
    }

    onOpt(isOpt: boolean) {
        this.enabledButton(this.m_ui.btn_sure, !isOpt)
        this.enabledButton(this.m_ui.btn_close, !isOpt)
        if (!isOpt) {
            this.enabledButton(this.m_ui.btn_maxbet, !this.isSelectMax)
        } else {
            this.enabledButton(this.m_ui.btn_maxbet, !isOpt)
        }
    }

    enabledButton(node: Node, enabled: boolean) {
        node.getComponent(Button).interactable = enabled;
        CocosUtil.setNodeOpacity(node, enabled ? 255 : 110)
    }

    private onBtnSure() {
        let nd = this.m_ui.list_bettotal.getComponent(CompBetScroll).getMidNode();
        let v = nd["_logic_value"];
        GameCtrl.getIns().switchBetId(this.curSelectBetId)
        UIManager.closeView(EViewNames.UIBetSetting);
        GameAudio.clickClose();
    }

    initLists() {
        let optionalBetAmountLists = GameCtrl.getIns().getModel().optionalBetAmountLists
        let optionalTotalAmountLists = GameCtrl.getIns().getModel().optionalTotalAmountLists
        let optionalMultipleLists = GameCtrl.getIns().getModel().optionalMultipleLists
        let contNode = this.m_ui.cont_daxiao;
        for (let v of optionalBetAmountLists) {
            let item = instantiate(contNode.children[0]);
            item.children[0].getComponent(Label).string = "R$" + MoneyUtil.formatGold(v);
            contNode.addChild(item);
            item["_logic_value"] = v;
        }
        contNode.addChild(instantiate(contNode.children[0]));
        this.m_ui.list_daxiao.getComponent(CompBetScroll).setTouchCb(new CHandler(this, function (curMidIndex, curMidNode) {
            this.refreshBettotal();
        }));

        contNode = this.m_ui.cont_beishu;
        for (let v of optionalMultipleLists) {
            let item = instantiate(contNode.children[0]);
            item.children[0].getComponent(Label).string = "" + v;
            contNode.addChild(item);
            item["_logic_value"] = v;
        }
        contNode.addChild(instantiate(contNode.children[0]));
        this.m_ui.list_beishu.getComponent(CompBetScroll).setTouchCb(new CHandler(this, function (curMidIndex, curMidNode) {
            this.refreshBettotal();
        }));

        contNode = this.m_ui.cont_bettotal;
        for (let index = 0; index < optionalTotalAmountLists.length; index++) {
            const v = optionalTotalAmountLists[index];
            let item = instantiate(contNode.children[0]);
            // item.getChildByName("touch").on(NodeEventType.TOUCH_MOVE, (event: EventTouch) => {
            //     event.propagationStopped=true
            // }, this)
            // item.getChildByName("touch").on(NodeEventType.TOUCH_END, (event: EventTouch) => {
            //     event.propagationStopped=true
            //     event.preventSwallow = false
            //     this.onClickTotalAmountItem(index)
            // }, this)
            item.children[0].getComponent(Label).string = "R$" + MoneyUtil.formatGold(v);
            contNode.addChild(item);
            item["_logic_value"] = v;
        }
        contNode.addChild(instantiate(contNode.children[0]));
        this.m_ui.list_bettotal.getComponent(CompBetScroll).setTouchCb(new CHandler(this, this.onEndBetTotal));
    }

    // onClickTotalAmountItem(idx: number) {
    //     let curIdx1 = this.m_ui.list_bettotal.getComponent(CompBetScroll).getMidIndex()
    //     let curIdx = this.m_ui.list_bettotal.getComponent(CompBetScroll).curMidIndex
    //     console.log("d", curIdx1, curIdx, idx)
    //     if (curIdx <idx) {
    //         let offsetIdx = (idx + 2)
    //         this.m_ui.list_bettotal.getComponent(CompBetScroll).scrollToIdx(0, true)
    //     } else {
    //         let offsetIdx = (idx - 1)
    //         this.m_ui.list_bettotal.getComponent(CompBetScroll).scrollToIdx(0, true)
    //     }
    // }

    private onEndBetTotal(curMidIndex, curMidNode) {
        // let gongshi = GameConst.findGongShi(curMidNode["_logic_value"]);
        let value = curMidNode["_logic_value"] * GameConst.BeseGold
        let info = GameCtrl.getIns().getModel().getBetInfoByTotal(value)
        let amountIdx = GameCtrl.getIns().getModel().getBetAmountIdx(info.bet_size / GameConst.BeseGold)
        let rateIdx = GameCtrl.getIns().getModel().getBetMultipleIdx(info.bet_multiple)
        this.m_ui.list_daxiao.getComponent(CompBetScroll).scrollToIndex(amountIdx + 1, true);
        this.m_ui.list_beishu.getComponent(CompBetScroll).scrollToIndex(rateIdx + 1, true);
        this.curSelectBetId = info.id;
        let lenTotalAmount = GameCtrl.getIns().getModel().optionalTotalAmountLists.length
        let info1 = GameCtrl.getIns().getModel().getBetInfoByTotal(GameCtrl.getIns().getModel().optionalTotalAmountLists[lenTotalAmount - 1] * GameConst.BeseGold)
        this.isSelectMax = info1.id == this.curSelectBetId
        this.enabledButton(this.m_ui.btn_maxbet, !this.isSelectMax)
    }

    animAct() {
        let size = this.m_ui.bg.getComponent(UITransform).contentSize
        this.m_ui.bg.position = v3(0, -size.height, 0)
        this.m_ui.content.active = false;
        tween(this.m_ui.bg)
            .by(0.2, { position: v3(0, size.height, 0) })
            .call(() => {
                this.m_ui.content.active = true;
            })
            .start()
    }

    private refreshBettotal(bAni: boolean = true) {
        let idx1 = this.m_ui.list_daxiao.getComponent(CompBetScroll).getMidIndex();
        let idx2 = this.m_ui.list_beishu.getComponent(CompBetScroll).getMidIndex();
        let betAmount = GameCtrl.getIns().getModel().optionalBetAmountLists[idx1 - 1]
        let betRate = GameCtrl.getIns().getModel().optionalMultipleLists[idx2 - 1]
        let betInfo = GameCtrl.getIns().getModel().getBetInfoByAmount(betAmount * GameConst.BeseGold, betRate)
        let totalIdx = GameCtrl.getIns().getModel().getBetTotalIdx(betInfo.total_bet / GameConst.BeseGold)
        this.m_ui.list_bettotal.getComponent(CompBetScroll).scrollToIndex(totalIdx + 1, bAni);
        this.curSelectBetId = betInfo.id
        let lenTotalAmount = GameCtrl.getIns().getModel().optionalTotalAmountLists.length
        let info1 = GameCtrl.getIns().getModel().getBetInfoByTotal(GameCtrl.getIns().getModel().optionalTotalAmountLists[lenTotalAmount - 1] * GameConst.BeseGold)
        this.isSelectMax = info1.id == this.curSelectBetId
        this.enabledButton(this.m_ui.btn_maxbet, !this.isSelectMax)
        // let v = mid1["_logic_value"] * mid2["_logic_value"] * GameConst.BaseBet;
        // v = Math.round(v*100) / 100;
        // let idx = GameConst.gongshiIndex(v);
        // this.m_ui.list_bettotal.getComponent(CompBetScroll).scrollToIndex(idx+1, bAni);
    }

}


