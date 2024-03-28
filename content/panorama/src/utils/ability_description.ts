import { default as NpcAbilityCustom } from "./../json/npc_abilities_custom.json";
import { FormatDescription, FormatLocalize } from "./method";


const DamageTypeLabel: { [key: string]: string; } = {
    "none": "无",
    "phy": "物理",
    "fire": "<span class='fire'>火元素</span>",
    "water": "<span class='water'>水元素</span>",
    "earth": "<span class='earth'>土元素</span>",
    "wind": "<span class='wind'>风元素</span>",
};

/** 被动伤害公式 */
export function HeroPassiveDamageFormula(abilityName: string, formula: string, level: number) {
    if (formula == null) { return "0"; }
    let attr_list = formula.split("+");
    let str_arr: string[] = [];
    let abilityData = NpcAbilityCustom[abilityName as "public_phase_move"];
    for (let k of attr_list) {
        let arr1: string[] = [];
        let attr2 = k.split("*");
        for (let k2 of attr2) {
            if (parseFloat(k2)) {
                arr1.push(`<span class="val">${(parseFloat(k2) * 100).toFixed(0)}%</span>`);
            } else {
                let attr_text = $.Localize(`#dota_custom_attribute_${k2}`);
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
                        arr1.push(`<span class="val">${(value * 100).toFixed(0)}%</span>${attr_text}`);
                    }
                } else {
                    arr1.push(`${attr_text}`);
                }

            }
        }
        if (arr1.length > 0) {
            str_arr.push(arr1.join("*"));
        }
    }
    return str_arr.join("+");
}

export function SetAbilityDescription(
    name: string | null,
    entityIndex?: AbilityEntityIndex,
    level: number = 1,
) {

    if (name == null) {
        if (entityIndex) {
            name = Abilities.GetAbilityName(entityIndex);
        } else {
            name = "null";
        }
    }

    if (entityIndex) {
        level = Abilities.GetLevel(entityIndex);
    }
    $("#AbilityDamageType")?.SetHasClass("Hidden", true);
    let abilityData = NpcAbilityCustom[name as "public_phase_move"];
    let AbilityValues: AbilityValuesProps = abilityData.AbilityValues;
    let original_description_txt = FormatDescription(name, AbilityValues, level, undefined);
    // $.Msg(["original_description_txt",original_description_txt])
    if (original_description_txt.search("#") == 0) { return ""; }
    // 解锁
    // $.Msg(["abilityData.DamageFormula",abilityData.DamageFormula])
    // if (abilityData.DamageFormula || abilityData.DamageFormula == "0") {
    //     $("#AbilityDamageType")?.SetHasClass("Hidden", false);
    //     let damage_formula = abilityData.DamageFormula;
    //     if (damage_formula) {
    //         let damageFormula_desc = HeroPassiveDamageFormula(name, damage_formula, level);
    //         original_description_txt = original_description_txt.replace("%DamageFormula%", "【" + damageFormula_desc + "】");
    //     }
    //     if (abilityData.ElementType) {
    //         const ElementType = abilityData.ElementType;
    //         // $.Msg(["ElementType", ElementType]);
    //         $("#CustomTooltipItem").SetDialogVariable("damagetype", DamageTypeLabel[ElementType] ?? "无");
    //     } else {
    //         $("#CustomTooltipItem").SetDialogVariable("damagetype", "无");
    //     }
    //     let IsUltimate = false;
    //     let formula_text = ``;
    //     if (abilityData.AbilityType == "DOTA_ABILITY_TYPE_ULTIMATE") {
    //         IsUltimate = true;
    //         formula_text += `<br><br><span class="">${$.Localize("#custom_text_upgrade_ultimate")}</span>`;
    //     } else {
    //         formula_text += `<br><br><span class="">${$.Localize("#custom_text_upgrade_passive")}</span>`;
    //     }

    //     for (let order of [0, 1]) {
    //         let awaken = "awaken_" + (order + 1);
    //         let awaken_text = FormatLocalize(`#DOTA_Tooltip_Ability_${name}_${awaken}`, AbilityValues);
    //         const normal_lv = [2, 6];
    //         const ultimate_lv = [2, 4];
    //         let ability_lv = 0;
    //         if (abilityData.AbilityType == "DOTA_ABILITY_TYPE_ULTIMATE") {
    //             ability_lv = ultimate_lv[order];
    //         } else {
    //             ability_lv = normal_lv[order];
    //         }
    //         let state_class = level >= ability_lv ? "enable" : "disable";
    //         // $.Msg(awaken_text)
    //         if (awaken_text.search("#") != 0) {
    //             formula_text += `<br><br><span class="${state_class}"> Lv.${ability_lv}解锁 :${awaken_text}</span>`;
    //         }
    //     }
    //     original_description_txt += formula_text;
    // }

    return original_description_txt;
}