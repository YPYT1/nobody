
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
        let hAbility = hCaster.FindAbilityByName("public_attribute");
        hTarget.AddNewModifier(hCaster, hAbility, "modifier_element_effect_ice", {
            duration: 3
        })
    }
}