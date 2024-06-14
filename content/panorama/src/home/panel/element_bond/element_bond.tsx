import { HideCustomTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";

let MainPanel = $.GetContextPanel();
const element_enum_label: CElementType[] = ["fire", "ice", "thunder", "wind", "light", "dark"];

GameEvents.Subscribe("NewArmsEvolution_GetArmssElementBondDateList", event => {
    let data = event.data;
    let element_obj = data.Element;
    $.Msg(["data", data])

    for (let key in element_obj) {
        if (key == "0") { continue }
        let key_index = parseInt(key);
        let index = parseInt(key) - 1;
        let element_id = element_enum_label[index];
        let element_count = element_obj[key_index as keyof typeof element_obj];
        let elementPanel = MainPanel.FindChildTraverse(element_id)!;
        elementPanel.SetHasClass("Enabled", element_count >= 2);
        elementPanel.SetHasClass("Show", element_count > 0);
        elementPanel.SetDialogVariableInt("current_count", element_count);
        elementPanel.Data<PanelDataObject>().element_count = element_count
    }
})

export const Init = () => {
    MainPanel.RemoveAndDeleteChildren();
    for (let i = 0; i < 6; i++) {
        let element_id = element_enum_label[i]
        let ElementSynergy = $.CreatePanel("Panel", MainPanel, element_id);
        ElementSynergy.BLoadLayoutSnippet("ElementSynergy");
        ElementSynergy.SetDialogVariableInt("current_count", 0)
        ElementSynergy.Data<PanelDataObject>().element_count = 0;

        ElementSynergy.SetPanelEvent("onmouseover", () => {
            let element_count = ElementSynergy.Data<PanelDataObject>().element_count as number;
            ShowCustomTooltip(ElementSynergy, "element_syenrgy", "", -1, i + 1, element_count)
        })

        ElementSynergy.SetPanelEvent("onmouseout", () => {
            HideCustomTooltip()
        })
    }

    GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
        event_name: "GetArmssElementBondDateList",
        params: {}
    });
}

(function () {
    Init()
})();