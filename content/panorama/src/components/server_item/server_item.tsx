import { GetTextureSrc } from "../../common/custom_kv_method";
import { default as ServerItemList } from "../../json/config/server/item/server_item_list.json";

let ServerItemPanel = $.GetContextPanel();
let ServerItemIcon = $("#ServerItemIcon") as ImagePanel;

const rare_list = [1,2,3,4,5,6,7];

const SetItemValue = (params:{item_id:string,item_count:number}) => {
    let item_id = params.item_id;
    let item_count = params.item_count;
    // $.Msg(["SetItemValue",item_id,item_count])
    let data = ServerItemList[item_id as keyof typeof ServerItemList];
    // $.Msg(["data",data])
    let rarity = data.rarity;
    for(let rare of rare_list){
        ServerItemPanel.SetHasClass(`rare_${rare}`, rarity == rare);
    }
    let image_src = GetTextureSrc(data.AbilityTextureName);
    // $.Msg(["image_src",image_src])
    ServerItemIcon.SetImage(image_src);
    ServerItemPanel.SetDialogVariable("count", `${item_count}`)
}

(function () {
    ServerItemPanel.Data<PanelDataObject>().SetItemValue = SetItemValue
})();