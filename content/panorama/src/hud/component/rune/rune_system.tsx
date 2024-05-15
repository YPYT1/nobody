import { useGameEvent } from "react-panorama-x"

import { default as RuneDataJson } from "../../../json/config/game/rune_system.json"

let MainPanel: Panel;

const OnloadRuneSystem = (e: Panel) => {
    MainPanel = e;
    GameEvents.SendCustomGameEventToServer("RuneSystem", {
        event_name: "GetRuneData",
        params: {}
    })
}
/** 符文列表 */
export const RuneSystemContainer = () => {


    useGameEvent("RuneSystem_GetRuneData", event => {
        let data = event.data;
        if (MainPanel == null) { return }
        for (let rune_id in data) {
            let rune_count = data[rune_id];
            let rune_panel = MainPanel.FindChildTraverse(rune_id);
            if (rune_panel == null) {
                rune_panel = $.CreatePanel("Panel", MainPanel, rune_id, {})
                rune_panel.BLoadLayoutSnippet("ItemRune");
            }
            rune_panel.SetDialogVariable("rune_name", $.Localize(`#custom_rune_${rune_id}`));
            rune_panel.SetDialogVariable("rune_desc", $.Localize(`#custom_rune_${rune_id}_Description`))
            rune_panel.SetDialogVariable("rune_count", `${rune_count}`)
        }
    })

    return (
        <Panel id="RuneSystem" className="container" onload={OnloadRuneSystem}>

        </Panel>
    )

}