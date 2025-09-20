import { reloadable } from '../../../utils/tstl-utils';

/** 增益效果操作 */
@reloadable
export class BuffManager {
    constructor() {}

    /**
     *
     * @param hCaster
     * @param hAbility
     * @param hUnit
     * @param state
     * @param duration
     * @param value
     */
    AddGeneralDebuff(hCaster: CDOTA_BaseNPC, hUnit: CDOTA_BaseNPC, state: DebuffTypes, duration: number = 1, value: number = 1) {
        if (hUnit.IsBossCreature()) {
            return;
        }
        if (state == DebuffTypes.stunned) {
            // 判断眩晕
            const debuff = hUnit.FindModifierByName('modifier_debuff_stunned');
            const current_duration = debuff ? debuff.GetDuration() : 0;
            if (duration > current_duration) {
                hUnit.AddNewModifier(hCaster, null, 'modifier_debuff_stunned', { duration: duration });
            }
        } else if (state == DebuffTypes.rooted) {
            const debuff = hUnit.FindModifierByName('modifier_debuff_rooted');
            const current_duration = debuff ? debuff.GetDuration() : 0;
            if (duration > current_duration) {
                hUnit.AddNewModifier(hCaster, null, 'modifier_debuff_rooted', { duration: duration });
            }
            ExecuteOrderFromTable({
                UnitIndex: hUnit.entindex(),
                OrderType: UnitOrder.STOP,
                Queue: false,
            });
        } else if (state == DebuffTypes.paralysis) {
            hUnit.AddNewModifier(hCaster, null, 'modifier_debuff_rooted', { duration: duration });
        } else if (state == DebuffTypes.chaos) {
            hUnit.AddNewModifier(hCaster, null, 'modifier_debuff_chaos', { duration: duration });
        } else if (state == DebuffTypes.un_controll) {
            hUnit.AddNewModifier(hCaster, null, 'modifier_debuff_uncontroll', { duration: duration });
        } else if (state == DebuffTypes.frozen) {
            hUnit.AddNewModifier(hCaster, null, 'modifier_element_effect_ice_frozen', { duration: duration });
        } else if (state == DebuffTypes.fatal) {
            hUnit.AddNewModifier(hCaster, null, 'modifier_state_fatal', { duration: duration });
        }
    }

    /** 移除通用DEbuff */
    RemoveGeneralDebuff(hUnit: CDOTA_BaseNPC, eStates: DebuffTypes[]) {
        for (const state of eStates) {
            if (state == DebuffTypes.stunned) {
                hUnit.RemoveModifierByName('modifier_debuff_stunned');
            } else if (state == DebuffTypes.rooted) {
                hUnit.RemoveModifierByName('modifier_debuff_rooted');
            } else if (state == DebuffTypes.chaos) {
                hUnit.RemoveModifierByName('modifier_debuff_chaos');
            } else if (state == DebuffTypes.un_controll) {
                hUnit.RemoveModifierByName('modifier_debuff_uncontroll');
            }
        }
    }

    AddPermanentMdf(hCaster: CDOTA_BaseNPC, hUnit: CDOTA_BaseNPC, hAbility: CDOTABaseAbility, mdf_name: string, mdf_object: Object) {
        if (hUnit.IsAlive()) {
            hUnit.AddNewModifier(hCaster, hAbility, mdf_name, mdf_object);
        } else {
            // if (hUnit.buff_queue == null) { hUnit.buff_queue = [] }
            // hUnit.buff_queue.push({ mdf_name: mdf_name, mdf_object: mdf_object, })
            hUnit.SetThink(
                e => {
                    if (hUnit.IsAlive()) {
                        hUnit.AddNewModifier(hCaster, hAbility, mdf_name, mdf_object);
                        return null;
                    }
                    return 1;
                },
                this,
                'ThinkAddMdf',
                1
            );
        }
    }

    ThinkAddMdf() {}
}
