
const EquipStoneList = $("#EquipStoneList");
const AttributeList = $("#AttributeList");
const StonePopups = $("#StonePopups");
// 部位(1 武器 ,2衣服, 3 头盔 , 4 裤子, 5 鞋子 , 6首饰)
export function Init() {
   
    StonePopups.SetHasClass("Show",true)
    EquipStoneList.RemoveAndDeleteChildren();
    for (let i = 1; i <= 6; i++) {
        let EquipStoneRows = $.CreatePanel("Panel", EquipStoneList, `${i}`);
        EquipStoneRows.BLoadLayoutSnippet("EquipStoneRows");
        EquipStoneRows.SetDialogVariableInt("level", 0)
    }
}


(() => {
    Init();
})();