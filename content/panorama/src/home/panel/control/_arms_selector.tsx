
export const InitArmsSelector = () => {


    GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
        event_name: "GetArmssSelectData",
        params: {}
    })

    const ArmsSelector = $("#ArmsSelector");
    const ArmsToggleButton = $("#ArmsToggleButton") as Button;
    ArmsToggleButton.SetPanelEvent("onactivate", () => {
        ArmsSelector.ToggleClass("Minimize");
    })
}

(function () {
    InitArmsSelector();

    GameEvents.Subscribe("NewArmsEvolution_GetArmssSelectData", event => {
        let ArmsSelector = $("#ArmsSelector");
        let data = event.data.Data;
        ArmsSelector.SetHasClass("Hide", data.is_select == 0);
        let arms_list = Object.values(data.arms_list);
        let ArmsList = $("#ArmsList");
        ArmsList.RemoveAndDeleteChildren();
        for (let key in arms_list) {
            let arms = arms_list[key]
            let ArmsAbilityRow = $.CreatePanel("Panel", ArmsList, "");
            ArmsAbilityRow.BLoadLayoutSnippet("ArmsAbilityRow");
            let ImageIcon = ArmsAbilityRow.FindChildTraverse("ImageIcon") as AbilityImage;
            ImageIcon.abilityname = arms.key

            ArmsAbilityRow.SetPanelEvent("onactivate", () => {
                // $.Msg(["key",key])
                GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
                    event_name: "PostSelectArms",
                    params: {
                        index: parseInt(key)
                    }
                })
            })
        }
        let AbilityList = $("#AbilityList");
        // data.index
        AbilityList.SetHasClass("IsSelecting",data.is_select == 1);
        for (let i = 0; i < 6; i++) {
            AbilityList.SetHasClass("SetIndex_" + i, i == data.index)
        }
    })
})();