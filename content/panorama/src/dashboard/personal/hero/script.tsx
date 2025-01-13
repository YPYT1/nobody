import { LoadCustomComponent } from "../../_components/component_manager"
import { InitHeroStarUpView, OpenStarUpPage } from "./_star"
import { InitHeroTalentView, OpenHeroTalentView, SetHeroDetails } from "./_talent"

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
const UpStarBtn = $("#UpStarBtn");
const HeroPopups_Talent = $("#HeroPopups_Talent");
let select_hero_id = -1;

export const Init = () => {
    let config_index: { [heroid: number]: number } = {};
    SelectionHeroList.RemoveAndDeleteChildren();
    let hero_order = 0;
    for (let hero_name in npc_heroes_custom) {
        let hero_data = npc_heroes_custom[hero_name as keyof typeof npc_heroes_custom];
        let bEnable = hero_data.Enable == 1;
        if (bEnable) {
            config_index[hero_data.HeroID] = 0;
            let HeroInfoItem = $.CreatePanel("RadioButton", SelectionHeroList, hero_name)
            HeroInfoItem.BLoadLayoutSnippet("HeroInfoItem");
            HeroInfoItem.checked = hero_order == 0;

            let PortraitImage = hero_data.PortraitImage
            let HeroIcon = HeroInfoItem.FindChildTraverse("HeroIcon") as ImagePanel;
            HeroIcon.SetImage(`file://{images}/heroes/${PortraitImage}.png`)

            HeroInfoItem.SetPanelEvent("onactivate", () => {
                select_hero_id = hero_data.HeroID
                SetHeroDetails(hero_data.HeroID)
            })
            if (hero_order == 0) {
                select_hero_id = hero_data.HeroID
                SetHeroDetails(hero_data.HeroID);
            }

            hero_order++;
        }
    }
    // $.Msg(["setStorage talent_config_index"])
    // HeroPopups_Talent.Data<PanelDataObject>().talent_config_index = config_index
    if (GameUI.CustomUIConfig().getStorage("talent_config_index") == null) {
        GameUI.CustomUIConfig().setStorage("talent_config_index", config_index);
    }

    //初始化属性
    HeroAttributeList.RemoveAndDeleteChildren();
    // for (let attr_key of ATTRIBUTE_LIST) {
    //     let _Panel = $.CreatePanel("Panel", HeroAttributeList, "");
    //     let PanelAttributeRow = LoadCustomComponent(_Panel, "row_attribute");
    //     PanelAttributeRow.SetAttributeMainKey(attr_key, 999, 999)
    // }

    HeroTalentBtn.SetPanelEvent("onactivate", OpenHeroTalent)
    UpStarBtn.SetPanelEvent("onactivate", OpenHeroStarUp)

    InitHeroTalentView()
    InitHeroStarUpView()
    // 读取所有英雄天赋数据
    GameEvents.SendCustomGameEventToServer("ServiceTalent", {
        event_name: "GetPlayerServerTalent",
        params: {}
    })


}



const OpenHeroTalent = () => {
    if (select_hero_id == -1) { return }
    OpenHeroTalentView(select_hero_id)
}

const OpenHeroStarUp = () => {
    if (select_hero_id == -1) { return }
    OpenStarUpPage(select_hero_id)
}
(() => {
    Init();
})();