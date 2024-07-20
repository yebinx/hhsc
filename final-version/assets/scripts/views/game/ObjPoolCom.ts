import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import CocosPool from '../../kernel/compat/pool/CocosPool';
const { ccclass, property } = _decorator;

@ccclass('ObjPoolCom')
export class ObjPoolCom extends Component {

    static objPoolMgr: ObjPoolCom = null;

    @property(Prefab)
    prefabElement: Prefab;
    @property(Prefab)
    prefabAwardElement: Prefab;
    @property(Prefab)
    prefabWdParticle: Prefab;
    @property(Prefab)
    prefWdLigntCollect1Effect: Prefab;
    @property(Prefab)
    prefWdCollectBoom: Prefab;

    elementPool: CocosPool
    elementAwardPool: CocosPool
    wdParticlePool: CocosPool
    wdLightCollectEffectPool: CocosPool
    wdCollectBoomPool: CocosPool

    onLoad() {
        this.initPools()
        ObjPoolCom.objPoolMgr = this;
    }


    initPools() {
        this.elementPool = new CocosPool(() => {
            return instantiate(this.prefabElement)
        })
        this.elementAwardPool = new CocosPool(() => {
            return instantiate(this.prefabAwardElement)
        })
        this.wdParticlePool = new CocosPool(() => {
            return instantiate(this.prefabWdParticle)
        })
        this.wdLightCollectEffectPool = new CocosPool(() => {
            return instantiate(this.prefWdLigntCollect1Effect)
        })
        this.wdCollectBoomPool = new CocosPool(() => {
            return instantiate(this.prefWdCollectBoom)
        })
    }

    createElement() {
        return this.elementPool.newObject()
    }

    createAwardElement() {
        return this.elementAwardPool.newObject()
    }

    /**百搭收集粒子 */
    createWdParticle() {
        return this.wdParticlePool.newObject()
    }

    /**百搭收集粒子 */
    createWdLightCollectEffect() {
        return this.wdLightCollectEffectPool.newObject()
    }
    /**百搭收集爆炸粒子 */
    createWdCollectBoom() {
        return this.wdCollectBoomPool.newObject()
    }

    delElement(node) {
        this.elementPool.delObject(node)
    }

    delAwardElement(node) {
        this.elementAwardPool.delObject(node)
    }

    delWdParticle(node) {
        this.wdParticlePool.delObject(node)
    }

    delWdLightCollect1Effect(node) {
        this.wdLightCollectEffectPool.delObject(node)
    }
    
    delWdCollectBoom(node) {
        this.wdCollectBoomPool.delObject(node)
    }

}


