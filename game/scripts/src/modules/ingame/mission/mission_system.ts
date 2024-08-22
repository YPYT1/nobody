import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import { Mission_1 } from "./mission_list/mission_1";
import { Mission_2 } from "./mission_list/mission_2";


// 任务奖励 灵魂 符文
type MissileList = Mission_1 | Mission_2;



@reloadable
class MissionSystem extends UIEventRegisterClass {

    hCurrentHandle: MissileList;
    hEventHandle: { [key: string]: MissileList };
    // sCurrentEvent: EventList;

    /** 目标点 */
    // vTargetPoint:Vector;
    sCurrentEventName: string;
    hEventList: string[] = [];
    /** 当前任务到期时间 */
    fExpireTime: number;


    /** 处于任务中 */
    bInEvent: boolean;
    bInProgress: boolean;
    /** 已发生事件 */
    occurred_event: string[];

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
        this.occurred_event = [];
        this.hEventList = [];
        this.bInEvent = false;
        // for (let event_name in random_event) {
        //     let event_data = random_event[event_name as keyof typeof random_event];
        //     if (event_data.Enable == 1) {
        //         this.hEventList.push(event_name as keyof typeof random_event);
        //     }
        // }
        this.hEventHandle = {
            "Mission1": new Mission_1,
            "Mission2": new Mission_2,
        };

    }

    /** 开始一次随机事件 */
    StartEventRandom(Repeatable: boolean = false) {
        if (Repeatable) {
            // 可重复
            let event_name = this.hEventList[RandomInt(0, this.hEventList.length - 1)];
            this.StartEventOfName(event_name);
        } else {
            // 不可重复,如果都触发了,则随机
            /** 还未触发的随机事件 */
            // let last_event = AM2Math_LackList<string>(this.hEventList, this.occurred_event);
            // if (last_event.length > 0) {
            //     let event_name = last_event[RandomInt(0, last_event.length - 1)];
            //     this.StartEventOfName(event_name);
            // } else {
            //     // 再次执行
            //     this.StartEventRandom(true);
            // }
        }
    }

    /** 开始一次指定事件名的随机事件 */
    StartEventOfName(event_name: string) {
        if (this.bInEvent) {
            // print("当前已有事件", this.sCurrentEvent, this.fEventDuration);
            return;
        }
        // GameRules.CMsg.SendNoticeMessage(1, event_name, {});
        this.bInEvent = true;
        this.bInProgress = false;

        // const hCurrentHandle = new MissionIdx_1()
        this.hCurrentHandle = this.hEventHandle["Mission1"];
        // this.sCurrentEvent = this.hCurrentHandle.EventPreReady();
        // const event_type = this.hCurrentHandle._InitEventConfig();
        // this.fEventDuration = this.hCurrentHandle.GetEventDuration() ?? 0;

        // if (event_type == 2) {
        //     // 直接开始任务和执行定时器
        //     this.hCurrentHandle.ConfirmStartTheEvent();
        //     // this.StartCurrentEventTimer();
        // } else if (event_type == 1) {
        //     this.SendEventStateToClient(-1);
        // }
        // let index = this.occurred_event.indexOf(event_name);
        // if (index == -1) {
        //     this.occurred_event.push(event_name);
        // }
    }
}