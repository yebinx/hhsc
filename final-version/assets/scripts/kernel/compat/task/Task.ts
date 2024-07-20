export default class Task {

    handlerMaps: Map<any, Function> = new Map();

    wait(time: number) {
        return new Promise((res, rej) => {
            //@ts-ignore
            let id = setTimeout(() => {
                if (this.handlerMaps.has(id)) {
                    this.handlerMaps.delete(id)
                }
                res(null)
            }, time * 1000);
            this.handlerMaps.set(id, res)
        })
    }

    cancel() {
        this.handlerMaps.forEach(v => {
            v()
        })
        this.handlerMaps.clear()
    }
}