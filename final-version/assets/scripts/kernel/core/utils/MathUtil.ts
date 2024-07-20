import { isNil } from "../Globals";

export default class MathUtil {

    public static angle2ridian = Math.PI/180;
    
    //洗牌算法
	public static shuffle(array: Array<any>) {
		for (var j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
	}

	//
	static limitNum(v:number, minV:number, maxV:number) : number {
		if( !isNil(minV) && !isNil(maxV) ) {
			if(minV>maxV){ var tmp = minV; minV = maxV; maxV = tmp; }
		}
		if(!isNil(maxV)) { if(v>maxV) v = maxV; }
		if(!isNil(minV)) { if(v<minV) v = minV; }
		return v;
	}

	//随机数
	public static getRandomInt(min:number, max:number) : number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	public static checkNumber(str:string) : boolean {
		if(isNil(str) || str==="") { return false; }
		if(str[0] === "-") {
			str = str.substring(1);
		}
		var reg = /^[\.0-9]+$/;
		return reg.test(str);
	}

	public static checkInt(str:string) : boolean {
		if(isNil(str) || str==="") { return false; }
		if(str[0] === "-") {
			str = str.substring(1);
		}
		var reg = /^[0-9]+$/;
		return reg.test(str);
	}

	public static parseNumber(str:string) : number {
		if(isNil(str) || str==="") { return 0; }
		var v = parseFloat(str);
		return v;
	}

}


