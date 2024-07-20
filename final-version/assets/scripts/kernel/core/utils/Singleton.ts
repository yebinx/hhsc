export default class Singleton {
    public static getIns<T extends {}>(this: new () => T): T {
        if (!(<any>this).instance) {
            (<any>this).instance = new this();
        }
        return (<any>this).instance;
    }

    public static destroyIns() {
        (<any>this).instance = null;
    }
}

