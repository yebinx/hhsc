import { _decorator, Component, Node, ProgressBar, Label, resources, AssetManager, Vec3, tween, v3, color, assetManager, Color, Sprite, UITransform, Size, size } from 'cc';
import { EViewNames } from '../../configs/UIConfig';
import LoginCtrl from '../../ctrls/LoginCtrl';
import GameEvent from '../../event/GameEvent';
import CocosUtil from '../../kernel/compat/CocosUtil';
import LoadHelper from '../../kernel/compat/load/LoadHelper';
import { BaseView } from '../../kernel/compat/view/BaseView';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { CompColorBlur } from '../../kernel/compat/view/comps/CompColorBlur';
import EventCenter from '../../kernel/core/event/EventCenter';
import MathUtil from '../../kernel/core/utils/MathUtil';
import GameCtrl from '../../ctrls/GameCtrl';


const tip_notes = [
    //"登录失败，系统正在重试... （第 X 次）",
    "Atualize para o dispositivo mais recente para desfrutar da malhor\nexperiencia de jogo!",
    "Os jogos carregados anteriormente carregam mais rapidamente a partir da cache do navegador!",
    "Desative paginas inativas e disponibilize mais recursos!",
    "Feche as páginas ociosas, me dê mais espaço, e te darei mais surpresas!",
    "Recursos de jogos em alta definição podem ser um pouco pesados,\né recomendável pré-carregar em uma rede Wi-Fi!",
]

const { ccclass, property } = _decorator;

@ccclass('LoadinView')
export class LoadinView extends BaseView {
    @property(Sprite)
    spBar: Sprite;
    @property(Label)
    txtProgress: Label;
    @property(Label)
    txtTip: Label;
    @property(Node)
    ndEffect: Node = null;

    @property(Node)
    mask: Node;
    @property(Node)
    ndBar1: Node;
    @property(Node)
    ndBar2: Node;

    @property(Node)
    btn_entergame: Node;

    private _hasGameLoaded: boolean = false;
    private _hasDocLoaded: boolean = false;
    curLoadProgress: number = 0;
    curTipIndex: number = 0;
    originPos: Vec3 = null;

    protected onLoad(): void {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        this.btn_entergame.active = false;
        this.setCurLoadBar(0.1);
    }

    start() {
        let domSvg = document.getElementById("initial-loader");
        if(domSvg){
            domSvg.remove();
        }
        
        EventCenter.getInstance().listen(GameEvent.user_login_fail, this.onLoginFail, this);
        EventCenter.getInstance().listen(GameEvent.user_login_succ, this.onLoginSucc, this);

        CocosUtil.addClickEvent(this.m_ui.btn_entergame, this.onBtnEntergame, this)

        let pos = this.txtTip.node.position;
        this.originPos = v3(pos.x, pos.y, pos.z);
        MathUtil.shuffle(tip_notes);
        this.ndBar2.position = v3(-430, 0, 0)
        this.ndBar1.position = v3(0, 0, 0)

        this.txtTip.node.addComponent(CompColorBlur);
        this.txtTip.string = tip_notes[0];
        this.schedule(() => {
            this.changeTip();
        }, 5);
        // this.spBar.barSprite..active = false;

        this.loadBundleShared();
        this.action()
    }

    protected onDestroy(): void {
        EventCenter.untarget(this);
    }

    private onLoginFail(failTimes: number) {
        this.txtProgress.string = "登录失败，系统正在重试... （第 " + failTimes + " 次）";
    }

    action() {
        tween(this.ndBar1)
            .by(3, { position: v3(430, 0, 0) })
            .call(() => {
                tween(this.ndBar1).call(() => {
                    this.ndBar1.position = v3(-430, 0, 0)
                }).to(6, { position: v3(430, 0, 0) }).union().repeatForever().start()
            })
            .start()
        tween(this.ndBar2)
            .to(6, { position: v3(430, 0, 0) })
            .call(() => {
                tween(this.ndBar2).call(() => {
                    this.ndBar2.position = v3(-430, 0, 0)
                }).to(6, { position: v3(430, 0, 0) }).union().repeatForever().start()
            })
            .start()
    }

    private onLoginSucc() {
        console.log("login succ ------");
        this.txtProgress.string = "Login bem-sucedido";
        this.scheduleOnce(() => {
            this.showEnter();
        }, 0.15);
    }

    private onBtnEntergame() {
        LoginCtrl.getIns().enterGame()
    }

    private loadBundleGame() {
        console.log("load game bundle...");
        LoadHelper.loadBundle("game", null, (err, bun) => {
            if (err) {
                this.scheduleOnce(() => {
                    this.loadBundleGame();
                }, 1);
                return;
            }
            this.loadGame(bun);
        });
    }

    private loadGame(bun: AssetManager.Bundle) {
        console.log("load game dir");
        bun.loadDir("prefabs", (finished: number, total: number) => {
            let curPercent = finished / total;
            this.setCurLoadBar(curPercent / 2);
        }, (err, data) => {
            if (err) {
                console.log(err);
            }
            this.loadSound(bun);
        });
    }

    private loadSound(bun: AssetManager.Bundle) {
        let p = this.spBar.fillRange
        bun.loadDir("audio", (finished: number, total: number) => {
            let curPercent = finished / total;
            this.setCurLoadBar(p + (curPercent / 10));
        }, (err, data) => {
            if (err) {
                console.log(err);
            }
            this.onGameLoaded();
        });
    }

    // 加载通用
    private loadBundleShared() {
        assetManager.loadBundle("shared", async (err: Error | null, data: AssetManager.Bundle) => {
            if (err != null) {
                this.scheduleOnce(this.loadBundleShared.bind(this), 1.0)
                return
            }

            await this.checkL10Bundle();

            window["SharedConfig"].SetThemeColor(new Color("#FFC824"));// 设置主题颜色
            // this.config.init();
            // this.config.setErrorCallback(this.onCallBackResponeErrorCode.bind(this));

            // this.lbTips.string = this.getL10n("shared_loading_tips_do_login");
            // this.login();
            this.loadBundleGame()
        })
    }
    // 检查l10多语言的子包是否加载完毕
    private async checkL10Bundle() {
        let check = (resolve: Function, reject: Function) => {
            // TODO l10n有时候会比res包加载的慢，先这样， 后面看怎么把l10n不在res下使用，或者调整加载顺序，修改bundle的顺序无效
            if (assetManager.getBundle("l10n") != null) {
                resolve();
                return
            }

            this.scheduleOnce(() => {
                resolve();
            }, 1.5)
            return
        }

        await window["PromiseEx"].Call(check)
        // this.playAnimation()
    }


    private onGameLoaded() {
        console.log("load game finish ------");
        this._hasGameLoaded = true;
        this.setCurLoadBar(0.5);
        LoginCtrl.getIns().login()
    }


    private showEnter() {
        this.m_ui.btn_entergame.active = true;
        this.m_ui.load_node.active = false;
    }

    private setCurLoadBar(percent: number) {
        if (this.curLoadProgress >= percent) {
            return;
        }
        if (percent > 1) {
            percent = 1
        }
        this.curLoadProgress = percent
        let width = 441
        // this.spBar.fillRange = percent;
        this.ndEffect.position = v3((percent * width - width / 2) - 15, 0, 0)
        this.mask.getComponent(UITransform).contentSize = size(width * percent, 30)
        if (!this._hasGameLoaded) {
            let p = Math.floor(percent * 100);
            this.txtProgress.string = `A carregando recursos[${p}%]`;
        }
        // else if(!LoginMgr.hasLogin()) {
        //     this.txtProgress.string = "正在登录";
        // }
        else if (!this._hasDocLoaded) {
            let p = Math.floor(percent * 100);
            this.txtProgress.string = `A carregando recursos[${p}%]`;
        } else {
            this.txtProgress.string = "Completar";
        }
    }

    private changeTip() {
        this.curTipIndex++;
        if (this.curTipIndex >= tip_notes.length) {
            this.curTipIndex = 0;
        }

        let txtNode = this.txtTip.node;
        tween(txtNode)
            .call(() => {
                txtNode.getComponent(CompColorBlur).blurAlpha(18, 255, 0);
            })
            .to(0.35, { position: v3(this.originPos.x, this.originPos.y + 30, this.originPos.z) })
            .call(() => {
                this.txtTip.string = tip_notes[this.curTipIndex];
                txtNode.position = v3(this.originPos.x, this.originPos.y - 30, this.originPos.z);
            })
            .hide()
            .delay(0.5)
            .show()
            .call(() => {
                txtNode.getComponent(CompColorBlur).blurAlpha(18, 0, 255);
            })
            .to(0.35, { position: v3(this.originPos.x, this.originPos.y, this.originPos.z) })
            .start();
    }

}


