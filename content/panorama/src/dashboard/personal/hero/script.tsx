import { LoadCustomComponent } from "../../_components/component_manager"
import { TalentInit } from "./_talent"
const SelectionHeroList = $("#SelectionHeroList")
const HeroAttributeList = $("#HeroAttributeList")
const npc_heroes_custom = GameUI.CustomUIConfig().KvData.npc_heroes_custom

const ATTRIBUTE_LIST: AttributeMainKey[] = [
    "MaxHealth",
    "MaxMana",
    "AttackDamage",
    "AttackSpeed",
    "AttackRange",
    "PhyicalArmor",
    "MoveSpeed",
    "AbilityHaste",
    "AbilityCooldown",
    "CriticalChance",
]


const MainPanel = $.GetContextPanel();
const HeroDetailsPanel = $("#HeroDetailsPanel");
const HeroTalentBtn = $("#HeroTalentBtn");



export const Init = () => {
    
    SelectionHeroList.RemoveAndDeleteChildren();
    let hero_order = 0;
    for (let hero_name in npc_heroes_custom) {
        let hero_data = npc_heroes_custom[hero_name as keyof typeof npc_heroes_custom];
        let bEnable = hero_data.Enable == 1;
        if (bEnable) {
            let HeroInfoItem = $.CreatePanel("RadioButton", SelectionHeroList, hero_name)
            HeroInfoItem.BLoadLayoutSnippet("HeroInfoItem");
            HeroInfoItem.checked = hero_order == 0;

            let PortraitImage = hero_data.PortraitImage
            let HeroIcon = HeroInfoItem.FindChildTraverse("HeroIcon") as ImagePanel;
            HeroIcon.SetImage(`file://{images}/heroes/${PortraitImage}.png`)

            HeroInfoItem.SetPanelEvent("onactivate", () => { SetHeroDetails(hero_data.HeroID) })
            if (hero_order == 0) {
                SetHeroDetails(hero_data.HeroID);
            }

            hero_order++;
        }
    }

    //初始化属性
    HeroAttributeList.RemoveAndDeleteChildren();
    for (let attr_key of ATTRIBUTE_LIST) {
        let _Panel = $.CreatePanel("Panel", HeroAttributeList, "");
        let PanelAttributeRow = LoadCustomComponent(_Panel, "row_attribute");
        PanelAttributeRow.SetAttributeMainKey(attr_key, 999, 999)
    }

    HeroTalentBtn.SetPanelEvent("onactivate", OpenHeroTalent)

    TalentInit()
    
}

const SetHeroDetails = (hero_id: number) => {
    // select_hero_id = hero_id;
    // 需要获取对应英雄数据
    HeroDetailsPanel.SetDialogVariable("hero_name", "HeroID:" + hero_id)

    HeroDetailsPanel.SetDialogVariableInt("curr_count", 0)
    HeroDetailsPanel.SetDialogVariableInt("need_count", 5)

}

const OpenHeroTalent = () => {
    $.Msg(["OpenHeroTalent"])
}


(() => {
    Init();
})();