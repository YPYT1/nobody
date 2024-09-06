import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import { Mission_Dire_1 } from "./mission_list/dire/mission_dire_1";
import { Mission_Dire_2 } from "./mission_list/dire/mission_dire_2";
import { Mission_Dire_3 } from "./mission_list/dire/mission_dire_3";
import { Mission_Dire_4 } from "./mission_list/dire/mission_dire_4";
import { Mission_Dire_5 } from "./mission_list/dire/mission_dire_5";
import { Mission_Radiant_1 } from "./mission_list/radiant/mission_radiant_1";
import { Mission_Radiant_2 } from "./mission_list/radiant/mission_radiant_2";

/**
 * 第X分钟开始第一个任务
 * 首先刷新【天辉】，完成与否都在3分钟之后刷新【夜魇】
如果完成【天辉】没有完成【夜魇】，则5分钟之后再刷新【天辉】
如果只完成【夜魇】没完成【天辉】，则在3分钟之后刷新【夜魇】
如果不完成【天辉】和【夜魇】，任务则一直存在。
 */
// 任务奖励 灵魂 符文

type MisslieHandleType_Dire = Mission_Dire_1 | Mission_Dire_2 | Mission_Dire_3 | Mission_Dire_4 | Mission_Dire_5
type MisslieHandleType_Radiant = Mission_Radiant_1 | Mission_Radiant_2
type MissileList = MisslieHandleType_Dire | MisslieHandleType_Radiant;

/** 任务名字列表 */
type RadiantMissleNameList = "r_1" | "r_2" | "r_3" | "r_4" | "r_5" | "r_6" | "r_7" | "r_8";
type DireMissleNameList = "d_1" | "d_2" | "d_3" | "d_4" | "d_5" | "d_6" | "d_7" | "d_8";

type MissleNameList = RadiantMissleNameList | DireMissleNameList

@reloadable
export class MissionSystem extends UIEventRegisterClass {

    MissionHandle: { [key in MissleNameList]?: MissileList }
    /** 当前进行的事件 */
    hCurrentHandle: MissileList;
    /** 当前事件名 */
    sCurrentEventName: string;

    CurrentMissionType: number;
    /** 事件列表 */

    RadiantMissionList: MissleNameList[];
    DireMissionList: MissleNameList[];
    hEventList: MissleNameList[];
    /** 已发生事件 */
    hOccurredEventList: MissleNameList[];
    /** 当前任务到期时间 */
    fExpireTime: number;
    /** 处于任务中 */
    bInEvent: boolean;
    bInProgress: boolean;

    vMapCenter: Vector;

    constructor() {
        super("MissionSystem");
        this.fExpireTime = 0
        this._Init();
    }

    Reload() {
        this._Init();
    }

    // 初始化随机事件列表
    _Init() {
        this.hOccurredEventList = [];
        this.RadiantMissionList = ["r_1", "r_2"];
        this.DireMissionList = ["d_1", "d_2"];
        this.bInEvent = false;
        this.CurrentMissionType = -1;
        let ChapterData = GameRules.MapChapter.ChapterData
        this.vMapCenter = Vector(ChapterData.map_centre_x, ChapterData.map_centre_y, 128);

        this.MissionHandle = {
            d_1: new Mission_Dire_1("d_1", 2),
            d_2: new Mission_Dire_2("d_2", 2),

            r_1: new Mission_Radiant_1("r_1", 1),
            r_2: new Mission_Radiant_2("r_2", 1),
        }

        // 初始化任务排序 （3）阵法任务依次轮转，先是【天辉的考验】，再是【夜魇的试炼】
        this.hEventList = [];

        // for (let event_name in random_event) {
        //     let event_data = random_event[event_name as keyof typeof random_event];
        //     if (event_data.Enable == 1) {
        //         this.hEventList.push(event_name as keyof typeof random_event);
        //     }
        // }
        // this.hEventHandle = {}

    }

    /** 开始执行任务系统 */
    Start() {

    }

    /** 开始一次随机事件 */
    StartEventRandom(Repeatable: boolean = false) {
        print("StartEventRandom", Repeatable)
        if (Repeatable) {
            // 可重复
            let event_name = this.hEventList[RandomInt(0, this.hEventList.length - 1)];
            this.StartEventOfName(event_name);
        } else {
            // 不可重复,如果都触发了,则随机
            /** 还未触发的随机事件 */
            let last_event = GetLackList(this.hEventList, this.hOccurredEventList);
            if (last_event.length > 0) {
                let event_name = last_event[RandomInt(0, last_event.length - 1)];
                this.StartEventOfName(event_name);
            } else {
                print("无可用任务列表")
                // 再次执行
                // this.StartEventRandom(true);
            }
        }
    }

    /** 开始一次指定事件名的随机事件 */
    StartEventOfName(event_name: MissleNameList) {
        print("StartEventOfName", event_name)

        let start = this.vMapCenter + RandomVector(RandomInt(1500, 2500)) as Vector;
        // let direction = (start - this.vMapCenter as Vector).Normalized()
        // let next_pos = start + direction * -3000 as Vector;
        // let final = RotatePosition(start, QAngle(0, RandomInt(-45, 45), 0), next_pos)


        this.hCurrentHandle = this.MissionHandle[event_name];
        this.hCurrentHandle.CreateMission(start)
        let index = this.hOccurredEventList.indexOf(event_name);
        if (index == -1) {
            this.hOccurredEventList.push(event_name);
        }




    }

    /** 开始任务 */
    StartMission(vect: Vector) {
        print("StartMission",this.hCurrentHandle.mission_name)
        this.hCurrentHandle.ExecuteLogic(vect)
    }

    /** 增加任务进度 */
    MissionProgress(value: number) {
        this.hCurrentHandle.AddProgressValue(value)
    }

    /** 结束任务 */
    EndMission(success: boolean) {
        this.hCurrentHandle.EndOfMission(success);

        GameRules.CMsg.SendCommonMsgToPlayer(
            -1,
            "{s:mission_name} 任务 {s:success}",
            {
                mission_name: this.hCurrentHandle.mission_name,
                success: success ? "ok" : "fail"
            }
        )
        print("end mission state", success)
    }

    SetNextMission() {

    }

    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        if (cmd == "-rwks") {
            // this.StartEventRandom(true)
            this.StartEventOfName("r_2");
            GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
        }

        if (cmd == "-pos") {
            let vOrigin = hHero.GetAbsOrigin();
            let ChapterData = GameRules.MapChapter.ChapterData
            let vMapCenter = Vector(ChapterData.map_centre_x, ChapterData.map_centre_y, 128);

            let direction = (vOrigin - vMapCenter as Vector).Normalized()
            let angle = VectorToAngles(direction).y
            let angle_diff = AngleDiff(0, angle)
            print("angle_diff", angle_diff, this.vMapCenter)


        }
        if (cmd == "-rwjs") {
            // this.
        }
    }
}