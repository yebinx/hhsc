import { instantiate, isValid, Node, Prefab, find, RichText, tween, UITransform, v3, Widget, Label } from "cc";
import CocosUtil from "../CocosUtil";
import LoadHelper from "../load/LoadHelper";
import { createResInfo, ResInfo } from "../load/ResInfo";
import CommonUtil from "../../core/utils/CommonUtil";
import { EUILayer, ParamConfirmDlg } from "./ViewDefine";
import { EViewNames } from "../../../configs/UIConfig";
import { BaseView } from "./BaseView";


export class UIManager {
    private static _uiMap: { [key: number]: ResInfo } = {};
    private static _viewsMap: Map<number, Node> = new Map();
    private static _uiRoot: Node = null;
    private static _uiLayers: Node[] = [];

    private static initWidget(nd: Node) {
        let wgt = nd.getComponent(Widget) || nd.addComponent(Widget);
        wgt.isAlignLeft = true;
        wgt.isAlignRight = true;
        wgt.isAlignTop = true;
        wgt.isAlignBottom = true;
        wgt.left = 0;
        wgt.right = 0;
        wgt.top = 0;
        wgt.bottom = 0;
    }

    private static createUIRoot() {
        let stage = this.getUIStage();
        let ui_root = new Node;
        ui_root.name = "ui_root";
        if (!ui_root.getComponent(UITransform)) {
            ui_root.addComponent(UITransform);
        }
        this.initWidget(ui_root);
        stage.addChild(ui_root);
        return ui_root;
    }

    static setUIRoot(root: Node) {
        this._uiRoot = root || this.createUIRoot();
        for (let i = 0; i <= EUILayer.Loading; i++) {
            let layer = new Node;
            this.initWidget(layer);
            root.addChild(layer);
            this._uiLayers[i] = layer;
        }
    }

    static setUIMap(uimap: { [key: number]: ResInfo }) {
        this._uiMap = uimap;
    }

    static getUIStage() {
        return find("Canvas");
    }

    static getUIRoot() {
        return this._uiRoot;
    }

    static getLayer(layerId: EUILayer) {
        return this._uiLayers[layerId];
    }

    private static callInitData(obj: Node, args: any[]) {
        var compList = obj["_components"];
        if (compList) {
            for (let i in compList) {
                if ((compList[i] as any).initData) {
                    (compList[i] as any).initData.apply(compList[i], args);
                }
            }
        }
    }

    static async showView(viewName: EViewNames, layerId?: EUILayer, ...args: any[]): Promise<Node> {
        if (layerId === undefined || layerId === null) { layerId = EUILayer.Panel; }
        return new Promise((res, rej) => {
            let viewInfo = this._uiMap[viewName];
            LoadHelper.loadPrefab(createResInfo(viewInfo.respath, viewInfo.bundleName), (er, data: Prefab) => {
                if (er) {
                    rej(null);
                    return;
                }

                let ui = UIManager.getView(viewName);
                if (!ui) {
                    ui = instantiate(data);
                    let view = ui.getComponent(BaseView)
                    if (view) {
                        view.init.apply(view, args)
                    }
                    ui.parent = UIManager.getLayer(layerId);
                    UIManager._viewsMap.set(viewName, ui);
                }
                res(ui);
                ui.active = true;
                let baseCom = ui.getComponent(BaseView)
                if (baseCom) {
                    baseCom.uiNmae = viewName
                    baseCom.before.apply(baseCom, args)
                    baseCom.initData.apply(baseCom, args)
                }
            });
        })
    }

    static async closeView(viewName: EViewNames) {
        let ui = this.getView(viewName);
        if (ui) {
            let baseCom = ui.getComponent(BaseView)
            if (baseCom?.closeBefore) {
                await baseCom.closeBefore()
            }
            this._viewsMap.delete(viewName);
            ui.destroy();
        }
    }

    static getView(viewName: EViewNames): Node {
        let ui = this._viewsMap.get(viewName);
        if (ui && isValid(ui)) {
            return ui;
        }
        return null;
    }

    //监听到UI销毁时调用
    static onViewClose(obj: Node) {
        for (let [k, v] of this._viewsMap.entries()) {
            if (obj === v) {
                console.log("on view close: ", k, v.name);
                UIManager._viewsMap.delete(k);
                break;
            }
        }
    }


    static openPanel(viewName: EViewNames, ...args: any[]) {
        UIManager.showView(viewName, EUILayer.Panel, ...args);
    }

    static openPopup(viewName: EViewNames, ...args: any[]) {
        UIManager.showView(viewName, EUILayer.Popup, ...args);
    }


    //-------------------------------------------------------------------------------------------------

    private static _toastList: Node[] = [];

    public static toast(content: string, posY: number = -280, toast_path: string = "prefabs/common/Toast") {
        if (content === undefined || content === null || content === "") { return; }

        if (UIManager._toastList[0] && CocosUtil.findNode(UIManager._toastList[0], "richCont").getComponent(Label).string === content) {
            return;
        }

        var completeCallback = function (err, rsc) {
            if (err) { console.log('载入预制体失败:' + err); return; }
            var cvs = UIManager.getUIRoot();
            if (!cvs) { console.log("没有Canvas"); return; }
            var obj: Node = instantiate(rsc);
            if (!obj) { console.log("实例化失败"); return; }

            let toast_list = UIManager._toastList;

            //往上挪
            var idx = 1;
            for (var j = toast_list.length - 1; j >= 0; j--) {
                let pos = toast_list[j].position;
                toast_list[j].setPosition(v3(pos.x, posY + 66 * idx, pos.z));
                idx++;
            }

            //插入
            UIManager.getLayer(EUILayer.Tip).addChild(obj);
            toast_list.push(obj);
            obj.setPosition(v3(0, posY, 0));

            //刷新数据并定时销毁
            CocosUtil.findNode(obj, "richCont").getComponent(Label).string = content;
            //Tween.stopAllByTarget(obj);
            obj.scale = v3(0.5, 0.5, 0.5);
            tween(obj)
                .to(0.06, { scale: v3(1.2, 1.2, 1.2) })
                .to(0.06, { scale: v3(1, 1, 1) })
                .delay(1.6)
                .call(() => {
                    for (let i = 0; i < toast_list.length; i++) {
                        if (toast_list[i] === obj) {
                            toast_list.splice(i, 1);
                            break;
                        }
                    }
                })
                .destroySelf()
                .start();
        }

        let info = {
            respath: toast_path,
            bundleName: "game"
        };
        if (LoadHelper.getRes(info, Prefab)) {
            completeCallback(null, LoadHelper.getRes(info, Prefab));
        } else {
            LoadHelper.loadPrefab(info, completeCallback);
        }
    }


    //-------------------------------------------------------------------------------------------------
    private static _allDialog: { [key: string]: Node } = {};				//对话框

    public static closeDialog(dlgName: string) {
        CommonUtil.safeDelete(UIManager._allDialog[dlgName]);
        UIManager._allDialog[dlgName] = null;
        delete UIManager._allDialog[dlgName];
    }

    public static openDialog(confirm_dialog_path: string, param: ParamConfirmDlg) {
        let dlgName: string = param.dlgName;

        if (isValid(UIManager._allDialog[dlgName])) {
            console.log("allready exist: ", dlgName);
            return;
        }

        let confirm_dialog_info = {
            respath: confirm_dialog_path,
            bundleName: null
        }
        LoadHelper.loadPrefab(confirm_dialog_info, (err, pre) => {
            if (err) {
                console.log('载入预制资源失败:' + err);
                return;
            }

            let cvs = UIManager.getUIRoot();
            if (!cvs) { return; }

            let obj = UIManager._allDialog[dlgName];

            if (!obj || !isValid(obj)) {
                obj = instantiate(pre);
                if (!obj) {
                    console.log("实例化预制体失败");
                    return;
                }
                UIManager._allDialog[dlgName] = obj;
                UIManager.getLayer(EUILayer.Dialog).addChild(obj);
            }

            UIManager._allDialog[dlgName] = obj;

            let logicComp: any = obj.getComponent("BaseComp");
            if (logicComp) {
                logicComp.initData(param);
            }
        });
    }

}
