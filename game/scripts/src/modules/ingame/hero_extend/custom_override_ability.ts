import { reloadable } from "../../../utils/tstl-utils";



/** 修改技能 */
@reloadable
export class CustomOverrideAbility {

    AbilitySpecialObject: { [player: string]: AbilitySpecialObjectProps };
    AbilitySpecialValue: { [player: string]: AbilitySpecialValueProps };

    // PlayerUpgradesTable:{}; // 玩家升级树
    constructor() {
        print("[CustomOverrideAbility]:constructor")
        this.AbilitySpecialObject = {}
        this.AbilitySpecialValue = {}
    }

    /**
     * 初始玩家的SV值
     * @param player_id 
     */
    InitAbilitySpecialValue(player_id: PlayerID, hUnit: CDOTA_BaseNPC) {
        hUnit.AbilityUpgrades = {};
        this.AbilitySpecialObject[player_id] = {}
        this.AbilitySpecialValue[player_id] = {};
        CustomNetTables.SetTableValue("unit_special_value", tostring(player_id), hUnit.AbilityUpgrades);
        hUnit.AddNewModifier(hUnit, null, "modifier_custom_ability_upgrades", {})
    }

    GetPlayerSpecialValue(player_id: PlayerID, ability_name: string) {
        return this.AbilitySpecialValue[player_id][ability_name]
    }

    /**
     * 修改技能的special value
     * @param player_id 玩家
     * @param ability_name 技能名字
     * @param special_key  技能key
     * @param special_type 乘区[加算,乘算]
     * @param value 数值
     * @returns 
     */
    ModifySpecialValue(player_id: PlayerID, ability_name: string, special_key: string, special_type: AbilitySpecialTypes, value: number) {
        if (value == 0) { return }
        if (this.AbilitySpecialObject[player_id][ability_name] == null) {
            this.AbilitySpecialObject[player_id][ability_name] = {}
            this.AbilitySpecialValue[player_id][ability_name] = {}
        }
        if (this.AbilitySpecialObject[player_id][ability_name][special_key] == null) {
            this.AbilitySpecialValue[player_id][ability_name][special_key] = {
                base_value: 0,
                mul_value: 1,
            }
            this.AbilitySpecialObject[player_id][ability_name][special_key] = {
                base_value: 0,
                mul_list: [],
                amount: 0,
            }
        }

        this.AbilitySpecialObject[player_id][ability_name][special_key].amount += 1;
        
        if (special_type == "Base") {
            this.AbilitySpecialObject[player_id][ability_name][special_key].base_value += value;
            this.AbilitySpecialValue[player_id][ability_name][special_key]["base_value"] = this.AbilitySpecialObject[player_id][ability_name][special_key].base_value
        } else if (special_type == "Percent") {
            let mul_input = (100 + value) * 0.01
            this.AbilitySpecialObject[player_id][ability_name][special_key].mul_list.push(mul_input);
            let mul_list = this.AbilitySpecialObject[player_id][ability_name][special_key].mul_list;
            let mul_value = 1;
            for (let row_value of mul_list) {
                mul_value *= row_value;
            }
            this.AbilitySpecialValue[player_id][ability_name][special_key]["mul_value"] = mul_value
        }
        this.UpdateUpgradeStatus(player_id)
    }

    /**
     * 更新技能SV值
     * @param player_id 
     */
    UpdateUpgradeStatus(player_id: PlayerID) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        hHero.AbilityUpgrades = this.AbilitySpecialValue[player_id];
        CustomNetTables.SetTableValue("unit_special_value", tostring(player_id), hHero.AbilityUpgrades);
        const KvBuff = hHero.FindModifierByName("modifier_custom_ability_upgrades");
        if (KvBuff) {
            KvBuff.ForceRefresh()
        }
    }

    /**
     * 技能进化
     * @param player_id 
     * @param ability_name 
     * @param evo_key 进化的KEY值
     */
    AbilityEvolution(player_id: PlayerID, ability_name: string, evo_key: string) {

    }
}