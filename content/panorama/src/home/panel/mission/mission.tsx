import { default as MissionConfig } from "./../../../json/config/game/mission.json";

const DireMissionContainer = $("#DireMissionContainer");
const RadiantMissionContainer = $("#RadiantMissionContainer")
const DireTips = $("#DireTips");
const RadiantTips = $("#RadiantTips");
const mission_key_list = Object.keys(MissionConfig);

const MissionCompleteContainer = $("#MissionCompleteContainer");
const RadiantComplete = $("#RadiantComplete");
const DireComplete = $("#DireComplete")


export const Init = () => {
    DireMissionContainer.RemoveAndDeleteChildren()
    DireMissionContainer.BLoadLayoutSnippet("ContainerRightSide");
    RadiantMissionContainer.RemoveAndDeleteChildren()
    RadiantMissionContainer.BLoadLayoutSnippet("ContainerRightSide");

    DireTips.SetDialogVariable("tips_title", "夜魇试练")
    DireTips.SetDialogVariable("tips_desc", "夜魇的试练已经出现")
    RadiantTips.SetDialogVariable("tips_title", "天辉考验 ")
    RadiantTips.SetDialogVariable("tips_desc", "天辉的考验已经出现")

    DireMissionContainer.SetDialogVariable("timer", "0");
    RadiantMissionContainer.SetDialogVariable("timer", "0");

    // 任务完成可
    RadiantComplete.RemoveAndDeleteChildren()
    RadiantComplete.BLoadLayoutSnippet("MissionComplete");
    RadiantComplete.SetDialogVariable("title", "天辉任务已完成")
    RadiantComplete.SetDialogVariable("desc", "奖励: 1000灵魂 天辉符文")

    DireComplete.RemoveAndDeleteChildren()
    DireComplete.BLoadLayoutSnippet("MissionComplete");
    DireComplete.SetDialogVariable("title", "夜魇任务已完成")
    DireComplete.SetDialogVariable("desc", "奖励: 1000经验 夜魇符文")
    $("#resource").BLoadLayout(
        "file://{resources}/layout/custom_game/home/panel/mission/resource/resource.xml",
        true,
        false
    );

    CustomSubscribe();

    $.Schedule(1, MisstionTimerLoop)
    // TestCode();
}

const TestCode = () => {

    $.Schedule(1, () => {
        $.Msg("test play 1")

        RadiantComplete.AddClass("Play")
        DireComplete.AddClass("Play")
        $.Schedule(3, () => {
            RadiantComplete.RemoveClass("Play")
            DireComplete.RemoveClass("Play")
        })
    })
}
const SetMissionTipsAnima = (panel: Panel, mission_name: string, end_time: number, max_time: number) => {
    // panel.RemoveClass("Showed")
    if (end_time < Game.GetDOTATime(false, false)) {
        RemoveMissionTipsClass(panel);
        return
    }
    panel.RemoveClass("Hide");
    panel.SetHasClass(mission_name, true);

    panel.Data<PanelDataObject>().end_time = end_time;
    panel.Data<PanelDataObject>().max_time = max_time;

    // $.Msg([panel.BHasClass("Showed")])
    if (!panel.BHasClass("Showed")) {
        panel.SetDialogVariable("mission_title", $.Localize(`#custom_mission_no_${mission_name}`));
        panel.SetDialogVariable("mission_desc", $.Localize(`#custom_mission_no_${mission_name}_Description`));
        panel.AddClass("TipsPlay");
        panel.AddClass("Showed")
        $.Schedule(4.5, () => {
            panel.RemoveClass("TipsPlay")

        })
    }


}

const RemoveMissionTipsClass = (panel: Panel) => {
    panel.AddClass("Hide")
    panel.RemoveClass("Showed");
    panel.Data<PanelDataObject>().end_time = -1
    for (let key of mission_key_list) {
        panel.RemoveClass(key)
    }
}

const MisstionTimerLoop = () => {
    MisstionTimerUpdate();
    $.Schedule(0.5, MisstionTimerLoop)
}

const MisstionTimerUpdate = () => {
    const dota_time = Game.GetDOTATime(false, false)
    for (let pPanel of [RadiantMissionContainer, DireMissionContainer]) {
        let end_time = pPanel.Data<PanelDataObject>().end_time as number;
        let max_time = (pPanel.Data<PanelDataObject>().max_time as number) ?? 1;
        if (max_time == 1) { continue }
        let diff_time = Math.ceil(end_time - dota_time);
        pPanel.SetHasClass("TimerOver", diff_time < 0)
        pPanel.SetDialogVariable("timer", "" + diff_time)
        //@ts-ignore
        const MissionProgressBar = pPanel.FindChildTraverse("MissionProgressBar") as ProgressBar;
        const value = Math.ceil(-100 * (diff_time) / Math.max(1, max_time))
        // const deg = Math.ceil(360 * diff_time / Math.max(1, max_time));
        // $.Msg(["MissionProgressBar_FG",deg])
        MissionProgressBar.value = value;
        // MissionProgressBar_FG.style.clip = `radial( 50.0% 50.0%, 0.0deg, ${deg}deg)`;
    }

}


const CustomSubscribe = () => {

    GameEvents.Subscribe("MissionSystem_SendMissionTips", event => {
        let data = event.data;
        let mission_type = data.mission_type;
        if (mission_type == 1) {
            RadiantTips.AddClass("Show")
            $.Schedule(5, () => {
                RadiantTips.RemoveClass("Show");
            })
        } else {
            DireTips.AddClass("Show")
            $.Schedule(5, () => {
                DireTips.RemoveClass("Show");
            })
        }
    })

    GameEvents.Subscribe("MissionSystem_GetCurrentMission", event => {
        // $.Msg("MissionSystem_GetCurrentMission 1")
        let data = event.data;

        for (let key of mission_key_list) {
            DireMissionContainer.RemoveClass(key)
            // DireComplete.RemoveClass(key)
        }
        for (let key of mission_key_list) {
            RadiantMissionContainer.RemoveClass(key)
            // RadiantComplete.RemoveClass(key)
        }

        const dire_data = data.dire;
        if (dire_data) {
            DireComplete.SetHasClass(dire_data.name, true)
            DireComplete.RemoveClass("Play")
            SetMissionTipsAnima(DireMissionContainer, dire_data.name, dire_data.end_time, dire_data.max_time)
        } else {
            RemoveMissionTipsClass(DireMissionContainer);
        }

        const radiant_data = data.radiant
        if (radiant_data) {
            RadiantComplete.SetHasClass(radiant_data.name, true)
            RadiantComplete.RemoveClass("Play")
            SetMissionTipsAnima(RadiantMissionContainer, radiant_data.name, radiant_data.end_time, radiant_data.max_time)
        } else {
            RemoveMissionTipsClass(RadiantMissionContainer);

        }

        // if (data.radiant) {
        //     SetMissionTipsAnima(RadiantMissionContainer, data.radiant, data.radiant_timer ?? -1)
        // } else {
        //     RemoveMissionTipsClass(RadiantMissionContainer)
        // }

    })


    GameEvents.Subscribe("MissionSystem_MissionComplete", event => {
        let data = event.data;
        let m_type = data.mission_type;
        // $.Msg(["MissionSystem_MissionComplete"])
        if (m_type == 1) {
            RadiantComplete.AddClass("Play")
            $.Schedule(5,()=>{
                RadiantComplete.RemoveClass("Play")
            })
        } else if (m_type == 2) {
            DireComplete.AddClass("Play")
            $.Schedule(5,()=>{
                DireComplete.RemoveClass("Play")
            })
        }

    })

    GameEvents.SendCustomGameEventToServer("MissionSystem", {
        event_name: "GetCurrentMission",
        params: {}
    })


}
(function () {
    Init()
})();