import { default as NpcAbilityCustom } from "./../json/npc_abilities_custom.json";
import { FormatDescription, FormatLocalize } from "./method";


const DamageTypeLabel: { [key: string]: string; } = {
    "0": "无",
    "1": "<span class='fire'>火元素</span>",
    "2": "<span class='water'>冰元素</span>",
    "3": "<span class='thunder'>雷元素</span>",
    "4": "<span class='wind'>风元素</span>",
    "5": "<span class='light'>光元素</span>",
    "6": "<span class='dark'>暗元素</span>",
};

/** 被动伤害公式 */
export function HeroPassiveDamageFormula(abilityName: string, formula: string, level: number, element: number = 0) {
    if (formula == null) { return "0"; }
    let attr_list = formula.split("+");
    let str_arr: string[] = [];
    let abilityData = NpcAbilityCustom[abilityName as "public_template"];
    for (let k of attr_list) {
        const bHasAsterisk = k.includes("*")
        let arr1: string[] = [];
        let attr2 = k.split("*");
        for (let k2 of attr2) {
            if (parseFloat(k2)) {
                let value = bHasAsterisk ? (parseFloat(k2) * 100).toFixed(0) + "%" : k2
                arr1.push(`<span class="Variable">${value}</span>`);
            } else {
                let attr_text = $.Localize(`#custom_attribute_${k2}`);
                let special_num = abilityData.AbilityValues[k2 as keyof typeof abilityData.AbilityValues] as number | string;
                // $.Msg(["special_num", special_num]);
                if (special_num != null) {
                    let value = 0;
                    if (typeof (special_num) == "number") {
                        value = parseFloat(`${special_num}`);
                    } else {
                        if (level > special_num.split(" ").length) {
                            level = special_num.split(" ").length;
                        } else if (level == 0) {
                            level = 1;
                        }
                        // $.Msg(["level",level])
                        value = parseFloat(special_num.split(" ")[level - 1]);
                    }

                    if (value != 0) {
                        arr1.push(`<span class="Variable">${(value * 100).toFixed(0)}%</span>${attr_text}`);
                    }
                } else {
                    arr1.push(`${attr_text}`);
                }

            }
        }
        if (arr1.length > 0) {
            str_arr.push(arr1.join(""));
        }
    }
    let element_dam_label = " · " + DamageTypeLabel[`${element}`]
    return str_arr.join("+") + element_dam_label;
}

export function SetAbilityDescription(
    ability_name: string | null,
    entityIndex?: AbilityEntityIndex,
    level: number = 1,
) {

    if (ability_name == null) {
        if (entityIndex && entityIndex > 0) {
            ability_name = Abilities.GetAbilityName(entityIndex);
        } else {
            ability_name = "null";
        }
    }

    if (entityIndex && entityIndex > 0) {
        level = Abilities.GetLevel(entityIndex);
    }
    // $("#AbilityDamageType")?.SetHasClass("Hidden", true);
    let abilityData = NpcAbilityCustom[ability_name as "public_template"];
    if (abilityData == null) { return "" }
    let AbilityValues: AbilityValuesProps = abilityData.AbilityValues;
    let original_description_txt = FormatDescription(ability_name, AbilityValues, level, undefined, entityIndex);
    if (original_description_txt.search("#") == 0) { return ""; }

    original_description_txt = original_description_txt.replaceAll(
        "%AbilityCooldown%",
        `<span class="GameplayVariable">${abilityData.AbilityCooldown ?? 0}</span>`
    );
    if (abilityData.DamageFormula || abilityData.DamageFormula == "0") {
        // $("#AbilityDamageType")?.SetHasClass("Hidden", false);
        let damage_formula = abilityData.DamageFormula;
        if (damage_formula) {
            // $.Msg(["damage_formula",damage_formula])
            let damageFormula_desc = HeroPassiveDamageFormula(ability_name, `${damage_formula}`, level, abilityData.Element ?? "0");
            original_description_txt = original_description_txt.replaceAll("%DamageFormula%", damageFormula_desc);
        } else {
            original_description_txt = original_description_txt.replaceAll("%DamageFormula%", "0");
        }
    }

    return original_description_txt;
}

export const GetAbilityInfoData = (ability_name: string) => {

    let ability_info = {
        "Element": 0,
        "Category": ["null"],
        "Rarity": 0,
    }
}


/** 获取技能品质 
 *  1白2绿3蓝4紫5金6橙7红8黑9彩
*/
export const GetAbilityRarity = (ability_name: string) => {
    let abilityData = NpcAbilityCustom[ability_name as "public_template"];
    if (abilityData != null) {
        return abilityData.Rarity ?? 1
    } else {
        return 1
    }
}

export const GetAbilityTypeCategory = (ability_name: string) => {
    let abilityData = NpcAbilityCustom[ability_name as "arms_t0_1"];
    if (abilityData != null && abilityData.Category) {
        let category_str = `${abilityData.Category}`;
        let cate_list = category_str.split(",");
        let cate_label: string[] = [];
        cate_list.map((v, k) => {
            cate_label.push(v)
        })
        return cate_label
    } else {
        return ["null"]
    }
}

export const GetAbilityElementLabel = (ability_name: string) => {
    let abilityData = NpcAbilityCustom[ability_name as "arms_t0_1"];
    if (abilityData != null && abilityData.Element) {
        if (abilityData.Element != 0) {
            return abilityData.Element
        } else {
            return 0
        }
    } else {
        return 0
    }
}