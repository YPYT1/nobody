
import { default as AttributeConst } from "../json/config/game/attribute_const.json";
import { default as NpcItemCustom } from "../json/npc_items_custom.json";
import { default as NpcAbilitiesCustom } from "../json/npc_abilities_custom.json";

/** 获取物品的属性 */
export const GetItemAttribute = (item_name: string) => {
    let item_data = NpcItemCustom[item_name as keyof typeof NpcItemCustom];
    if (item_data.AttributeValues) {
        let AttributeValues = item_data.AttributeValues as CustomAttributeTableType
        return AttributeValues
    } else {
        return {}
    }

}

// export const GetAbilityAttribute = (name: string) => {
//     let ability_data = NpcAbilitiesCustom[name as "arms_t0_1"];
//     if (ability_data != null && ability_data.AttributeValues) {
//         let AttributeValues = ability_data.AttributeValues as CustomAttributeTableType
//         return AttributeValues
//     } else {
//         return {}
//     }

// }
/**
 * 转化KV数据
 * @param keyValue 
 * @param level 
 */
export const ConvertAttributeValues = (
    keyValue: CustomAttributeTableType,
    level: number = 1,
    split_str: string = "<br>",
    multiple: number = 1
) => {
    let attr_list: string[] = [];
    for (let key in AttributeConst) {
        let main_key = key as AttributeMainKey;
        let main_table = keyValue[main_key]
        if (main_table != null) {
            for (let sub_key in main_table) {
                let sub_value = main_table[sub_key as keyof typeof main_table];
                if (sub_value) {
                    let row_key = `${main_key}_${sub_key}`
                    let row_text = FormatKeyValueToText(main_key, sub_key, sub_value);
                    attr_list.push(row_text)
                }

            }
        }
    }
    return attr_list.join(split_str);
};

const pre_sub_key = [
    "Base",
    "Bonus",
    "Fixed",
    "PreLvBase",
    "PreLvBonus",
    "PreLvFixed",
]

const percent_sub_key = [
    "BasePercent",
    "BonusPercent",
    "TotalPercent",
]

export const FormatKeyValueToText = (main_key: string, sub_key: string, v: string | number, level: number = 1, multiple: number = 1, extra_ratio: number = 0) => {
    let value = 0;
    if (typeof (v) == "number") {
        value = v;
    } else {
        let temp = v.split(" ");
        value = parseFloat(temp[level - 1]);
    }
    let is_negative = value < 0;
    let character = is_negative ? "-" : "+";

    value = Math.abs(value);
    let attr_label_main = $.Localize("#custom_attribute_" + main_key);
    let attr_label_sub = $.Localize("#custom_attribute_sub_" + sub_key);
    let percent_main = attr_label_main.search(/%/g);
    let percent_sub = attr_label_sub.search(/%/g);
    let attr_text = ""
    if (pre_sub_key.indexOf(sub_key) == -1) {
        // 后面
        attr_text = attr_label_main + attr_label_sub
    } else {
        attr_text = attr_label_sub + attr_label_main
    }
    let is_percent = percent_sub_key.indexOf(sub_key) != -1;
    let p = attr_text.search(/%/g);
    let symbol = "";
    let attr_value = (value * multiple);
    // 这里处理过长的百分比
    let attr_str = String(attr_value);
    if (attr_str.split(".").length > 1) {
        attr_value = parseFloat(attr_value.toFixed(2));
    }
    if (is_percent) {
        symbol = "%";
        // attr_text = attr_text.substr(1);
    }
    let text = `<span class='row'><span class='val ${is_negative && "negative"}'>${character} ${attr_value}${symbol}</span> `;
    if (extra_ratio > 0) {
        let extra_value = (value * extra_ratio).toFixed(2);
        let pct_str = "";
        if (p == 0) { pct_str = "%"; }
        let extra_text = `<span class="extra_val">(+${extra_value}${pct_str})</span>`;
        text += extra_text;
    }
    text += `<span class='key'>${attr_text}</span></span>`;

    return text;
};

export const ConvertAttributeToLabel = (attr_key: AttributeMainKey, value: number = 0) => {
    let is_pct = AttributeConst[attr_key].is_pct == 1;
    let res_label = "0";
    if (is_pct) {
        res_label = `${value.toFixed(2)}%`
    } else {
        res_label = `${Math.floor(value) }`
    }
    return res_label
}