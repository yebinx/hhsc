import { _decorator, Component, isValid, Sprite, Node, SpriteFrame, UITransform, size, Texture2D } from 'cc';
import SpriteHelper from './SpriteHelper';
import EventCenter from '../../core/event/EventCenter';


const { ccclass, property } = _decorator;

@ccclass('CpnRemoteSprite')
export default class CpnRemoteSprite extends Component {
    private _remoteUrl = "";
    private _fitStyle = 0;
    private _originWid = 0;
    private _originHei = 0;

    protected onLoad(): void {
        this._originWid = this.node.getComponent(UITransform).contentSize.width;
        this._originHei = this.node.getComponent(UITransform).contentSize.height;
        EventCenter.getInstance().listen("remote_tex_loaded", this.onTextureLoaded, this);
    }

    protected onDestroy(): void {
        EventCenter.getInstance().removeByTarget(this);
    }

    private set2Default() {
        SpriteHelper.setNodeSprite(this.node, null);
        this.node.getComponent(UITransform).setContentSize(size(this._originWid, this._originHei));
    }

    setRemoteSprite(url:string, fitStyle:number) : boolean {
        let needReload = this._remoteUrl != url;
        this._remoteUrl = url;
        this._fitStyle = fitStyle;
        if(needReload) {
            this.set2Default();
        }
        return needReload;
    }

    private onTextureLoaded(url:string, tex:Texture2D) {
        if(url != this._remoteUrl) { return; }
        if(!tex) {
            this.set2Default();
            return;
        }

        var spriteFrame = new SpriteFrame();
        spriteFrame.texture = tex;
        this.node.getComponent(Sprite).spriteFrame = spriteFrame;

        let fitStyle = this._fitStyle;
        let nd = this.node;
        let width = this._originWid;
        let height = this._originHei;
        
        if(fitStyle==0) { //保持最初宽高
            nd.getComponent(UITransform).setContentSize(size(width, height));
        }
        else if(fitStyle==1) { //保持最大程度不拉伸，且不超出原始宽高
            let r1 = tex.width/tex.height;
            nd.getComponent(UITransform).setContentSize(size(height * r1, height));
            if(nd.getComponent(UITransform).contentSize.width > width) {
                let s1 = width/nd.getComponent(UITransform).contentSize.width;
                nd.getComponent(UITransform).setContentSize(size(width, height * s1));
            }
        }
        else if (fitStyle==2) { //保持原高度且不拉伸
            let r1 = tex.width/tex.height;
            nd.getComponent(UITransform).setContentSize(size(height * r1, height));
        } 
        else if(fitStyle==3) { //保持原宽度且不拉伸
            let r2 = tex.height/tex.width;
            nd.getComponent(UITransform).setContentSize(size(width, width * r2));
        } 
    }

}
