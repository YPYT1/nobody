import { GetTextureSrc } from "../../common/custom_kv_method";
import { default as ServerItemList } from "../../json/config/server/item/server_item_list.json";

let ServerItemPanel = $.GetContextPanel();
let ServerItemIcon = $("#ServerItemIcon") as ImagePanel;

const rare_list = [1, 2, 3, 4, 5, 6, 7];

const SetItemValue = (params: { item_id: string, item_count: number }) => {
    let item_id = params.item_id;
    let item_count = params.item_count;
    // $.Msg(["SetItemValue",item_id,item_count])
    let data = ServerItemList[item_id as keyof typeof ServerItemList];
    if (data) {
        let rarity = data.quality;
        for (let rare of rare_list) {
            ServerItemPanel.SetHasClass(`rare_${rare}`, rarity == rare);
        }
        if (data.affiliation_class == 23) {

        } else {
            //@ts-ignore
            let image_src = GetTextureSrc(data.AbilityTextureName ?? "");
            ServerItemIcon.SetImage(image_src);
        }

        ServerItemPanel.SetDialogVariable("count", `${item_count}`)
        if (item_count <= 0) {
            ServerItemPanel.SetHasClass("zero", true)
        }
    }


}

(function () {
    ServerItemPanel.Data<PanelDataObject>().SetItemValue = SetItemValue
})();