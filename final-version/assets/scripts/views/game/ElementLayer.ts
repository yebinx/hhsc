import { _decorator, Component, Node, Prefab } from 'cc';
import { GameView } from './GameView';
const { ccclass, property } = _decorator;

@ccclass('ElementLayer')
export class ElementLayer extends Component {


    @property(Node)
    ndElement: Node;


    initGrid(elementList: Array<Array<number>>) {
    }


    addElement(node) {
        this.ndElement.addChild(node);
    }


}


