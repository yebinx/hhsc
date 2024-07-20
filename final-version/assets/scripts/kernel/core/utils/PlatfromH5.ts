import { Size, sys } from "cc";
import { isEmpty, isNil } from "../Globals";


export default class PlatformH5 {

    static createInput(id:string, inputType:string, accept:string, inputStyle:string, aDiv, capt) : any {
		if(sys.isNative){ return null; }
		if(document.getElementById(id)) {
			return document.getElementById(id);
		}
		var inputor = document.createElement("input");
		inputor.setAttribute("id",id);
		inputor.setAttribute("type",inputType);
		inputor.setAttribute("accept", accept);
		inputor.setAttribute("style", inputStyle);
		if(capt && !isEmpty(capt)) {
			inputor.setAttribute("capture", capt);
		}
		if(aDiv) {
			aDiv.appendChild(inputor);
		}
		return inputor;
	}

    static Base64ToBlob(dataurl) : any {
		if(sys.isNative){ return null; }
		var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]);
		var u8arr = [];
		for(var i=0; i<bstr.length; i++) {
			u8arr.push( bstr.charCodeAt(i) );
		}
		return new Blob([new Uint8Array(u8arr)], { type: mime });
	}

    static BlobToBase64(blob, callback) {
		if(sys.isNative){ return; }
		let a = new FileReader();
		a.onload = function (e) { callback(e.target.result); }
		a.readAsDataURL(new Blob([blob], {type:"image/png"}));
	}

    /**
	 * 以obj.height 为基准 压缩
	 * baseImage base64 图片
	 * obj { width: 900, height: 35 }
	 * quality 图像质量  0 - 1   1 质量越高
	 */
	public static imageCompression(baseImage:string, sz:Size, quality:number, callback:Function) {
		if(sys.isNative || isNil(sz)) {
			callback(baseImage);
			return;
		}
		var img = new Image();
		img.src = baseImage;
		img.onload = function () {
			var that = this;
			var w = img.width, h = img.height;
			//按照h 压缩后的base64 和 width
			var compressionResult,compressionWidth,compressionHeight;
			if(h>sz.height){
				//生成canvas
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				//创建属性节点
				var createw = document.createAttribute('width');
				var createh = document.createAttribute('height');
				h = sz.height;
				w = (h/img.height) * w;
				compressionWidth = w;
				compressionHeight = h;
				//@ts-ignore
				createw.nodeValue = w;  createh.nodeValue = h;
				canvas.setAttributeNode(createw);
				canvas.setAttributeNode(createh);
				ctx.drawImage(img,0,0,w,h);
				var base64 = canvas.toDataURL('image/png', quality);
				compressionResult = base64;
			}else {
				compressionResult = baseImage;
				compressionWidth = img.width;
				compressionHeight = img.height;
			}
			//width > 默认width  做截取处理
			if (compressionWidth > sz.width){
				PlatformH5.ClippingImage(compressionResult,sz.width,compressionHeight,quality,function (base64Clipping) {
					callback(base64Clipping);
				});
			} else {
				callback(compressionResult);
			}
		}
	}

    /**
	 * 图片截取
	 * base64Codes  图片base64 码
	 * 从 (0,0) 开始截取   宽高分别为 width，height
	 * quality  图片质量  0 - 1 ，  1 图片质量最高
	 * callback  返回的是 截取后的base64 字符串
	 */
	public static ClippingImage(base64Codes:string, width:number, height:number, quality:number, callback:Function) {
		if(sys.isNative) {
			callback(base64Codes);
			return;
		}
		var img = new Image();
		img.src = base64Codes;
		//生成canvas
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		var createw = document.createAttribute('width');
		var createh = document.createAttribute('height');
		//@ts-ignore
		createw.nodeValue = width;  createh.nodeValue = height;
		canvas.setAttributeNode(createh);
		canvas.setAttributeNode(createw);
		img.onload = function () {
			ctx.drawImage(img,0,0,width,height,0,0,width,height);
			var base64Result = canvas.toDataURL('image/png', quality);
			callback(base64Result)
		}
	}

    static webCopyString(str) {
		if(sys.isNative){ return; }
		var input = str;
		const el = document.createElement('textarea');
		el.value = input;
		el.setAttribute('readonly', '');
		//@ts-ignore
		el.style.contain = 'strict';
		el.style.position = 'absolute';
		el.style.left = '-9999px';
		el.style.fontSize = '12pt'; // Prevent zooming on iOS

		const selection = getSelection();
		var originalRange = false;
		if (selection.rangeCount > 0) {
			//@ts-ignore
			originalRange = selection.getRangeAt(0);
		}
		document.body.appendChild(el);
		el.select();
		el.selectionStart = 0;
		el.selectionEnd = input.length;

		var success = false;
		try {
			success = document.execCommand('copy');
		} catch (err) {}

		document.body.removeChild(el);

		if (originalRange) {
			selection.removeAllRanges();
			//@ts-ignore
			selection.addRange(originalRange);
		}

		return success;
	}


	//访问用户媒体设备的兼容方法
	static getUserMedia(constraints, success, error) : boolean {
		if(sys.isNative){ return false; }
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
	  		//最新的标准API
	  		navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
			//@ts-ignore
		} else if (navigator.webkitGetUserMedia) {
	  		//webkit核心浏览器
	  		//@ts-ignore
	  		navigator.webkitGetUserMedia(constraints,success, error)
	  	//@ts-ignore
		} else if (navigator.mozGetUserMedia) {
			//firfox浏览器
			//@ts-ignore
			navigator.mozGetUserMedia(constraints, success, error);
		//@ts-ignore
		} else if (navigator.getUserMedia) {
			//旧版API
			//@ts-ignore
			navigator.getUserMedia(constraints, success, error);
		//@ts-ignore
		} else if (navigator.msGetUserMedia) {
			//@ts-ignore
			navigator.msGetUserMedia(constraints, success, error);
		} else {
			return false;
		}
		return true;
	}

}
