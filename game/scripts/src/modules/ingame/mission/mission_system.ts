import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import { Mission_Dire_1 } from "./mission_list/dire/mission_dire_1";
import { Mission_Dire_2 } from "./mission_list/dire/mission_dire_2";
import { Mission_Dire_3 } from "./mission_list/dire/mission_dire_3";
import { Mission_Dire_4 } from "./mission_list/dire/mission_dire_4";
import { Mission_Dire_5 } from "./mission_list/dire/mission_dire_5";
import { Mission_Dire_6 } from "./mission_list/dire/mission_dire_6";
import { Mission_Dire_7 } from "./mission_list/dire/mission_dire_7";
import { Mission_Dire_8 } from "./mission_list/dire/mission_dire_8";
import { Mission_Radiant_1 } from "./mission_list/radiant/mission_radiant_1";
import { Mission_Radiant_2 } from "./mission_list/radiant/mission_radiant_2";
import { Mission_Radiant_3 } from "./mission_list/radiant/mission_radiant_3";
import { Mission_Radiant_4 } from './mission_list/radiant/mission_radiant_4';
import { Mission_Radiant_5 } from "./mission_list/radiant/mission_radiant_5";
import { Mission_Radiant_6 } from "./mission_list/radiant/mission_radiant_6";
import { Mission_Radiant_7 } from "./mission_list/radiant/mission_radiant_7";
import { Mission_Radiant_8 } from "./mission_list/radiant/mission_radiant_8";

type MisslieHandleType_Dire = Mission_Dire_1
    | Mission_Dire_2
    | Mission_Dire_3
    | Mission_Dire_4
    | Mission_Dire_5
    | Mission_Dire_6
    | Mission_Dire_7
    | Mission_Dire_8
type MisslieHandleType_Radiant = Mission_Radiant_1
    | Mission_Radiant_2
    | Mission_Radiant_3
    | Mission_Radiant_4
    | Mission_Radiant_5
    | Mission_Radiant_6
    | Mission_Radiant_7
    | Mission_Radiant_8
type MissileList = MisslieHandleType_Dire | MisslieHandleType_Radiant;

/** 任务名字列表 */
type RadiantMissleNameList = "r_1" | "r_2" | "r_3" | "r_4" | "r_5" | "r_6" | "r_7" | "r_8";
type DireMissleNameList = "d_1" | "d_2" | "d_3" | "d_4" | "d_5" | "d_6" | "d_7" | "d_8";

export type MissleNameList = RadiantMissleNameList | DireMissleNameList

interface MissionHandleProps {
    d_1: Mission_Dire_1;
    d_2: Mission_Dire_2;
    d_3: Mission_Dire_3;
    d_4: Mission_Dire_4;
    d_5: Mission_Dire_5;
    d_6: Mission_Dire_6;
    d_7: Mission_Dire_7;
    d_8: Mission_Dire_8;

    r_1: Mission_Radiant_1;
    r_2: Mission_Radiant_2;
    r_3: Mission_Radiant_3;
    r_4: Mission_Radiant_4;
    r_5: Mission_Radiant_5;
    r_6: Mission_Radiant_6;
    r_7: Mission_Radiant_7;
    r_8: Mission_Radiant_8;

}

/** 夜宴第一个任务延迟 */
const DIRE_MISSION_DELAY = 180; // 180

/** 任务间隔周期 */
const RADIANT_MISSION_INTERVAL = 300; // 300
const DIRE_MISSION_INTERVAL = 180; // 180

/**
 * 第X分钟开始第一个任务
 * 首先刷新【天辉】，完成与否都在3分钟之后刷新【夜魇】
如果完成【天辉】没有完成【夜魇】，则5分钟之后再刷新【天辉】
如果只完成【夜魇】没完成【天辉】，则在3分钟之后刷新【夜魇】
如果不完成【天辉】和【夜魇】，任务则一直存在。
 */
@reloadable
export class MissionSystem extends UIEventRegisterClass {

    MissionHandle: MissionHandleProps
    /** 当前进行的事件 */
    hCurrentHandle: MissileList;

    /** 当前事件名 */
    sCurrentEventName: string;

    CurrentMissionType: number;
    /** 天辉事件列表 */
    RadiantMissionList: MissleNameList[];
    RadiantOrder: number;
    RadiantMissionHandle: MissileList;
    /** 夜宴事件列表 */
    DireMissionList: MissleNameList[];
    DireOrder: number;
    DireMissionHandle: MissileList;


    vMapCenter: Vector;

    constructor() {
        super("MissionSystem");
        this._Init();
    }

    Reload() {
        this._Init();
    }

    // 初始化随机事件列表 重新开始新地图
    _Init() {
        // 天辉事件
        this.MissionHandle = {
            d_1: new Mission_Dire_1("d_1", 2),
            d_2: new Mission_Dire_2("d_2", 2),
            d_3: new Mission_Dire_3("d_3", 2),
            d_4: new Mission_Dire_4("d_4", 2),
            d_5: new Mission_Dire_5("d_5", 2),
            d_6: new Mission_Dire_6("d_6", 2),
            d_7: new Mission_Dire_7("d_7", 2),
            d_8: new Mission_Dire_8("d_8", 2),

            r_1: new Mission_Radiant_1("r_1", 1),
            r_2: new Mission_Radiant_2("r_2", 1),
            r_3: new Mission_Radiant_3("r_3", 1),
            r_4: new Mission_Radiant_4('r_4', 1),
            r_5: new Mission_Radiant_5('r_5', 1),
            r_6: new Mission_Radiant_6('r_6', 1),
            r_7: new Mission_Radiant_7('r_7', 1),
            r_8: new Mission_Radiant_8('r_8', 1),
        }

    }


    /** 开始进行任务系统 */
    Start(delay: number = 180) {
        GameRules.GetGameModeEntity().SetContextThink("MissionStartDelay", () => {
            GameRules.GetGameModeEntity().SetContextThink("DIRE_MISSION_DELAY", null, 0)
            let ChapterData = GameRules.MapChapter.ChapterData
            this.vMapCenter = Vector(ChapterData.map_centre_x, ChapterData.map_centre_y, 128);

            this.RadiantOrder = -1
            this.RadiantMissionList = ["r_1", "r_2", "r_3", "r_4", "r_5", "r_6", "r_7", "r_8"];
            ArrayScramblingByString(this.RadiantMissionList);

            // 夜宴事件
            this.DireOrder = -1;
            this.DireMissionList = ["d_1", "d_2", "d_3", "d_4", "d_5", "d_6", "d_7", "d_8"];
            ArrayScramblingByString(this.DireMissionList);

            // 刷新天辉的第三分钟开始,进行夜宴任务的定时器
            this.StartRadiantMissionLine();

            GameRules.GetGameModeEntity().SetContextThink("DIRE_MISSION_DELAY", () => {
                GameRules.MissionSystem.StartDireMissionLine();
                return null
            }, DIRE_MISSION_DELAY)
            return null
        }, delay)

    }

    /** 开始天辉任务线 */
    StartRadiantMissionLine() {
        if (this.RadiantOrder >= this.RadiantMissionList.length - 1) {
            print("已做完所有天辉任务")
            return
        }
        let vStart = this.vMapCenter + RandomVector(RandomInt(1500, 2500)) as Vector;
        this.RadiantOrder += 1;
        let mission_name = this.RadiantMissionList[this.RadiantOrder];
        this.RadiantMissionHandle = this.MissionHandle[mission_name];

        if (this.RadiantOrder == 0) {
            this.RadiantMissionHandle.CreateMission(vStart, this.vMapCenter, false);
        } else {
            GameRules.GetGameModeEntity().SetContextThink("RADIANT_MISSION_INTERVAL", () => {
                GameRules.MissionSystem.RadiantMissionHandle.CreateMission(vStart, this.vMapCenter, false);
                return null
            }, RADIANT_MISSION_INTERVAL)
        }
    }

    /** 开始夜宴任务线 */
    StartDireMissionLine() {
        if (this.RadiantOrder >= this.RadiantMissionList.length - 1) {
            print("已做完所有夜宴任务")
            return
        }
        let vStart = this.vMapCenter + RandomVector(RandomInt(1500, 2500)) as Vector;
        this.DireOrder += 1;
        let mission_name = this.DireMissionList[this.DireOrder];
        this.DireMissionHandle = this.MissionHandle[mission_name];
        if (this.DireOrder == 0) {
            this.DireMissionHandle.CreateMission(vStart, this.vMapCenter, false);
        } else {
            GameRules.GetGameModeEntity().SetContextThink("DIRE_MISSION_INTERVAL", () => {
                GameRules.MissionSystem.DireMissionHandle.CreateMission(vStart, this.vMapCenter, false);
                return null
            }, DIRE_MISSION_INTERVAL)
        }

    }

    /** 开始一次指定事件名的随机事件 */
    StartEventOfName(event_name: RadiantMissleNameList | DireMissleNameList, is_test: boolean = false) {
        let start = this.vMapCenter + RandomVector(RandomInt(1500, 2500)) as Vector;
        if (this.RadiantMissionList.indexOf(event_name) != -1) {
            // 进行天辉的任务
            this.RadiantMissionHandle = this.MissionHandle[event_name];
            this.RadiantMissionHandle.CreateMission(start, this.vMapCenter, is_test);

        } else if (this.DireMissionList.indexOf(event_name) != -1) {
            // 进行夜宴的任务
            this.DireMissionHandle = this.MissionHandle[event_name];
            this.DireMissionHandle.CreateMission(start, this.vMapCenter, is_test);
        } else {
            // 错误的任务
        }
        // 
        // this.hCurrentHandle = this.MissionHandle[event_name];
        // this.hCurrentHandle.CreateMission(start)
    }

    /** 强制结束所有任务 */
    Stop() {
        GameRules.GetGameModeEntity().SetContextThink("MissionStartDelay", null, 0)
        GameRules.GetGameModeEntity().SetContextThink("DIRE_MISSION_DELAY", null, 0)
        GameRules.GetGameModeEntity().SetContextThink("RADIANT_MISSION_INTERVAL", null, 0)
        GameRules.GetGameModeEntity().SetContextThink("DIRE_MISSION_INTERVAL", null, 0)
        // 结束当前天辉任务 包含待机的
        if (this.RadiantMissionHandle) {
            this.RadiantMissionHandle.StopCurrentMission();
        }
        // this.RadiantMissionHandle = null
        // 结束当前夜宴任务 
        if (this.DireMissionHandle) {
            this.DireMissionHandle.StopCurrentMission();
        }
        // this.DireMissionHandle = null

    }

    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        if (cmd == "-mstart") {
            // GameRules.GetGameModeEntity().SetFogOfWarDisabled(false);
            this.Start(1);
        }

        if (cmd == "-rwks") {
            let name = (args[0] ?? "d_2") as MissleNameList;
            this.StartEventOfName(name, true);
        }
        if (cmd == "-mend") {
            this.Stop()
        }
    }
}