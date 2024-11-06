// import { FindOfficialHUDUI } from "../../common/panel_operaton"

type CardDashboardPopupsTypes = "PlayerConsumeCard" | "CompoundCard"

interface KeyValueProps {
    [key: string]: number | string
}


const CardDashboardPopupsBg = FindOfficialHUDUI("Card_PopupsBg")!

function FindOfficialHUDUI(panel_id: string) {
    let hudRoot: any;
    for (let panel = $.GetContextPanel(); panel != null; panel = panel.GetParent()!) {
        hudRoot = panel;
    }
    if (hudRoot) {
        let comp = hudRoot.FindChildTraverse(panel_id);
        return comp as Panel;
    } else {
        return null;
    }
}

export function CardPopupsToggle(popups: CardDashboardPopupsTypes, open: boolean, input?: KeyValueProps) {
    for (let i = 0; i < CardDashboardPopupsBg.GetChildCount(); i++) {
        let PopupsRows = CardDashboardPopupsBg.GetChild(i);
        if (PopupsRows) {
            let popups_id = PopupsRows.id;
            PopupsRows.SetHasClass("Show", open && popups_id == popups);
            // $.Msg(["input",input])
            if (popups_id == popups && input) {
                for (let k in input) {
                    PopupsRows.Data<PanelDataObject>()[k] = input[k]
                }
            }
        }
    }
    CardDashboardPopupsBg.SetHasClass("Show", open);
}