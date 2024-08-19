
import { reloadable } from "../../../utils/tstl-utils";

/**
 * 元素效果
 */
@reloadable
export class ElementEffect {

    constructor() {

    }

    /** 设置火元素效果 */
    SetFirePrimary(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC) {
        let hAbility = hCaster.FindAbilityByName("public_attribute");
        let burning_duration = hCaster.custom_attribute_value["BurningDuration"];
        hTarget.AddNewModifier(hCaster, hAbility, "modifier_element_effect_fire", {
            duration: burning_duration,
        })
    }

    SetIcePrimary(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC) {
        if (hTarget.HasModifier("modifier_element_effect_ice")) {
            if (RollPercentage(15)) {
                hTarget.AddNewModifier(hCaster, null, "modifier_element_effect_ice_frozen", {
                    duration: 1
                })
            }
        }

        let buff = hTarget.AddNewModifier(hCaster, null, "modifier_element_effect_ice", {
            duration: 3
        })
        if (hCaster.prop_level_index["prop_21"] && buff) {
            // prop_21	【斯嘉蒂之眼】	冰元素技能降低移速时，同时降低敌人30%攻击速度和20%冰元素抗性，持续3秒
            hTarget.AddNewModifier(hCaster, null, "modifier_shop_prop_21", {
                duration: 3
            })
        }
    }

    /**
     * 雷元素技能附带1秒麻痹效果 相同单位10秒内最多生效一次，被麻痹的单位雷元素抗性降低10%
     * @param hCaster 
     * @param hTarget 
     */
    SetThunderPrimary(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC) {
        if (
            !hTarget.HasModifier("modifier_element_effect_thunder_immune")
            && !hTarget.HasModifier("modifier_element_effect_thunder")
        ) {
            hTarget.AddNewModifier(hTarget, null, "modifier_element_effect_thunder", {
                duration: 1
            })
        }
    }

    SetWindPrimary(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC, origin: Vector) {
        // 风系击退,内置CD
        if (hTarget.HasModifier("modifier_element_effect_wind_immune")) { return }
        hTarget.AddNewModifier(hTarget, null, "modifier_element_effect_wind_immune", {
            duration: 10
        })

        hTarget.AddNewModifier(hCaster, null, "modifier_knockback_lua", {
            center_x: origin.x,
            center_y: origin.y,
            center_z: 0,
            knockback_distance: 50,
            knockback_duration: 0.25,
            duration: 0.5,
        });

        // prop_23	【风儿吹】	风元素技能命中敌人时，被击退的敌人降低20%元素抗性并眩晕1秒
        if (hCaster.prop_level_index["prop_23"]) {
            let stun = GameRules.MysticalShopSystem.GetKvOfUnit(hCaster, "prop_23", 'stun')
            let value = GameRules.MysticalShopSystem.GetKvOfUnit(hCaster, "prop_23", 'value')
            GameRules.EnemyAttribute.SetAttributeInKey(hTarget, "prop_23", {
                "WindResist": {
                    "Base": value
                }
            }, stun)
            GameRules.BuffManager.AddGeneralDebuff(hCaster, hTarget, DebuffTypes.stunned, stun)
        }
        
        // if(hCaster.CustomVariables["wind_element_features"] )
    }


}