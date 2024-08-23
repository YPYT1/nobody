import { reloadable } from "../../../utils/tstl-utils";

/** 增益效果操作 */
@reloadable
export class BuffManager {

    constructor() {

    }

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
        if (hUnit.IsBossCreature()) { return; }
        if (state == DebuffTypes.stunned) {
            // 判断眩晕
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
        } else if (state == DebuffTypes.paralysis) {
            hUnit.AddNewModifier(hCaster, null, "modifier_debuff_rooted", { duration: duration, });
        } else if (state == DebuffTypes.chaos) {
            hUnit.AddNewModifier(hCaster, null, "modifier_debuff_chaos", { duration: duration, });
        }
    }

    AddPermanentMdf(
        hCaster: CDOTA_BaseNPC,
        hUnit: CDOTA_BaseNPC,
        hAbility: CDOTABaseAbility,
        mdf_name: string,
        mdf_object: Object
    ) {
        if (hUnit.IsAlive()) {
            hUnit.AddNewModifier(hCaster, hAbility, mdf_name, mdf_object);
        } else {
            // if (hUnit.buff_queue == null) { hUnit.buff_queue = [] }
            // hUnit.buff_queue.push({ mdf_name: mdf_name, mdf_object: mdf_object, })
            hUnit.SetThink((e) => {
                if (hUnit.IsAlive()) {
                    hUnit.AddNewModifier(hCaster, hAbility, mdf_name, mdf_object);
                    return null
                }
                return 1
            }, this, "ThinkAddMdf", 1)
        }
    }

    ThinkAddMdf() {

    }
}