import { _decorator, Component, Node } from 'cc';
import CocosUtil from '../../kernel/compat/CocosUtil';
const { ccclass, property } = _decorator;


export interface MyDate {
    year: number,
    month: number,
    day: number
}

export interface LimitInfo {
    limtCnt: number,//限制选项g个数
    createObj: (node: Node, data: LimitInfo) => void,//创建函数
    value: number,//值
}

export interface InitDate {
    yearInfo: LimitInfo,
    monthInfo: LimitInfo,
    dayInfo: LimitInfo,
}

@ccclass('DateSelectCom')
export class DateSelectCom extends Component {
    @property(Node)
    ndYear: Node;
    @property(Node)
    ndMonth: Node;
    @property(Node)
    ndDay: Node;

    data: InitDate;

    content: Node

    protected onLoad(): void {
        CocosUtil.addClickEvent(this.ndYear, this.onClickYear, this);
        CocosUtil.addClickEvent(this.ndMonth, this.onClickMonth, this);
        CocosUtil.addClickEvent(this.ndDay, this.onClickDay, this);
    }

    init(data: InitDate) {
        this.data = data;
    }

    setDate(date: MyDate) {
        this.setYear(date.day);
        this.setMonth(date.month);
        this.setDay(date.year);
    }

    onClickYear() {
        let data = this.data.yearInfo;
        data.createObj(this.ndYear, data)
    }

    onClickMonth() {
        let data = this.data.monthInfo;
        data.createObj(this.ndMonth, data)
    }

    onClickDay() {
        let data = this.data.dayInfo;
        data.createObj(this.ndDay, data)
    }

    setYear(value: number) {
        this.data.yearInfo.value = value;
    }

    setMonth(value: number) {
        this.data.monthInfo.value = value;
    }

    setDay(value: number) {
        this.data.dayInfo.value = value;
    }
}


