import { LoadCustomComponent } from "../../_components/component_manager";

const server_soul_attr = GameUI.CustomUIConfig().KvData.server_soul_attr;
const CheckAttrIsPercent = GameUI.CustomUIConfig().CheckAttrIsPercent

const DeltetConfirmBtn = $("#DeltetConfirmBtn");
const DeltetCancelBtn = $("#DeltetCancelBtn");
const DeltetSoulStonePopups = $("#DeltetSoulStonePopups");
const DeleteGiveItemList = $("#DeleteGiveItemList")
export function Init() {

    InitButton()

    DeleteGiveItemList.RemoveAndDeleteChildren()
    for (let i = 0; i < 6; i++) {
        let _ = $.CreatePanel("Panel", DeleteGiveItemList, "")
        let itemPanel = LoadCustomComponent(_, "server_item")
        itemPanel._SetServerItemInfo({ show_tips: true, show_count: true })
        itemPanel.visible = false;
    }

    GameEvents.Subscribe("ServiceSoul_DeforehandSoulDelete", event => {
        DeltetSoulStonePopups.visible = true;
        let del_attr = DeltetSoulStonePopups.Data<PanelDataObject>().del_attr as CGEDGetSoulListData;
        let key = del_attr.k;
        let attr_data = server_soul_attr[key as keyof typeof server_soul_attr];
        let MainProperty = attr_data.MainProperty as AttributeMainKey;
        let TypeProperty = attr_data.TypeProperty as AttributeSubKey;
        let pct_symbol = CheckAttrIsPercent(MainProperty, TypeProperty) ? "%" : "";
        let level = del_attr.l
        let attr_name = `${$.Localize(`#custom_attribute_${MainProperty}`).replace("%", "")}`
        let fixed_num = attr_data.float
        DeltetSoulStonePopups.SetDialogVariable("popup_ss_name", `Lv.${level}${attr_name}`)
        DeltetSoulStonePopups.SetDialogVariable("popup_ss_attr", `${del_attr.v.toFixed(fixed_num)}${pct_symbol}`)

        let data = event.data;
        for (let i = 0; i < DeleteGiveItemList.GetChildCount(); i++) {
            let rowPanel = DeleteGiveItemList.GetChild(i)!;
            rowPanel.visible = false
        }

        let index = 0;
        let item_list = data.list;
        for (let item_id in item_list) {
            let count = item_list[item_id];
            let rowPanel = DeleteGiveItemList.GetChild(index) as Component_ServerItem;
            rowPanel.visible = true;
            rowPanel._SetItemId(item_id)
            rowPanel._SetCount(count)
            index++;
        }

        DeltetSoulStonePopups.SetDialogVariableInt("give_ratio", data.pro)
    })
}

function InitButton() {
    DeltetCancelBtn.SetPanelEvent("onactivate", () => {
        DeltetSoulStonePopups.visible = false
    })

    DeltetConfirmBtn.SetPanelEvent("onactivate", () => {
        DeltetSoulStonePopups.visible = false
        let params = DeltetSoulStonePopups.Data<PanelDataObject>().params as CGED["ServiceSoul"]["SoulDelete"];
        $.Msg(params)
        GameEvents.SendCustomGameEventToServer("ServiceSoul", {
            event_name: "SoulDelete",
            params: params
        })
    })
}
(() => {
    Init();
})();