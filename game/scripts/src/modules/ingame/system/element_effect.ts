
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
        hTarget.AddNewModifier(hCaster, hAbility, "modifier_element_effect_fire", {
            duration: 3
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

        hTarget.AddNewModifier(hCaster, null, "modifier_element_effect_ice", {
            duration: 3
        })
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
            hTarget.AddNewModifier(hCaster, null, "modifier_element_effect_thunder", {
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
        hTarget.AddNewModifier(hTarget, null, "modifier_knockback_lua", {
            center_x: origin.x,
            center_y: origin.y,
            center_z: 0,
            knockback_distance: 50,
            knockback_duration: 0.25,
            duration: 0.5,
        })
        // if(hCaster.CustomVariables["wind_element_features"] )
    }


}