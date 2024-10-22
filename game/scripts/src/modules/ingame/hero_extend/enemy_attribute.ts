import { reloadable } from "../../../utils/tstl-utils";

import * as EnemyAttributeConst from "../../../json/config/game/enemy_attribute_const.json";
import * as MonsterBossJson from "../../../json/units/monster/boss.json";


@reloadable
export class EnemyAttribute {

    constructor() {
        // print("[EnemyAttribute]:constructor")
    }

    SetUnitAttr(hUnit: CDOTA_BaseNPC) {
        hUnit.enemy_attribute_value = {
            FireResist: 0,
            IceResist: 0,
            ThunderResist: 0,
            WindResist: 0,
            AllElementResist: 0,
            DmgReductionFixed: 0,
            FireDamageIncome: 0,
            "IceDamageIncome": 0,
            "ThunderDamageIncome": 0,
            "WindDamageIncome": 0,
            "LightDamageIncome": 0,
            "DarkDamageIncome": 0,
        };
        hUnit.custom_mul_attribute = {};
        hUnit.enemy_attribute_table_key = {};
        hUnit.enemy_attribute_table = {};
        hUnit.SpecialMark = {};
        for (let k in EnemyAttributeConst) {
            let attr_key = k as EnemyAttributeKey;
            hUnit.enemy_attribute_table[attr_key] = {
                "Base": 0
            }
        }
    }

    ModifyAttribute(hUnit: CDOTA_BaseNPC, AttrList: EnemyAttributeValueType, mode: number = 0) {
        if (hUnit.enemy_attribute_value == null) { hUnit.enemy_attribute_value = {} }
        if (hUnit.enemy_attribute_table == null) { hUnit.enemy_attribute_table = {} }

        if (mode == 0) {
            for (let key in AttrList) {
                let attr_key = key as keyof typeof AttrList;
                let is_mul = EnemyAttributeConst[attr_key].is_mul == 1;
                if (!is_mul) {
                    for (let k2 in AttrList[key]) {
                        if (k2 != "MulRegion") {
                            let value = AttrList[key][k2] as number;
                            hUnit.enemy_attribute_table[key][k2] += value
                        }
                    }
                }
            }
        } else {
            for (let key in AttrList) {
                let attr_key = key as keyof typeof AttrList;
                let is_mul = EnemyAttributeConst[attr_key].is_mul == 1;
                if (!is_mul) {
                    for (let k2 in AttrList[key]) {
                        if (k2 != "MulRegion") {
                            let value = AttrList[key][k2] as number;
                            hUnit.enemy_attribute_table[key][k2] -= value
                        }

                    }
                }
            }
        }


        this.AttributeCalculate(hUnit, Object.keys(AttrList) as AttributeMainKey[]);
    }

    SetAttributeInKey(hUnit: CDOTA_BaseNPC, key: string, attr_list: EnemyAttributeValueType, timer: number = -1) {
        if (hUnit.enemy_attribute_table_key == null) { hUnit.enemy_attribute_table_key = {} }
        for (let _key in attr_list) {
            let attr_key = _key as EnemyAttributeKey;
            let is_mul = EnemyAttributeConst[attr_key].is_mul == 1;
            if (is_mul) {
                if (hUnit.custom_mul_attribute[attr_key] == null) {
                    hUnit.custom_mul_attribute[attr_key] = {}
                }
                hUnit.custom_mul_attribute[attr_key][key] = (attr_list[attr_key].Base ?? 0)
            }
        }

        if (hUnit.enemy_attribute_table_key[key] == null) {
            hUnit.enemy_attribute_table_key[key] = attr_list;
            this.ModifyAttribute(hUnit, attr_list)
        } else {
            // 若已存在,进行覆盖时先对比差值 ,写入差值;
            let temp_attr_list = hUnit.enemy_attribute_table_key[key];
            let temp_object = {};
            for (let k in attr_list) {
                let row_data = attr_list[k as keyof typeof attr_list];
                temp_object[k] = {}
                for (let k2 in row_data) {
                    let attr_value = row_data[k2 as keyof typeof row_data];
                    let old_value = 0;
                    if (temp_attr_list[k] && temp_attr_list[k][k2]) {
                        old_value = temp_attr_list[k][k2]
                    }
                    temp_object[k][k2] = attr_value - old_value
                }
            }
            hUnit.enemy_attribute_table_key[key] = attr_list
            this.ModifyAttribute(hUnit, temp_object)
        }



        if (timer >= 0) {
            const timer_key = "attr_timer_" + key;
            hUnit.SetContextThink(
                timer_key,
                () => {
                    let temp_attr_list = hUnit.enemy_attribute_table_key[key];
                    for (let attr_key in hUnit.custom_mul_attribute) {
                        hUnit.custom_mul_attribute[attr_key as AttributeMainKey][key] = null
                    }
                    this.ModifyAttribute(hUnit, temp_attr_list, -1)
                    hUnit.enemy_attribute_table_key[key] = null;
                    // 移除增益属性
                    return null;
                },
                timer
            );
        }
    }

    /** 计算属性 */
    AttributeCalculate(hUnit: CDOTA_BaseNPC, attr_key: AttributeMainKey[]) {
        for (let main_key of attr_key) {
            let is_mul = EnemyAttributeConst[main_key].is_mul == 1;
            if (!is_mul) {
                // 非乘算属性
                let SubAttr = hUnit.enemy_attribute_table[main_key as keyof typeof hUnit.enemy_attribute_table];
                let TotalAttrValue = (SubAttr["Base"]) * (1 + (SubAttr["BasePercent"] ?? 0) * 0.01)
                hUnit.enemy_attribute_value[main_key] = TotalAttrValue;
            } else {
                // 乘算属性处理
                if (hUnit.custom_mul_attribute[main_key]) {
                    let attr_values = Object.values(hUnit.custom_mul_attribute[main_key]);
                    let base_value = 100;
                    for (let value of attr_values) {
                        base_value *= (100 - value) * 0.01;
                    }
                    hUnit.enemy_attribute_value[main_key] = math.floor(100 - base_value);
                }

            }
        }


    }

    /** 删除一个key值的相关属性 */
    DelAttributeInKey(hUnit: CDOTA_BaseNPC, key: string) {
        if (hUnit.enemy_attribute_table_key[key] == null) { return; }
        let temp_attr_list = hUnit.enemy_attribute_table_key[key];
        hUnit.enemy_attribute_table_key[key] = null;
        this.ModifyAttribute(hUnit, temp_attr_list, -1)
    }

    /** 注册施法动画 */
    SetCastAnimation(hUnit: CDOTA_BaseNPC) {
        hUnit.custom_animation = {};
        let unit_name = hUnit.GetUnitName();
        let unit_kv = MonsterBossJson[unit_name as "npc_creature_boss_14"];
        if (unit_kv == null){ return }
        

    }
}