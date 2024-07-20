import { AudioManager } from "../kernel/compat/audio/AudioManager";
import { ResInfo } from "../kernel/compat/load/ResInfo";
import MathUtil from "../kernel/core/utils/MathUtil";



export enum BgmType {
    normal,
    hhsc,
    play_big_award,
}

export default class GameAudio {

    private static _curBgm: ResInfo = null;

    //

    static switchBgm(bgType: BgmType) {
        switch (bgType) {
            case BgmType.normal:
                this._curBgm = { respath: "audio/ng_bgm", bundleName: "game" };
                break;
            case BgmType.hhsc:
                this._curBgm = { respath: "audio/bg_bgm", bundleName: "game" };
                break;
        }
        AudioManager.inst.playBGM(this._curBgm);
    }

    static resumeBgm() {
        if (!this._curBgm) { return; }
        AudioManager.inst.playBGM(this._curBgm);
    }

    //----------------------------------------------------------------

    /**收集百搭 */
    static wdCollect1() {
        AudioManager.inst.playEffet({ respath: "audio/wd_collect1", bundleName: "game" });
    }
    /**收集百搭 */
    static wdCollect2() {
        AudioManager.inst.playEffet({ respath: "audio/wd_collect2", bundleName: "game" });
    }

    //开始旋转
    static startSpin() {
        AudioManager.inst.playEffet({ respath: "audio/spin_point", bundleName: "game" });
    }

    //快速展示结果
    static quickStopSpin() {
        AudioManager.inst.playEffet({ respath: "audio/reelstop_fast", bundleName: "game" });
    }

    //点击按钮
    static clickSystem() {
        AudioManager.inst.playEffet({ respath: "audio/system_point", bundleName: "game" });
    }
    //点击按钮
    static clickClose() {
        AudioManager.inst.playEffet({ respath: "audio/system_close", bundleName: "game" }, 3);
    }

    /**卷轴滚动声音 */
    static juanzhouRoll() {
        AudioManager.inst.playMusic({ respath: "audio/reel_xuanzhuan", bundleName: "game" }, true)
    }

    //缩小转盘
    static scaleJuanZhou() {
        AudioManager.inst.playEffet({ respath: "audio/reel_reduce", bundleName: "game" });
    }

    //触发失败 人生
    static hhscMiss() {
        AudioManager.inst.playEffet({ respath: "audio/nearmiss", bundleName: "game" });
    }

    //赢分线
    static winLine() {
        AudioManager.inst.playEffet({ respath: "audio/win_line", bundleName: "game" }, 0.4);
    }

    /**滚分 */
    static rollScore() {
        AudioManager.inst.playEffet({ respath: "audio/coins_up", bundleName: "game" });
    }


    /**百搭出现 */
    static wdChuxian() {
        AudioManager.inst.playEffet({ respath: "audio/wd_luoxia", bundleName: "game" });
    }

    /**1-3倍 */
    static winLeve1() {
        AudioManager.inst.playEffet({ respath: "audio/wina", bundleName: "game" });
    }
    /**3-5倍 //这个音效只有结束的*/
    static winLeveEnd2() {
        AudioManager.inst.playEffet({ respath: "audio/winb", bundleName: "game" });
    }
    /**1-3倍 */
    static winLeve3() {
        AudioManager.inst.playEffet({ respath: "audio/winc", bundleName: "game" });
    }

    //打开红包
    static redPackEffect() {
        AudioManager.inst.playEffet({ respath: "audio/symbol_random", bundleName: "game" });
    }

    /**虎虎生财卷轴光 */
    static hhscJuanZhouLigth() {
        AudioManager.inst.playEffet({ respath: "audio/bg_lights", bundleName: "game" });
    }

    /**虎虎生财连线声音*/
    static hhscRoundEndWinLine(line: number) {
        AudioManager.inst.playEffet({ respath: "audio/bg_win" + line, bundleName: "game" });
    }

    static stopAxisRoll() {
        AudioManager.inst.playEffet({ respath: "audio/reelstop", bundleName: "game" });
    }

    /**x10*/
    static x10Element() {
        AudioManager.inst.playEffet({ respath: "audio/symbol_big", bundleName: "game" });
    }

    //
    static sleep() {
        AudioManager.inst.playEffet({ respath: "audio/tiger_sleepy", bundleName: "game" });
    }

    static bigPlayerAward() {
        AudioManager.inst.playEffet({ respath: "audio/line_winbig", bundleName: "game" });
    }

    static stopBigAward() {
        AudioManager.inst.resumeBGM();
        AudioManager.inst.stopMusic();
    }

    static clickShowRateTip() {
        AudioManager.inst.playEffet({ respath: "audio/symbol_point", bundleName: "game" });
    }

    static winPlayerRandom() {
        let idx = MathUtil.getRandomInt(1, 3)
        AudioManager.inst.playEffet({ respath: "audio/win" + idx, bundleName: "game" });
    }


    static hhscEnd() {
        AudioManager.inst.playEffet({ respath: "audio/bg_end", bundleName: "game" });
    }

    static bigWinEnd() {
        AudioManager.inst.stopMusic();
        AudioManager.inst.playEffet({ respath: "audio/bigwin_bgm_end", bundleName: "game" });
    }

    static bigWin() {
        AudioManager.inst.pauseBGM();
        AudioManager.inst.stopMusic();
        AudioManager.inst.playMusic({ respath: "audio/bigwin_bgm", bundleName: "game" });
    }

    /**普通x10 */
    static x10Fly() {
        AudioManager.inst.playEffet({ respath: "audio/x10fly", bundleName: "game" });
    }


}


