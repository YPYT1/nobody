
export const InitArmsSelector = ()=>{

    let ArmsSelector = $("#ArmsSelector");
    
    

    GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
        event_name: "GetArmssSelectData",
        params: {}
    })
}

(function () {
    InitArmsSelector();

    GameEvents.Subscribe("NewArmsEvolution_GetArmssSelectData",event=>{
        let data = event.data.Data;
        $.Msg(["data", data])
        let arms_list = Object.values(data.arms_list);
        let ArmsList = $("#ArmsList");
        ArmsList.RemoveAndDeleteChildren();
        for(let arms of arms_list){
            let ArmsAbilityRow = $.CreatePanel("Panel",ArmsList,"");
            ArmsAbilityRow.BLoadLayoutSnippet("ArmsAbilityRow");
            let ImageIcon = ArmsAbilityRow.FindChildTraverse("ImageIcon") as AbilityImage;
            ImageIcon.abilityname = arms.key
        }
    })
})();