import { _decorator, color, Component, instantiate, Label, Node, Prefab, Tween, tween, UITransform, v3 } from 'cc';
import { EViewNames } from '../../configs/UIConfig';
import GameEvent from '../../event/GameEvent';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import { UIManager } from '../../kernel/compat/view/UImanager';
import CHandler from '../../kernel/core/datastruct/CHandler';
import EventCenter from '../../kernel/core/event/EventCenter';
import MathUtil from '../../kernel/core/utils/MathUtil';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import RecordMgr from '../../mgrs/RecordMgr';
import { CompHisPage } from './CompHisPage';
import Routes from '../../define/Routes';
import { THhscRecordDetailInfo, THhscRecordDetailRsp, THhscRoundDetailInfo } from '../../interface/recorddetail';
import { ServerResult } from '../../interface/common';
import { UIDetailTip } from './UIDetailTip';
import { PopupView } from '../../kernel/compat/view/PopupView';
import { UIActionEx } from '../common/UIActionEx';



const { ccclass, property } = _decorator;


@ccclass('UIHisDetail')
export class UIHisDetail extends PopupView {
    private _ddIndex: number = 0;
    @property(Prefab)
    prfPage: Prefab;
    private _param;

    private _curIdx: number = 0;
    private _detailData: THhscRoundDetailInfo[] = null;
    private _data: THhscRecordDetailInfo = null;
    private _expanded: boolean = false;

    private curcloneTip: Node;

    pages: Node[] = [];

    _initedFL: boolean = false;

    private setExpanded(bExp: boolean) {
        this._expanded = bExp;
        this.m_ui.expand_arrow.scale = v3(1, bExp && -1 || 1, 1)
        if (bExp) {
            this.m_ui.pan_frees.active = bExp;
            tween(this.m_ui.pan_frees)
                .to(0.4, { position: v3(0, -64, 0) })
                .start()
            this.initFreeList()
            this.highSelect();
        } else {
            tween(this.m_ui.pan_frees)
                .to(0.4, { position: v3(0, 1574, 0) })
                .call(() => {
                    this.m_ui.pan_frees.active = bExp;
                })
                .start()
        }
    }

    private highSelect() {
        for (let i = 0; i < this.m_ui.cont_frees.children.length; i++) {
            let ddd = this.m_ui.cont_frees.children[i];
            if (i == this._curIdx) {
                ddd.getChildByName("lb_free_rmn").getComponent(Label).color = color(255, 200, 36, 255);
                ddd.getChildByName("lb_free_gld").getComponent(Label).color = color(255, 200, 36, 255);
            } else {
                ddd.getChildByName("lb_free_rmn").getComponent(Label).color = color(255, 255, 255, 255);
                ddd.getChildByName("lb_free_gld").getComponent(Label).color = color(255, 255, 255, 255);
            }
        }
    }

    initData(data) {
        this._data = data;
    }

    protected onLoad(): void {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        this.m_ui.btn_pre.active = false;
        this.m_ui.btn_next.active = false;
        this.setExpanded(false);
    }

    // async before(args) {
    //     return new Promise(async res => {
    //         if (this.isAnim) {
    //             CocosUtil.traverseNodes(this.node, this.m_ui)
    //             let aniRoot = this.m_ui.aniRoot
    //             if (aniRoot) {
    //                 // aniRoot.getComponent(Widget).enabled = false;
    //                 // let size = this.node.parent.getComponent(UITransform).contentSize
    //                 // this.node.getComponent(UITransform).contentSize = size
    //                 // aniRoot.getChildByName("UIViewAni").getComponent(UITransform).contentSize = size

    //                 await CocosUtil.wait(0.01)
    //                 await UIActionEx.runAction(aniRoot, this.uiAction)
    //                 // aniRoot.getComponent(Widget).enabled = true;
    //                 // aniRoot.getComponent(Widget).updateAlignment();
    //                 res(null)
    //             }
    //         } else {
    //             res(null)
    //         }
    //     })
    // }

    start() {
        this.m_ui.detailBG.on(Node.EventType.TOUCH_END, () => {
            this.m_ui.detailBG.active = false;
            if (this.curcloneTip && this.curcloneTip.isValid) {
                this.curcloneTip.destroy()
                this.curcloneTip = null;
            }
        })
        CocosUtil.addClickEvent(this.m_ui.btn_close, function () {
            // let bg = this.node.getChildByName("bg");
            // tween(bg).to(0.3, { position: v3(756, 0, 0) })
            //     .call(() => {
            //     })
            //     .start();
            UIManager.closeView(EViewNames.UIHisDetail);
        }, this);

        CocosUtil.addClickEvent(this.m_ui.btn_pre, () => {
            let idx = this._curIdx
            idx--;
            if (idx < 0) {
                idx = 0
            }
            this.turnPage(idx)
        }, this);

        CocosUtil.addClickEvent(this.m_ui.btn_next, () => {
            let idx = this._curIdx
            idx++;
            if (idx > this._detailData.length - 1) {
                idx = this._detailData.length - 1
            }
            this.turnPage(idx)
        }, this);

        CocosUtil.addClickEvent(this.m_ui.btn_expand, () => {
            if (this._detailData.length <= 1) {
                return;
            }
            this.setExpanded(!this._expanded);
        }, this);

        CocosUtil.addClickEvent(this.m_ui.btnClosePanFree, () => {
            this.setExpanded(false);
        }, this);

        // EventCenter.getInstance().listen(Routes.req_hisdetail, (info: ServerResult<THhscRecordDetailRsp>) => {
        //     this.onDetailData(info.data.list[0]);
        // }, this);
        EventCenter.getInstance().listen(GameEvent.ui_show_hisdetail_tip, this.onShowDetailTip, this);
    }

    async before(data) {
        let datas = await Promise.all([
            new Promise(async res => {
            if (this.isAnim) {
                    // CocosUtil.traverseNodes(this.node, this.m_ui)
                    let aniRoot = this.m_ui.aniRoot
                    if (aniRoot) {
                        await UIActionEx.runAction(aniRoot, this.uiOpenAction)
                        res(null)
                    }
                } else {
                    res(null)
                }
            }), 
            RecordMgr.getInstance().pullDetail(data.order_id)
        ])
        this.onDetailData(datas[1]);
        EventCenter.getInstance().fire(GameEvent.ui_req_loading_complete, this.node)
    }

    private onShowDetailTip(uiNode: Node, info: { dataArr: string[], item: Node }) {
        if (this.curcloneTip && this.curcloneTip.isValid) {
            return;
        }
        this.m_ui.detailBG.active = true;
        let cloneTip = instantiate(this.m_ui.detailBG.getChildByName("UIDetailTip"))
        cloneTip.active = true;
        this.curcloneTip = cloneTip;
        cloneTip.getComponent(UIDetailTip).initData(info)
        uiNode.addChild(cloneTip)
    }

    private onDetailData(detailInfo: THhscRecordDetailInfo) {
        this._detailData = detailInfo.round_list
        if(!this._detailData){
            return;
        }
        console.log("-----detail", this._ddIndex, this._detailData);
        let curData = this._detailData[this._ddIndex];
        if (!curData) {
            return
        }
        this.m_ui.expand_arrow.active = this._detailData.length > 1;
        let tstr = detailInfo.create_time + " (GMT+8:00)";
        this.m_ui.lb_title_filter.getComponent(Label).string = tstr;
        this.initPages();
        this.selectPage(0);
    }

    private initPages() {
        let content = this.m_ui.pages;
        let dataArr = this._detailData;
        let len = dataArr.length;
        this.pages.forEach(v => v.destroy())
        this.pages.length = 0;
        for (let i = 0; i < len; i++) {
            let one = instantiate(this.prfPage);
            // one.setPosition(v3(756 * i, 0, 0));
            one.active = true;
            content.addChild(one);
            this.pages[i] = one;
            this.refreshPageData(i, len);
        }
    }

    private initFreeList() {
        if (this._initedFL) { return; }
        this._initedFL = true;
        let total = this._detailData.length - 1;
        for (let i = 0; i < this._detailData.length; i++) {
            let ddd = this.m_ui.cont_frees.children[i];
            let gold = 0;
            if (!ddd) {
                ddd = instantiate(this.m_ui.cont_frees.children[0]);
                ddd.parent = this.m_ui.cont_frees;
                ddd.getChildByName("lb_free_rmn").getComponent(Label).string = "重新旋转: " + i + "/" + total;
                gold = MoneyUtil.rmbYuan(this._detailData[i].prize);
            } else {
                ddd.getChildByName("lb_free_rmn").getComponent(Label).string = "Rotação normal";
                gold = MoneyUtil.rmbYuan(this._detailData[i].player_win_lose);
            }

            let fuhao = gold < 0 ? "-" : "";
            ddd.getChildByName("lb_free_gld").getComponent(Label).string = fuhao + "R$" + MoneyUtil.formatGold(Math.abs(gold));

            CocosUtil.addClickEvent(ddd, () => {
                this.selectPage(i);
                this.setExpanded(false);
                this.highSelect();
            }, this, i, 0.96);
        }
    }

    setTitleName() {
        let curDetailData = this._detailData[this._curIdx];
        if (curDetailData) {
            let len = this._detailData.length - 1;
            let curIdx = this._curIdx
            if (this._curIdx == 0) {
                this.m_ui.lb_title.getComponent(Label).string = "Rotação normal";
            } else {
                this.m_ui.lb_title.getComponent(Label).string = "重新旋转: " + curIdx + "/" + len;
            }
        }
    }

    private refreshPageData(pageIdx: number, len: number) {
        if (!this._detailData) { return; }
        let content = this.m_ui.pages;
        content.children[pageIdx].getComponent(CompHisPage).setData(this._detailData[pageIdx], len > 1, pageIdx, len);
    }

    private turnPage(nextIdx: number) {
        let curIdx = this._curIdx;
        this.pages.forEach(v => {
            Tween.stopAllByTarget(v);
            v.active = false
        })
        let curPage = this.pages[curIdx];
        let nextPage = this.pages[nextIdx];
        curPage.active = true
        nextPage.active = true
        if (nextIdx > curIdx) {
            let width = curPage._uiProps.uiTransformComp.contentSize.width
            curPage.position = curPage.position.set(0, curPage.position.y, curPage.position.z)
            nextPage.position = nextPage.position.set(width, nextPage.position.y, nextPage.position.z)
            tween(curPage).by(0.2, { position: v3(-width, 0, 0) }).start();
            tween(nextPage).by(0.2, { position: v3(-width, 0, 0) }).start();
        } else {
            let curPage = this.pages[curIdx];
            let nextPage = this.pages[nextIdx];
            let width = curPage._uiProps.uiTransformComp.contentSize.width
            curPage.position = curPage.position.set(0, curPage.position.y, curPage.position.z)
            nextPage.position = nextPage.position.set(-width, nextPage.position.y, nextPage.position.z)
            tween(curPage).by(0.2, { position: v3(width, 0, 0) }).start();
            tween(nextPage).by(0.2, { position: v3(width, 0, 0) }).start();
        }
        this._curIdx = nextIdx;
        this.m_ui.btn_pre.active = this._curIdx != 0;
        this.m_ui.btn_next.active = this._curIdx != this._detailData.length - 1;
        this.setTitleName()
    }

    private selectPage(idx: number) {
        let page = this.pages[idx];
        if (!page) {
            return;
        }
        this.pages.forEach(v => {
            Tween.stopAllByTarget(v);
            v.active = false
        })
        page.active = true;
        this._curIdx = idx;
        this.m_ui.btn_pre.active = this._curIdx != 0;
        this.m_ui.btn_next.active = this._curIdx != this._detailData.length - 1;
        page.position = page.position.set(0, page.position.y, page.position.z)
        this.setTitleName()
    }
}


