import { Enum, Node, UITransform, Vec3, tween, v3 } from "cc";
enum UIActionType {
    None,
    DownToTop = 1,
    TopToDown = 2,
    RigthToLeft = 3,
    LeftToRight = 4,
}

export var EUIAction = Enum(UIActionType)


export class UIActionEx {

    static async runAction(aniRoot: Node, type: UIActionType) {
        return new Promise(res => {
            if (type == UIActionType.None) {
                res(null)
                return
            }
            let transFrom = aniRoot.getComponent(UITransform)
            if (!transFrom) {
                transFrom = aniRoot.addComponent(UITransform)
            }
            // let wroldPos = CocosUtil.convertSpaceAR(aniRoot, aniRoot.parent)
            if (type == UIActionType.DownToTop) {
                let size = transFrom.contentSize;
                aniRoot.position = aniRoot.position.add3f(0, -size.height, 0)
                tween(aniRoot)
                    .by(0.2, { position: v3(0, size.height, 0) })
                    .call(res)
                    .start()
            } else if (type == UIActionType.TopToDown) {
                let size = transFrom.contentSize;
                aniRoot.position = aniRoot.position.add3f(0, size.height, 0)
                tween(aniRoot)
                    .by(0.2, { position: v3(0, -size.height, 0) })
                    .call(res)
                    .start()
            } else if (type == UIActionType.RigthToLeft) {
                let size = transFrom.contentSize;
                aniRoot.position = aniRoot.position.add3f(size.width, 0, 0)
                tween(aniRoot)
                    .by(0.2, { position: v3(-size.width, 0, 0) })
                    .call(res)
                    .start()
            }
        })
    }

    static async runCloseAction(aniRoot: Node, type: UIActionType) {
        return new Promise(res => {
            if (type == UIActionType.None) {
                res(null)
                return
            }
            let transFrom = aniRoot.getComponent(UITransform)
            if (!transFrom) {
                transFrom = aniRoot.addComponent(UITransform)
            }
            // let wroldPos = CocosUtil.convertSpaceAR(aniRoot, aniRoot.parent)
            if (type == UIActionType.DownToTop) {
                let size = transFrom.contentSize;
                tween(aniRoot)
                    .by(0.2, { position: v3(0, size.height, 0) })
                    .call(res)
                    .start()
            } else if (type == UIActionType.TopToDown) {
                let size = transFrom.contentSize;
                tween(aniRoot)
                    .by(0.2, { position: v3(0, -size.height, 0) })
                    .call(res)
                    .start()
            } else if (type == UIActionType.RigthToLeft) {
                let size = transFrom.contentSize;
                aniRoot.position = aniRoot.position.add3f(size.width, 0, 0)
                tween(aniRoot)
                    .by(0.2, { position: v3(-size.width, 0, 0) })
                    .call(res)
                    .start()
            } else if (type == UIActionType.LeftToRight) {
                let size = transFrom.contentSize;
                tween(aniRoot)
                    .by(0.2, { position: v3(size.width, 0, 0) })
                    .call(res)
                    .start()
            }
        })
    }
}