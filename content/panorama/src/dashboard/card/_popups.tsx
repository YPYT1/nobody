// import { FindOfficialHUDUI } from "../../common/panel_operaton"

type GenericPopupsCardTypes = "PlayerConsumeCard" | "CompoundCard"

interface KeyValueProps {
    [key: string]: number | string
}


const GenericPopups = FindOfficialHUDUI("Card_PopupsBg")!

export function FindOfficialHUDUI(panel_id: string) {
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
export function GenericPopupsToggle(popups: GenericPopupsCardTypes, open: boolean, input?: KeyValueProps) {
    for (let i = 0; i < GenericPopups.GetChildCount(); i++) {
        let PopupsRows = GenericPopups.GetChild(i);
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
    GenericPopups.SetHasClass("Show", open);


}