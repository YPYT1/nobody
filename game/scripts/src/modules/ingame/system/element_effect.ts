import { reloadable } from '../../../utils/tstl-utils';

/**
 * 元素效果
 */
@reloadable
export class ElementEffect {
    constructor() {}

    /** 设置火元素效果 */
    SetFirePrimary(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC) {
        const hAbility = hCaster.FindAbilityByName('public_attribute');
        const burning_duration = hCaster.custom_attribute_value['BurningDuration'];
        hTarget.AddNewModifier(hCaster, hAbility, 'modifier_element_effect_fire', {
            duration: burning_duration,
        });
    }

    SetIcePrimary(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC) {
        if (hTarget.IsBossCreature()) {
            return;
        }
        if (hTarget.HasModifier('modifier_element_effect_ice')) {
            if (RollPercentage(15)) {
                // 冰冻效果
                hTarget.AddNewModifier(hCaster, null, 'modifier_element_effect_ice_frozen', {
                    duration: 1,
                });
            }
        }

        const buff = hTarget.AddNewModifier(hCaster, null, 'modifier_element_effect_ice', {
            duration: 3,
        });
        if (hCaster.prop_count['prop_21'] && buff) {
            // prop_21	【斯嘉蒂之眼】	冰元素技能降低移速时，同时降低敌人30%攻击速度和20%冰元素抗性，持续3秒
            hTarget.AddNewModifier(hCaster, null, 'modifier_shop_prop_21', {
                duration: 3,
            });
        }
    }

    /**
     * 雷元素技能附带1秒麻痹效果 相同单位10秒内最多生效一次，被麻痹的单位雷元素抗性降低10%
     * @param hCaster
     * @param hTarget
     */
    SetThunderPrimary(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC) {
        if (hTarget.IsBossCreature()) {
            return;
        }
        if (!hTarget.HasModifier('modifier_element_effect_thunder_immune') && !hTarget.HasModifier('modifier_element_effect_thunder')) {
            // prop_22	【雷神之锤】	雷元素技能命中敌人时，50%概率额外追加3秒麻痹效果（相同敌人只受到一次效果）
            if (hTarget.SpecialMark['prop_22'] == null && hCaster.prop_count['prop_22']) {
                const chance = GameRules.MysticalShopSystem.GetKvOfUnit(hCaster, 'prop_22', 'chance');
                if (RollPercentage(chance)) {
                    hTarget.SpecialMark['prop_22'] = 1;
                    const duration = GameRules.MysticalShopSystem.GetKvOfUnit(hCaster, 'prop_22', 'duration');
                    // 强化麻痹效果
                    hTarget.AddNewModifier(hTarget, null, 'modifier_element_effect_thunder', {
                        duration: duration + 1,
                    });
                } else {
                    hTarget.AddNewModifier(hTarget, null, 'modifier_element_effect_thunder', {
                        duration: 1,
                    });
                }
            } else {
                hTarget.AddNewModifier(hTarget, null, 'modifier_element_effect_thunder', {
                    duration: 1,
                });
            }
        }
    }

    SetWindPrimary(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC, origin: Vector) {
        // 风系击退,内置CD
        if (hTarget.IsBossCreature()) {
            return;
        }
        if (hTarget.HasModifier('modifier_element_effect_wind_immune')) {
            return;
        }
        hTarget.AddNewModifier(hTarget, null, 'modifier_element_effect_wind_immune', {
            duration: 10,
        });

        hTarget.AddNewModifier(hCaster, null, 'modifier_knockback_lua', {
            center_x: origin.x,
            center_y: origin.y,
            center_z: 0,
            knockback_distance: 50,
            knockback_duration: 0.25,
            duration: 0.5,
        });

        // prop_23	【风儿吹】	风元素技能命中敌人时，被击退的敌人降低20%元素抗性并眩晕1秒
        if (hCaster.prop_count['prop_23']) {
            const stun = GameRules.MysticalShopSystem.GetKvOfUnit(hCaster, 'prop_23', 'stun');
            const value = GameRules.MysticalShopSystem.GetKvOfUnit(hCaster, 'prop_23', 'value');
            GameRules.EnemyAttribute.SetAttributeInKey(
                hTarget,
                'prop_23',
                {
                    WindResist: {
                        Base: value,
                    },
                },
                stun
            );
            GameRules.BuffManager.AddGeneralDebuff(hCaster, hTarget, DebuffTypes.stunned, stun);
        }
    }

    State(hUnit: CDOTA_BaseNPC, element_state: ElementState) {
        if (element_state == ElementState.burn) {
            return hUnit.HasModifier('modifier_element_effect_fire') || hUnit.HasModifier('modifier_drow_3b_a_dot');
        }
        return false;
    }
}
