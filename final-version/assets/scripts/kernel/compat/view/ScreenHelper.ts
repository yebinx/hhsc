import { math, screen, sys, view } from "cc";
import PlatformUtil from "../../core/utils/PlatformUtil";
import { LONG_SCREEN, SHOT_SCREEN, DESIGN_SIZE } from "./ViewDefine";


export default class ScreenHelper {

    static nnn(e, t, i) {
        (void 0 === i ? !e.classList.contains(t) : i) ? e.classList.add(t) : e.classList.remove(t)
    }

    static hideCocosToolbar() {
        if(sys.isMobile) { return; }
        let _query = document.querySelector.bind(document);
        let _toolbar = _query(".toolbar");
        if(!_toolbar) { return; }
        this.nnn(_toolbar, "hide", !0);
        // this.setWindowSize();
    }

    static setWindowSize() {
        let screenWid = Math.floor(window.innerWidth);
        let screenHei = Math.floor(window.innerHeight);
        screen.windowSize = new math.Size(screenWid, screenHei);
    }

    static onWindowResize() {
		let screenWid = Math.floor(window.innerWidth);
		let screenHei = Math.floor(window.innerHeight);

		if(PlatformUtil.isLandscape()) {
			let maxRatio = LONG_SCREEN.height/LONG_SCREEN.width;
			let minRatio = SHOT_SCREEN.height/SHOT_SCREEN.width;
			let ratio = screenWid / screenHei;
			
			if(ratio >= minRatio && ratio <= maxRatio) {
				view.setFrameSize(screenWid, screenHei);
			} 
			else if(ratio < minRatio) {
				let w = Math.floor(screenWid);
				let h = Math.floor(screenWid * DESIGN_SIZE.height/DESIGN_SIZE.width);
				view.setFrameSize(w, h);
			}
			else {
				let w = Math.floor(screenHei * DESIGN_SIZE.width / DESIGN_SIZE.height);
				let h = Math.floor(screenHei);
				view.setFrameSize(w, h);
			}
		} else {
			let maxRatio = SHOT_SCREEN.width/SHOT_SCREEN.height;
			let minRatio = LONG_SCREEN.width/LONG_SCREEN.height;
			let ratio = screenWid / screenHei;

			if(ratio >= minRatio && ratio <= maxRatio) {
				let w = Math.floor(screenWid);
				let h = Math.floor(screenHei);
				if(sys.os == "Windows") {
					h -= 4;
				}
				view.setFrameSize(w, h);
			}
			else if(ratio < minRatio) {
				let w = Math.floor(screenWid);
				let h = Math.floor(screenWid * DESIGN_SIZE.height/DESIGN_SIZE.width);
				if(sys.os == "Windows") {
					h -= 4;
				}
				view.setFrameSize(w, h);
			}
			else {
				let w = Math.floor(screenHei * DESIGN_SIZE.width/DESIGN_SIZE.height);
				let h = Math.floor(screenHei);
				if(sys.os == "Windows") {
					h -= 4;
				}
				view.setFrameSize(w, h);
			}
		}
	}

	static changeHbkg() {
		var bgImg = document.createElement('img');
		bgImg.src = 'bg.png';
		bgImg.onload = function() {
			var bgWidth = bgImg.width;
			var bgHeight = bgImg.height;
			var windowWidth = window.innerWidth;
			var windowHeight = window.innerHeight;
			var s1 = windowWidth/bgWidth;
			var s2 = windowHeight/bgHeight;
			document.body.style.backgroundImage = 'url(' + bgImg.src + ')';
			//document.body.style.backgroundPosition = 'center';
			var curW = Math.max(s1, s2) * bgWidth;
			var curH = Math.max(s1, s2) * bgHeight;
			document.body.style.backgroundRepeat = "no-repeat";
			document.body.style.backgroundSize = curW + "px " + curH + "px"; //"cover";
			var bgTop = (windowHeight - curH)/2;
			var bgLeft = (windowWidth - curW)/2;
			document.body.style.backgroundPosition = bgLeft + 'px ' + bgTop + 'px';
  
			window.addEventListener("resize", ()=>{
			  var bgWidth = bgImg.width;
			  var bgHeight = bgImg.height;
			  var windowWidth = window.innerWidth;
			  var windowHeight = window.innerHeight;
			  var s1 = windowWidth/bgWidth;
			  var s2 = windowHeight/bgHeight;
			  //document.body.style.backgroundPosition = 'center';
			  var curW = Math.max(s1, s2) * bgWidth;
			  var curH = Math.max(s1, s2) * bgHeight;
			  document.body.style.backgroundRepeat = "no-repeat";
			  document.body.style.backgroundSize = curW + "px " + curH + "px"; //"cover";
			  var bgTop = (windowHeight - curH)/2;
			  var bgLeft = (windowWidth - curW)/2;
			  document.body.style.backgroundPosition = bgLeft + 'px ' + bgTop + 'px';
		  });
		}
	}
    
}

