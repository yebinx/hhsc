export default class MoneyUtil {

    static rmbYuan(serverMoney:number) {
        return serverMoney/10000;
    }

    static rmbServer(clientMoney:number) {
        return Math.floor(clientMoney * 10000);
    }

    static rmbStr(serverMoney:number) {
        let v = this.rmbYuan(serverMoney);
        return this.formatGold(v);
    }

    static formatGold(value:number, len:number=2) {
		let fuhao = value < 0;
		value = Math.abs(value);
		let n = value.toString();
		let point_pos = n.indexOf(".");
		let intPart = n.substring(0, point_pos);
		let floatPart = n.substring(point_pos+1);
        if(point_pos < 0) {
            intPart = n;
			floatPart = "";
        }

		if(intPart.length > 3) {
			let tmp = "";
			let cnt = 0;
			for(let i=intPart.length-1; i>=0; i--) {
				tmp = intPart[i] + tmp;
				cnt++;
				if(cnt%3 == 0 && i != 0) {
					tmp = "," + tmp;
				}
			}
			intPart = tmp;
		}

        if(floatPart.length==0) {
			floatPart = "00";
		} else if(floatPart.length==1) {
			floatPart = floatPart+"0";
		} else {
			floatPart = floatPart.substring(0, 2);
		}

		if(fuhao) {
			return "-" + intPart + "." + floatPart;
		} else {
			return intPart + "." + floatPart;
		}
    }

	static formatGoldEx(value:number, len:number=2) {
        if (value === Math.ceil(value)) {
			return value + ".00";
		}
		let n = value.toString();
		let point_pos = n.indexOf(".");
        if(point_pos < 0) {
            return n + ".00";
        }
        let str_len = n.length;
        let diff = str_len-1 - point_pos;
        if(diff == 1) {
            return n + "0";
        }
        if(diff == 2) {
            return n;
        }
		return n.substring(0, point_pos+len+1);
    }
    
}


