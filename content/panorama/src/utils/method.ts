/**
 * 通过玩家ID获得颜色
 * @param i 
 * @returns 
 */
export function PlayerIdToARGB(i: number) {
    return ('00' + (i & 0xFF).toString(16)).substr(-2) +
        ('00' + ((i >> 8) & 0xFF).toString(16)).substr(-2) +
        ('00' + ((i >> 16) & 0xFF).toString(16)).substr(-2) +
        ('00' + ((i >> 24) & 0xFF).toString(16)).substr(-2);
}

const unit_label = ["", "万", "亿", "兆", "京"];
export const FormatIntToString = (value: number) => {
    let value_str = String(value);
    let value_len = value_str.length; // 13/ 4 = 3
    if (value_len < 9) {
        return value_str;
    }
    //push()
    let strlist: string[] = [];
    let cut_count = Math.ceil(value_len / 4);
    let y = value_len % 4;
    // $.Msg(["value_str", value_str, "y", y, value_len, "cut_count", cut_count]);
    for (let i = 0; i < cut_count; i++) {
        let str = "";
        if (i == (cut_count - 1)) {
            if (y == 0) {
                str = value_str.substring(0, 4);
            } else {
                str = value_str.substring(0, y);
            }
        } else {
            str = value_str.substring((value_len - (i + 1) * 4), (value_len - i * 4));
        }
        strlist.push(str);
    }
    let extend_txt = "";
    // $.Msg(["strlist", strlist]);
    let ii = 0;
    for (let i = (strlist.length - 1); i >= 0; i--) {
        if (ii >= 2) { break; }
        ii++;
        extend_txt += (strlist[i] + unit_label[i]);
    }
    return extend_txt;
};

export function FormatLocalize(key: string, AbilityValues: AbilityValuesProps, level: number = 1, AbilityValues2?: AbilityValuesProps) {
    let original_description_txt = $.Localize(key);
    if (level <= 0) { level = 1; }
    for (let key in AbilityValues) {
        let special_key = AbilityValues[key];
        let special_num = 0;
        if (typeof (special_key) == "string") {
            let _arr = special_key.split(" ").map((v, k) => { return parseFloat(v); });
            const kv_value_len = _arr.length;
            if (level >= kv_value_len) {
                special_num = _arr[kv_value_len - 1];
            } else {
                special_num = _arr[level - 1];
            }
        } else {
            special_num = special_key;
        }
        let is_negative = special_num < 0;
        special_num = Math.abs(special_num);
        let special_value = special_num % 1 ? special_num.toFixed(2) : special_num.toFixed(0);
        let value = special_value;
        original_description_txt = original_description_txt.replace(
            `%${key}%%%`,
            `<span class="GameplayVariable ${is_negative ? "negative" : ""}">${value}%</span>`
        );
        original_description_txt = original_description_txt.replace(
            `%${key}%`,
            `<span class="GameplayVariable ${is_negative ? "negative" : ""}">${value}</span>`
        );
    }

    if (AbilityValues2) {
        for (let key in AbilityValues2) {
            let special_key = AbilityValues2[key];
            let special_num = 0;
            if (typeof (special_key) == "string") {
                let _arr = special_key.split(" ").map((v, k) => { return parseFloat(v); });
                const kv_value_len = _arr.length;
                if (level >= kv_value_len) {
                    special_num = _arr[kv_value_len - 1];
                } else {
                    special_num = _arr[level - 1];
                }
            } else {
                special_num = special_key;
            }
            let is_negative = special_num < 0;
            special_num = Math.abs(special_num);
            let special_value = special_num % 1 ? special_num.toFixed(2) : special_num.toFixed(0);
            let value = special_value;
            original_description_txt = original_description_txt.replace(
                `%${key}%%%`,
                `<span class="GameplayVariable ${is_negative ? "negative" : ""}">${value}%</span>`
            );
            original_description_txt = original_description_txt.replace(
                `%${key}%`,
                `<span class="GameplayVariable ${is_negative ? "negative" : ""}">${value}</span>`
            );
        }
    }


    return original_description_txt;
}

export function FormatDescription(
    name: string,
    AbilityValues: AbilityValuesProps,
    level: number = 1,
    AbilityValues2?: AbilityValuesProps,
    entityIndex?: AbilityEntityIndex,
) {
    let original_description_txt = $.Localize(`#DOTA_Tooltip_Ability_${name}_Description`);
    // original_description_txt = GameUI.ReplaceDOTAAbilitySpecialValues(name, original_description_txt)!;
    // $.Msg(original_description_txt)
    if (level <= 0) { level = 1; }

    for (let key in AbilityValues) {
        let special_key = AbilityValues[key];
        let special_num = 0;
        if (entityIndex && entityIndex > 0) {
            special_num = Abilities.GetSpecialValueFor(entityIndex, key)
        } else {
            if (typeof (special_key) == "string") {
                let _arr = special_key.split(" ").map((v, k) => { return parseFloat(v); });
                const kv_value_len = _arr.length;
                if (level >= kv_value_len) {
                    special_num = _arr[kv_value_len - 1];
                } else {
                    special_num = _arr[level - 1];
                }
            } else {
                special_num = special_key;
            }
        }

        let is_negative = special_num < 0;
        if (is_negative) { special_num = Math.abs(special_num); }
        let special_value = special_num % 1 ? special_num.toFixed(2) : special_num.toFixed(0);
        let value = special_value;
        original_description_txt = original_description_txt.replaceAll(
            `%${key}%%%`,
            `<span class="GameplayVariable ${is_negative ? "negative" : ""}">${value}%</span>`
        );
        original_description_txt = original_description_txt.replaceAll(
            `%${key}%`,
            `<span class="GameplayVariable ${is_negative ? "negative" : ""}">${value}</span>`
        );
    }


    original_description_txt = original_description_txt.replaceAll("\n", "<br>");
    return original_description_txt;
}