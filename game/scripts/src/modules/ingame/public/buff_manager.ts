import { reloadable } from "../../../utils/tstl-utils";

/** 增益效果操作 */
@reloadable
export class BuffManager {

    constructor() { }

    /**
     * 
     * @param hCaster 
     * @param hAbility 
     * @param hUnit 
     * @param state 
     * @param duration 
     * @param value 
     */
    AddGeneralDebuff(
        hCaster: CDOTA_BaseNPC,
        hUnit: CDOTA_BaseNPC,
        state: DebuffTypes,
        duration: number = 1,
        value: number = 1,
    ) {
        if (state == DebuffTypes.stunned) {
            // 判断眩晕
            if (hUnit.IsBossCreature()) { return; }
            let debuff = hUnit.FindModifierByName("modifier_debuff_stunned");
            let current_duration = debuff ? debuff.GetDuration() : 0;
            if (duration > current_duration) {
                hUnit.AddNewModifier(hCaster, null, "modifier_debuff_stunned", { duration: duration });
            }

        } else if (state == DebuffTypes.rooted) {
            let debuff = hUnit.FindModifierByName("modifier_debuff_rooted");
            let current_duration = debuff ? debuff.GetDuration() : 0;
            if (duration > current_duration) {
                hUnit.AddNewModifier(hCaster, null, "modifier_debuff_rooted", { duration: duration, });
            }
        }
    }
}