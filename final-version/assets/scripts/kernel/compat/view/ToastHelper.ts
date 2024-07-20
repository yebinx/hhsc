import { instantiate, Label, Node, tween, v3 } from "cc";
import LoadHelper from "../load/LoadHelper";
import { createResInfo } from "../load/ResInfo";
import { UIManager } from "./UImanager";
import { EUILayer } from "./ViewDefine";


export default class ToastHelper {
    private static prefabPath = createResInfo("prefabs/poptip/ToastTip", null);
    private static tipNode:Node = null;

    static tip(cont:string) {
        LoadHelper.loadPrefab(this.prefabPath, (err, rsc)=>{
            if( err ) { console.log('载入预制体失败:' + err); return; }
			let cvs = UIManager.getUIRoot();
			if( !cvs ) { console.log("没有Canvas"); return; }
			var obj = ToastHelper.tipNode;
            if(!obj) { 
                ToastHelper.tipNode = instantiate(rsc); 
                ToastHelper.tipNode.parent = UIManager.getLayer(EUILayer.Tip);
                obj = ToastHelper.tipNode;
            } 
            obj.getChildByName("cont").getComponent(Label).string = cont;
            obj.scale = v3(0.5,0.5,0.5);
            tween(obj)
                .show()
                .to(0.1, {scale:v3(1.2, 1.2, 1.2)})
                .to(0.08, {scale:v3(1, 1, 1)})
                .delay(1.6)
                .hide()
                .start();
        });
    }
}


