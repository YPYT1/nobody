import { DASHBOARD_NAVBAR } from "../components";

const DASHBOARD = "event";
const SUB_OBJECT = DASHBOARD_NAVBAR[DASHBOARD].Sub;
const NavButtonList = $("#NavButtonList");
const ContentFrame = $("#ContentFrame");
const FRAME_PATH = `file://{resources}/layout/custom_game/dashboard/${DASHBOARD}/`;


const MainPanel = $.GetContextPanel();


export const Init = () => {
    // 加载nav button
    NavButtonList.RemoveAndDeleteChildren();
    ContentFrame.RemoveAndDeleteChildren();
    let order = 0;
    for (let sub_key in SUB_OBJECT) {
        let sub_state = SUB_OBJECT[sub_key as keyof typeof SUB_OBJECT];
        if (sub_state) {
            let radiobtn_id = `${DASHBOARD}_${sub_key}`
            let NavRadioBtn = $.CreatePanel("RadioButton", NavButtonList, radiobtn_id,{
                group:"Dashboard_Event_Group"
            });
            NavRadioBtn.BLoadLayoutSnippet("NavRadioButton");
            NavRadioBtn.SetDialogVariable("button_txt", $.Localize("#custom_dashboard_nav_" + radiobtn_id))
            NavRadioBtn.checked = order == 0;
            NavRadioBtn.SetHasClass("is_first",order == 0);
            NavRadioBtn.SetPanelEvent("onselect", () => {
                for (let nav_key of Object.keys(SUB_OBJECT)) {
                    ContentFrame.SetHasClass(nav_key, nav_key == sub_key)
                }
            })

            let NavContent = $.CreatePanel("Panel", ContentFrame, radiobtn_id);
            let nav_path = `${FRAME_PATH}/${sub_key}/index.xml`;
            NavContent.BLoadLayout(nav_path, true, false);
            ContentFrame.SetHasClass(sub_key, order == 0)
            order++;
        }
    }
}

(() => {
    Init();
})();