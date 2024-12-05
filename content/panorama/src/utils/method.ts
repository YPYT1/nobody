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

export function FormatDescription(
    original_description_txt: string,
    AbilityValues: CAPropAbilityValues,
    curr_level: number = 1,
    show_all: boolean = true,
) {
    for (let key in AbilityValues) {
        let _curr_level = curr_level
        let special_key = AbilityValues[key];
        let special_num: number[] = [];
        if (typeof (special_key) == "string") {
            let _arr = special_key.split(" ").map((v, k) => { return parseFloat(v); });
            special_num = _arr
        } else {
            special_num = [special_key]
        }

        let is_percent = original_description_txt.indexOf(`%${key}%%%`) != -1;
        // $.Msg(["is_percent", is_percent, key])
        if (show_all) {
            let special_value: string[] = [];

            for (let i = 1; i <= special_num.length; i++) {
                let class_name = i == _curr_level ? "Current" : "OtherVariable";
                if (_curr_level >= i && i == special_num.length) {
                    class_name = "Current"
                }
               
                let is_negative = special_num[i - 1] < 0;
                let value = Math.abs(special_num[i - 1]) 
                let col_value = `<span class="${class_name} ${is_negative ? "is_negative" : ""}">${value}${is_percent ? "%" : ""}</span>`
                special_value.push(col_value)
            }

            original_description_txt = original_description_txt.replaceAll(
                `%${key}%%%`,
                `<span class="GameplayVariable">${special_value.join("<span class='Separator'> / </span>")}</span>`
            );
            original_description_txt = original_description_txt.replaceAll(
                `%${key}%`,
                `<span class="GameplayVariable">${special_value.join("<span class='Separator'> / </span>")}</span>`
            );
        } else {
            if (_curr_level <= 0) { _curr_level = 1; }
            _curr_level = Math.min(_curr_level, special_num.length)
            let is_negative = special_num[_curr_level - 1] < 0;
            let value = Math.abs(special_num[_curr_level - 1]) ;
            let col_value = `<span class="GameplayVariable Current ${is_negative ? "is_negative" : ""}">${value}${is_percent ? "%" : ""}</span>`
            original_description_txt = original_description_txt.replaceAll(
                `%${key}%%%`,
                col_value
            );
            original_description_txt = original_description_txt.replaceAll(
                `%${key}%`,
                col_value
            );
        }

    }
    original_description_txt = original_description_txt.replaceAll("\n", "<br>");
    return original_description_txt;
}

export function GetUnitModifierStack(unit: EntityIndex, modifier_name: string) {
    let buff_count = Entities.GetNumBuffs(unit);
    for (let i = 0; i < buff_count; i++) {
        let buff_id = Entities.GetBuff(unit, i);
        let buff_name = Buffs.GetName(unit, buff_id);
        if (buff_name == modifier_name) {
            return Buffs.GetStackCount(unit, buff_id);
        }
    }
    return 1;
}

export function UnitHasModifier(unit: EntityIndex, modifier_name: string) {
    let buff_count = Entities.GetNumBuffs(unit);
    // $.Msg(["buff_count",buff_count])
    for (let i = 0; i < buff_count; i++) {
        let buff_id = Entities.GetBuff(unit, i);
        let buff_name = Buffs.GetName(unit, buff_id);
        // $.Msg(["modifier_name", modifier_name, buff_name]);
        if (buff_name == modifier_name) {
            return true;
        }
    }
    // $.Msg(["modifier_name", modifier_name, false]);
    return false;
}

export function FormatDescriptionExtra(
    description_txt: string,
    ObjectValues: CAPropObjectValues,
    curr_level: number = 1,
    show_all: boolean = true,
    ObjectPercent:number = 100,
) {

    for (let key in ObjectValues) {
        for (let sub_key in ObjectValues[key]) {
            let special_key = ObjectValues[key][sub_key];
            let special_num: number[] = [];
            if (typeof (special_key) == "string") {
                let _arr = special_key.split(" ").map((v, k) => { return parseFloat(v); });
                special_num = _arr
            } else {
                special_num = [special_key]
            }

            let is_percent = description_txt.indexOf(`%${key}.${sub_key}%%%`) != -1;
            // $.Msg(["is_percent", is_percent, key])
            if (show_all) {
                let special_value: string[] = [];

                for (let i = 1; i <= special_num.length; i++) {
                    let class_name = i == curr_level ? "Current" : "OtherVariable";
                    if (curr_level >= i && i == special_num.length) {
                        class_name = "Current"
                    }
                    let value = special_num[i - 1]
                    let is_negative = value < 0;
                    let col_value = `<span class="${class_name} ${is_negative ? "is_negative" : ""}">${Math.abs(value)}${is_percent ? "%" : ""}</span>`
                    special_value.push(col_value)
                }

                description_txt = description_txt.replaceAll(
                    `%${key}.${sub_key}%%%`,
                    `<span class="GameplayVariable">${special_value.join(" / ")}</span>`
                );
                description_txt = description_txt.replaceAll(
                    `%${key}.${sub_key}%`,
                    `<span class="GameplayVariable">${special_value.join(" / ")}</span>`
                );
            } else {
                if (curr_level <= 0) { curr_level = 1; }
                curr_level = Math.min(curr_level, special_num.length)
                let value = special_num[curr_level - 1] * ObjectPercent * 0.01;
                // $.Msg(["value",value])
                let is_negative = value < 0;
                let col_value = `<span class="GameplayVariable Current ${is_negative ? "is_negative" : ""}">${Math.abs(value)}${is_percent ? "%" : ""}</span>`
                description_txt = description_txt.replaceAll(
                    `%${key}.${sub_key}%%%`,
                    col_value
                );
                description_txt = description_txt.replaceAll(
                    `%${key}.${sub_key}%`,
                    col_value
                );
            }
        }
    }
    
    description_txt = description_txt.replaceAll("\n", "<br>");
    return description_txt;
}

export function FormatNumberToTime(time: number) {
    let min = Math.floor(time / 60);
    let sec_num = Math.floor(time % 60);
    let sec = sec_num < 10 ? `0${sec_num}` : `${sec_num}`;
    return [min, sec];
}