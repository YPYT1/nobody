import { default as MissionConfig } from "./../../../json/config/game/mission.json";

const DireMissionContainer = $("#DireMissionContainer");
const RadiantMissionContainer = $("#RadiantMissionContainer")
const DireTips = $("#DireTips");
const RadiantTips = $("#RadiantTips");
const mission_key_list = Object.keys(MissionConfig);

export const Init = () => {

    DireTips.SetDialogVariable("tips_title", "夜魇试练")
    DireTips.SetDialogVariable("tips_desc", "夜魇的试练已经出现")
    RadiantTips.SetDialogVariable("tips_title", "天辉考验 ")
    RadiantTips.SetDialogVariable("tips_desc", "天辉的考验已经出现")

    DireMissionContainer.RemoveClass("Show");
    DireMissionContainer.RemoveClass("Play");
    RadiantMissionContainer.RemoveClass("Show")
    RadiantMissionContainer.RemoveClass("Play");
    $("#resource").BLoadLayout(
        "file://{resources}/layout/custom_game/home/panel/mission/resource/resource.xml",
        true,
        false
    );

    CustomSubscribe();
}

const SetMissionTipsAnima = (panel: Panel, mission_name: string) => {
    // panel.RemoveClass("Showed")
    panel.RemoveClass("Hide");
    panel.SetHasClass(mission_name, true);
    if (!panel.BHasClass("Showed")) {
        panel.SetDialogVariable("mission_title", $.Localize(`#custom_mission_no_${mission_name}`));
        panel.SetDialogVariable("mission_desc", $.Localize(`#custom_mission_no_${mission_name}_Description`));
        panel.AddClass("TipsPlay");
        $.Schedule(4.5, () => {
            panel.RemoveClass("TipsPlay")
            panel.AddClass("Showed")
        })
    }


}

const RemoveMissionTipsClass = (panel: Panel) => {
    panel.AddClass("Hide")
    panel.RemoveClass("Showed");
    panel.RemoveClass("Show");
    for (let key of mission_key_list) {
        panel.RemoveClass(key)
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
        for (let key of mission_key_list) { DireMissionContainer.RemoveClass(key) }
        for (let key of mission_key_list) { RadiantMissionContainer.RemoveClass(key) }
        if (data.dire) {
            SetMissionTipsAnima(DireMissionContainer, data.dire)
        } else {
            RemoveMissionTipsClass(DireMissionContainer)
        }

        if (data.radiant) {
            SetMissionTipsAnima(RadiantMissionContainer, data.radiant)
        } else {
            RemoveMissionTipsClass(RadiantMissionContainer)
        }
        // if (data.radiant) {
        //     RadiantMissionContainer.RemoveClass("Hide")
        //     RadiantMissionContainer.SetHasClass(data.radiant, true)
        //     RadiantMissionContainer.SetDialogVariable("mission_title", $.Localize(`#custom_mission_no_${data.radiant}`));
        //     RadiantMissionContainer.SetDialogVariable("mission_desc", $.Localize(`#custom_mission_no_${data.radiant}_Description`));
        //     RadiantMissionContainer.AddClass("Play");
        //     $.Schedule(5, () => {
        //         RadiantMissionContainer.RemoveClass("Play");
        //         RadiantMissionContainer.AddClass("Showed")
        //     })
        // } else {
        //     RadiantMissionContainer.AddClass("Hide")
        //     RadiantMissionContainer.RemoveClass("Show");
        //     for (let key of mission_key_list) {
        //         RadiantMissionContainer.RemoveClass(key)
        //     }
        // }
    })

    GameEvents.SendCustomGameEventToServer("MissionSystem", {
        event_name: "GetCurrentMission",
        params: {}
    })
}
(function () {
    Init()
})();