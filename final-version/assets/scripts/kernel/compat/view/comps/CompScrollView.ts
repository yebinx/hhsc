import { _decorator, CCInteger, Component, EventMouse, EventTouch, math, Node, NodeEventType, ScrollBar, ScrollView, Slider, Sprite, SpriteAtlas, SpriteFrame, sys, v2, v3, Vec2, Vec3 } from 'cc';
import { platform } from 'os';
import CocosUtil from '../../CocosUtil';

const { ccclass, property } = _decorator;


const MOVEMENT_FACTOR = 0.7;
const EPSILON = 1e-4;

@ccclass('CompScrollView')
export class CompScrollView extends ScrollView {
    @property(Node)
    ndLoadingText: Node;
    @property(Node)
    ndLoadingComplete: Node;
    isReqing: boolean = false

    _reqCallback: Function;
    _checkReqFullCallback: Function;
    thisObj: any;
    start(): void {
        if (this.ndLoadingComplete) {
            this.ndLoadingComplete.active = false;
        }
        if (this.ndLoadingText) {
            this.ndLoadingText.active = false;
        }
        if (sys.os == sys.OS.WINDOWS || sys.os == sys.OS.OSX) {
            this.node.on("loading_action", this.onShowLoading, this, true)
            this.node.on("loading_action_complete", this.onShowLoadingComplete, this, true)
            this.node.on(NodeEventType.MOUSE_ENTER, this._onMouserUp1, this, true);
            this.node.on(NodeEventType.MOUSE_LEAVE, this._onMouseLeave1, this, true);
            this.node.on(NodeEventType.MOUSE_MOVE, this._onTouchCancelled11, this, true);
            // this.node.on(NodeEventType.MOUSE_MOVE, this._onMouseLeave1, this, true);
            this.verticalScrollBar.node.on(NodeEventType.TOUCH_MOVE, this._onTouchMoved1, this, true);
            // this.verticalScrollBar.node.on(NodeEventType.TOUCH_MOVE, this._onTouchMoved1, this, true);
            this.verticalScrollBar.node.on(NodeEventType.TOUCH_START, this._onTouchBegan1, this, true);
            this.verticalScrollBar.node.on(NodeEventType.TOUCH_END, this._onTouchEnded1, this, true);
            this.verticalScrollBar.node.on(NodeEventType.TOUCH_CANCEL, this._onTouchCancelled1, this, true);
            this.verticalScrollBar.enableAutoHide = false;
            this.verticalScrollBar.hide()
            // this.elastic = false;
            this.inertia = false;
            this.verticalScrollBar.autoHideTime = 2;
            this.verticalScrollBar["_calculateLength"] = () => {
                return 180
            }
        } else {
            super.start()
        }
    }

    onShowLoading() {
        if (this.ndLoadingComplete) {
            this.ndLoadingComplete.active = false;
        }
        if (this.ndLoadingText) {
            this.ndLoadingText.active = true;
        }
    }

    onShowLoadingComplete() {
        if (this.ndLoadingText) {
            this.ndLoadingText.active = false;
        }
        if (this.ndLoadingComplete) {
            this.ndLoadingComplete.active = true;
        }
    }

    protected _startInertiaScroll(touchMoveVelocity: Vec3) {
        const inertiaTotalMovement = new Vec3(touchMoveVelocity);
        inertiaTotalMovement.multiplyScalar(MOVEMENT_FACTOR);
        this._startAttenuatingAutoScroll(inertiaTotalMovement, touchMoveVelocity);
    }

    setReqCallback(callback, thisObj) {
        this._reqCallback = callback;
        this.thisObj = thisObj;
    }
    setCheckFullCallback(callback, thisObj) {
        this._checkReqFullCallback = callback;
        this.thisObj = thisObj;
    }

    protected _startAutoScroll(deltaMove: math.Vec3, timeInSecond: number, attenuated?: boolean): void {
        if (deltaMove.y < -1) {
            if (this.isReqing) {
                return
            }
            this.isReqing = true
            this.waitReq(deltaMove, timeInSecond, attenuated)
        } else {
            super._startAutoScroll(deltaMove, timeInSecond, attenuated)
        }
    }

    async waitReq(deltaMove, timeInSecond, attenuated) {
        if (this._reqCallback) {
            let checkReqFullCallback = this._checkReqFullCallback()
            this.ndLoadingText.active = !checkReqFullCallback;
            this.ndLoadingComplete.active = checkReqFullCallback;
            this._startAutoScroll1(v3(0, 150, 0), 0, attenuated)
            await CocosUtil.wait(1)
            if (!checkReqFullCallback) {
                if (this._reqCallback) {
                    await this._reqCallback.apply(this.thisObj)
                }
            }
            this.isReqing = false
            this.ndLoadingText.active = false;
            this.ndLoadingComplete.active = false;
            super._startAutoScroll(deltaMove.add3f(0, -150, 0), 0, attenuated)
        } else {
            this.isReqing = false;
            super._startAutoScroll(deltaMove, timeInSecond, attenuated)
        }
    }

    protected _startAutoScroll1(deltaMove: Vec3, timeInSecond: number, attenuated = false) {
        const adjustedDeltaMove = this._flattenVectorByDirection(deltaMove);

        this._autoScrolling = true;
        this._autoScrollTargetDelta = adjustedDeltaMove;
        this._autoScrollAttenuate = attenuated;
        Vec3.copy(this._autoScrollStartPosition, this._getContentPosition1());
        this._autoScrollTotalTime = timeInSecond;
        this._autoScrollAccumulatedTime = 0;
        this._autoScrollBraking = false;
        this._isScrollEndedWithThresholdEventFired = false;
        this._autoScrollBrakingStartPosition.set(0, 0, 0);

        const currentOutOfBoundary = this._getHowMuchOutOfBoundary();
        if (!currentOutOfBoundary.equals(Vec3.ZERO, EPSILON)) {
            this._autoScrollCurrentlyOutOfBoundary = true;
        }
    }


    private _getContentPosition1(): Vec3 {
        if (!this._content) {
            return Vec3.ZERO.clone();
        }

        this._contentPos.set(this._content.position);
        return this._contentPos;
    }


    _onTouchMoved(event: EventTouch, captureListeners?: Node[]) {
        if (sys.os == sys.OS.ANDROID || sys.os == sys.OS.IOS) {//移动设备才开启触摸
            return super._onTouchMoved(event, captureListeners)
        }
    }


    _onMouserUp1() {
        this.verticalScrollBar.show();
    }

    _onMouseLeave1() {
        this.verticalScrollBar.hide();
    }

    _onTouchMoved1(event: EventTouch, captureListeners?: Node[]) {
        let pos1 = event.touch.getPreviousLocation();
        let pos2 = event.touch.getLocation();
        let dir = (pos2.y - pos1.y) / Math.abs(pos2.y - pos1.y);
        if (!this.enabledInHierarchy) {
            return;
        }

        if (this._hasNestedViewGroup(event, captureListeners)) {
            return;
        }

        const deltaMove = new Vec3();
        const wheelPrecision = -0.1;
        const scrollY = dir * 900;
        if (this.vertical) {
            deltaMove.set(0, scrollY * wheelPrecision, 0);
        } else if (this.horizontal) {
            deltaMove.set(scrollY * wheelPrecision, 0, 0);
        }

        this._mouseWheelEventElapsedTime = 0;
        this._processDeltaMove(deltaMove);

        if (!this._stopMouseWheel) {
            this._handlePressLogic();
            this.schedule(this._checkMouseWheel, 1.0 / 60, NaN, 0);
            this._stopMouseWheel = true;
        }

        this._stopPropagationIfTargetIsMe(event);
    }

    _onTouchBegan1(event: EventTouch, captureListeners?: Node[]) {
        super._onTouchBegan(event, captureListeners)
    }

    _onTouchEnded1(event: EventTouch, captureListeners?: Node[]) {
        super._onTouchEnded(event, captureListeners)
    }
    _onTouchCancelled1(event: EventTouch, captureListeners?: Node[]) {
        super._onTouchCancelled(event, captureListeners)
    }
    _onTouchCancelled11(event: EventTouch, captureListeners?: Node[]) {
    }

    _onMouseWheel(event: EventMouse) {
        if (this.isReqing) {
            return
        }
        let y = event.getScrollY()
        super._onMouseWheel(event)
    }

}