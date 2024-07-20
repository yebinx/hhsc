import Singleton from "../kernel/core/utils/Singleton"
import BaseModel from "../models/BaseModel"

export default abstract class BaseCtrl<T extends BaseModel> extends Singleton {

    private model: T = null

    constructor() {
        super()
        this.init()
    }

    abstract init();

    setModel(model: T) {
        this.model = model
    }

    getModel() {
        return this.model
    }


}