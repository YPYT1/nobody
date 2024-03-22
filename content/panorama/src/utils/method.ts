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