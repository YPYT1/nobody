export let ResourcePanel: { [key in PlayerResourceTyps]?: Panel } = {}
export const resource_list: PlayerResourceTyps[] = ["Soul"];


export const CreatePanel = () => {
    let MainPanel = $.GetContextPanel();
    MainPanel.RemoveAndDeleteChildren();
    for (let resource_type of resource_list) {
        let resource_panel = $.CreatePanel("Panel", MainPanel, "");
        resource_panel.BLoadLayoutSnippet("ResourceTypePanel");
        resource_panel.AddClass(resource_type);
        resource_panel.SetDialogVariableInt("amount", 0)
        ResourcePanel[resource_type] = resource_panel
    }

    GameEvents.Subscribe("ResourceSystem_SendPlayerResources", event => {
        let data = event.data;
        // ResourcePanel["Gold"]?.SetDialogVariable("amount", `${data.Gold}`)
        let SoulPanel = ResourcePanel["Soul"]
        if (SoulPanel) {

            ResourcePanel["Soul"]?.AddClass("Play")
            $.Schedule(0.25, () => {
                ResourcePanel["Soul"]?.RemoveClass("Play");
            })

            SoulPanel.SetDialogVariableInt("amount", data.Soul)
        }

        // ResourcePanel["Kills"]?.SetDialogVariableInt("amount", data.Kills)
    })

    GameEvents.SendCustomGameEventToServer("ResourceSystem", {
        event_name: "GetPlayerResource",
        params: {}
    })
}

(function () {
    CreatePanel();
})();