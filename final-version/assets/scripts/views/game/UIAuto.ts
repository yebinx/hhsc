import { _decorator, Button, Color, color, Component, Label, Node, ProgressBarComponent, Slider, Sprite, tween, UITransform, v3 } from 'cc';
import { BaseView } from '../../kernel/compat/view/BaseView';
import CocosUtil from '../../kernel/compat/CocosUtil';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameEvent from '../../event/GameEvent';
import { EViewNames } from '../../configs/UIConfig';
import { UIManager } from '../../kernel/compat/view/UImanager';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import { InitUIAutoInfo } from '../../models/GameModel';
import GameCtrl from '../../ctrls/GameCtrl';
import GameAudio from '../../mgrs/GameAudio';
import { PopupView } from '../../kernel/compat/view/PopupView';
const { ccclass, property } = _decorator;

@ccclass('UIAuto')
export class UIAuto extends PopupView {
    [x: string]: any;

    @property(Label)
    txtMoney: Label;
    @property(Label)
    txtBet: Label;
    @property(Label)
    txtAward: Label;
    @property(Node)
    bar: Node;
    @property(Node)
    bar2: Node;
    @property(Node)
    bar3: Node;
    @property(Node)
    slider1: Node;
    @property(Node)
    slider2: Node;
    @property(Node)
    slider3: Node;
    @property(Label)
    profitText: Label;
    @property(Label)
    profitText2: Label;
    @property(Label)
    profitText3: Label;
    @property(Label)
    btnMoreText: Label;

    private sel_color = color(255, 200, 36, 255);
    private unsel_color = color(111, 111, 120, 255);
    private hover_color = color(101, 87, 78, 255);
    private btnList = [10,30,50,80,1000]

    private _selectIdx: number = -1;
    private _baseBet = 0;
    private loseMoney = -1;
    private winMoney = -1;
    private maxMoney = -1;
    private startX = 0;

    start() {
        CocosUtil.addClickEvent(this.m_ui.btn_close, function () {
            UIManager.closeView(EViewNames.UIAuto);
            GameAudio.clickClose();
        }, this);
        CocosUtil.addClickEvent(this.m_ui.btn_start_auto, function () {
            if (this._selectIdx < 0) {
                return;
            }
            UIManager.closeView(EViewNames.UIAuto);
            GameAudio.clickClose();
            GameCtrl.getIns().openAutoRoll(this._selectIdx, this.loseMoney, this.winMoney, this.maxMoney, [this.loseMoney != -1, this.winMoney != -1, this.maxMoney != -1])
        }, this, null, 1.01);
        this.m_ui.btn_start_auto.getComponent(Button).interactable = false;
        // this.animAct()
        //this.initProgress();
    }

    initProfit(){
        this.bar.getComponent(UITransform).width = 0;
        this.bar2.getComponent(UITransform).width = 0;
        this.bar3.getComponent(UITransform).width = 0;
        this.profitText.string = this.profitText2.string = this.profitText3.string = "Nenhum";
        this.slider1.getComponent(Slider).progress = 0;
        this.slider2.getComponent(Slider).progress = 0;
        this.slider3.getComponent(Slider).progress = 0;
        this.loseMoney = -1;
        this.winMoney = -1;
        this.maxMoney = -1;
    }

    private setProfit(event){
        if(this._selectIdx == -1){
            this.slider1.getComponent(Slider).progress = 0;
            return
        }
        this.bar.getComponent(UITransform).width = event.progress * 670;
        let baseMax = this._baseBet * this.btnList[this._selectIdx];
        this.loseMoney = (baseMax/2) + Math.floor((event.progress * baseMax * 50)) / 100
        this.profitText.string = this.loseMoney.toFixed(2) + "";
    }

    private setProfit2(event){
        if(this._selectIdx == -1 || !this.slider2.parent.active){
            this.slider2.getComponent(Slider).progress = 0;
            return
        }
        this.bar2.getComponent(UITransform).width = event.progress * 670;
        let baseMax = this._baseBet * this.btnList[this._selectIdx];
        this.winMoney = (baseMax/2) + Math.floor((event.progress * baseMax * 50)) / 100
        this.profitText2.string = this.winMoney.toFixed(2) + "";
    }

    private setProfit3(event){
        if(this._selectIdx == -1 || !this.slider2.parent.active){
            this.slider3.getComponent(Slider).progress = 0;
            return
        }
        this.bar3.getComponent(UITransform).width = event.progress * 670;
        let baseMax = this._baseBet * this.btnList[this._selectIdx];
        this.maxMoney = (baseMax/2) + Math.floor((event.progress * baseMax * 50)) / 100
        this.profitText3.string = this.maxMoney.toFixed(2) + "";
    }

    onShowMore(event,isHide = false){
        if(this._selectIdx == -1){
            return
        }
        if(this.slider2.parent.active || isHide){
            this.node.getChildByName("aniRoot").getComponent(UITransform).height = 664
            this.btnMoreText.string = "Mais"
            this.slider2.parent.active = false
            this.slider3.parent.active = false
            this.winMoney = -1;
            this.maxMoney = -1;
        }else{
            this.node.getChildByName("aniRoot").getComponent(UITransform).height = 1000
            this.btnMoreText.string = "Ocultar"
            this.slider2.parent.active = true
            this.slider3.parent.active = true
            this.setProfit2({progress : this.slider2.getComponent(Slider).progress})  
            this.setProfit3({progress : this.slider3.getComponent(Slider).progress})   
        }
    }

    initData(data: InitUIAutoInfo) {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        this.txtMoney.string = MoneyUtil.rmbStr(data.balance);
        this.txtBet.string = MoneyUtil.rmbStr(data.curBetAmount);
        this.txtAward.string = MoneyUtil.rmbStr(data.lastWinAmount);
        this._baseBet = data.curBetAmount / 10000;
        this.selectTab(-1);
        this.initSelectNumTab(data.selectNums);
        this.initProfit();
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

    initSelectNumTab(nums: number[]) {
        for (let index = 0; index < nums.length; index++) {
            const element = nums[index];
            let lab = this.m_ui.tabs.children[index].getChildByName("Label").getComponent(Label);
            lab.string = element + "";
            CocosUtil.addClickEvent(this.m_ui.tabs.children[index], ()=>{
                this.selectTab(index)
                GameAudio.clickClose();
            }, this, index);
            this.initMouseEvent(this.m_ui.tabs.children[index], index)
        }
    }

    initMouseEvent(btn: Node, idx: number) {
        btn.on(Node.EventType.MOUSE_ENTER, function () {
            let lab = this.m_ui.tabs.children[idx].getChildByName("Label").getComponent(Label);
            if (this._selectIdx == idx) {
                lab.color = this.sel_color;
                return;
            }
            lab.color = this.hover_color;
        }, this);
        btn.on(Node.EventType.MOUSE_LEAVE, function () {
            let lab = this.m_ui.tabs.children[idx].getChildByName("Label").getComponent(Label);
            if (this._selectIdx == idx) {
                lab.color = this.sel_color;
                return;
            }
            lab.color = this.unsel_color;
        }, this);
    }

    selectTab(idx: number) {
        this._selectIdx = idx;
        this.setProfit({progress : this.slider1.getComponent(Slider).progress})
        this.setProfit2({progress : this.slider2.getComponent(Slider).progress})  
        this.setProfit3({progress : this.slider3.getComponent(Slider).progress})    
        for (let i = 0; i < 5; i++) {
            let lab = this.m_ui.tabs.children[i].getChildByName("Label").getComponent(Label);
            lab.color = i == idx && this.sel_color || this.unsel_color;
        }
        if (idx >= 0) {
            this.m_ui.btn_start_auto.getComponent(Button).interactable = true
        }
        let op1 = idx >= 0 ? 255 : 75
        let op2 = idx >= 0 ? 255 : 120
        this.m_ui.btn_start_auto.getComponent(Sprite).color = new Color(255, 200, 36, op1)
        
        // CocosUtil.setNodeOpacity(this.m_ui.btn_start_auto, idx>=0 && 255 || 80);
    }



}


