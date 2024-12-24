import { CreateCustomComponent } from "../../_components/component_manager";

const MemberProductsList = $("#MemberProductsList")
const member_goods = [
    "88",  // 每日登录
    "1",   // 月卡
    "89",   // 月卡领取
    "2",  // 终身
    "90",  // 终身领取
    "90", // 双卡
]

export function Init() {

    MemberProductsList.RemoveAndDeleteChildren();
    // $.Msg(["MemberProductsList", MemberProductsList])
    for (let goods_id of member_goods) {
        let StoreItem = CreateCustomComponent(MemberProductsList, 'store_item_ex1', goods_id)
        StoreItem._SetGoodsId(goods_id);
        // StoreItem._SetState( false )
    }
}

(() => {
    Init();
})();