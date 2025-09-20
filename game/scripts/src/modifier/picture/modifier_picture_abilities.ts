import { BaseModifier, registerModifier } from '../../utils/dota_ts_adapter';
import type * as PictuerFetterAbility from '../../json/config/server/picture/pictuer_fetter_ability.json';
import { StackModifier } from '../extends/modifier_stack';

type PictureAbilityIDs = keyof typeof PictuerFetterAbility;

/** 通用神秘商店效果 */
@registerModifier()
export class modifier_picture_abilities extends BaseModifier {
    test_mode = true;
    object: { [rune in PictureAbilityIDs]?: AbilityValuesProps };

    no10_count: number;
    no19_timer: number;

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.PERMANENT;
    }

    RemoveOnDeath(): boolean {
        return false;
    }

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetParent();
        this.object = {};

        this.no10_count = 0;
        this.no19_timer = 0;
        this.StartIntervalThink(1);
    }

    _InputAbilityValues(type_id: PictureAbilityIDs, rune_input: AbilityValuesProps): void {
        this.object[type_id] = rune_input;
    }

    Get_Object<Key extends keyof typeof PictuerFetterAbility, T2 extends (typeof PictuerFetterAbility)[Key]>(
        prop_name: Key,
        rune_key: keyof T2['AbilityValues']
    ) {
        return this.object[prop_name][rune_key as string];
    }

    UpdateMdf() {
        if (this.object['1'] != null) {
            // 1	discoLV%lv%:造成暴击时暴击伤害提高%value%%%
            const value = this.Get_Object('1', 'value');
            this.caster.SetAttributeInKey('picture_1', {
                CriticalDamage: {
                    Base: value,
                },
            });
        }

        // 11	魔能LV%lv%:拾取范围扩大%value%码
        if (this.object['11'] != null) {
            const value = this.Get_Object('11', 'value');
            this.caster.SetAttributeInKey('picture_1', {
                PickItemRadius: {
                    Fixed: value,
                },
            });
        }

        // 15	邪恶LV%lv%:周围500码友军获得5%移动速度加成和每秒1/S生命值恢复
        if (this.object['15'] != null) {
            const radius = this.Get_Object('15', 'radius');
            const ms_pct = this.Get_Object('15', 'ms_pct');
            const hp_regen = this.Get_Object('15', 'hp_regen');
            this.caster.AddNewModifier(this.caster, null, 'modifier_picture_effect_15', {
                radius,
                ms_pct,
                hp_regen,
            });
        }
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) {
            return;
        }
        // 4	传言LV%lv%:英雄所具有的每秒生命恢复效果，在生命值恢复满之后，会按%value%%%效率回复蓝量
        if (this.object['4'] != null) {
            if (this.caster.GetManaPercent() >= 100) {
                const mana_amount = this.caster.GetHealthRegen() * this.Get_Object('4', 'value') * 0.01;
                GameRules.BasicRules.RestoreMana(this.caster, mana_amount);
            }
        }

        // 19	治疗LV%lv%:每过10秒，恢复1%最大生命值
        if (this.object['19'] != null) {
            this.no19_timer += 1;
            if (this.no19_timer >= this.Get_Object('19', 'interval')) {
                this.no19_timer = 0;
                const heal = this.Get_Object('19', 'value') * this.caster.GetMaxHealth() * 0.01;
                GameRules.BasicRules.Heal(this.caster, heal);
            }
        }
    }

    OnKillEvent(hTarget: CDOTA_BaseNPC) {
        // 5	极速LV%lv%:击杀敌人时有15%概率提高0%移动速度，持续5秒，可叠加3层
        if (this.object['5'] != null) {
            const chance = this.Get_Object('5', 'chance');
            if (RollPercentage(chance)) {
                const speed_pct = this.Get_Object('5', 'speed_pct');
                const duration = this.Get_Object('5', 'duration');
                const max_stack = this.Get_Object('5', 'stack');

                this.caster.AddNewModifier(this.caster, null, 'modifier_picture_effect_5', {
                    duration: duration,
                    max_stack: max_stack,
                    speed_pct: speed_pct,
                });
            }
        }
    }

    OnBeInjured(params: ApplyCustomDamageOptions): boolean {
        // 6	坚毅LV%lv%:免疫致命伤害，并恢复25%最大生命值，每720秒只触发一次效果
        if (this.object['6'] != null && params.damage >= this.caster.GetHealth()) {
            const picture_6_cd = this.caster.CustomVariables['picture_6'] ?? 0;
            const dota_time = GameRules.GetDOTATime(false, false);
            if (picture_6_cd < dota_time) {
                const heal = this.Get_Object('6', 'max_heal_pct');
                const cd = this.Get_Object('6', 'cd');
                GameRules.BasicRules.Heal(this.caster, this.caster.GetMaxHealth() * heal * 0.01);
                this.caster.CustomVariables['picture_6'] = dota_time + cd;
                return true;
            }
        }

        // 8	亢奋LV%lv%:受到伤害时，在5秒内恢复5%最大生命值
        if (this.object['8'] != null) {
            const duration = this.Get_Object('8', 'duration');
            const max_heal_pct = this.Get_Object('8', 'max_heal_pct');
            this.caster.AddNewModifier(this.caster, null, 'modifier_picture_effect_8', {
                duration: duration,
                max_heal_pct: max_heal_pct,
            });
        }

        // 16	幽冥LV%lv%:受到伤害有5%概率进入幽冥状态，幽冥状态下不会受到伤害但也无法使用技能，
        // 同时获得爆炸增幅的移速,幽冥状态持续3秒
        if (this.object['16'] != null) {
            const chance = this.Get_Object('16', 'chance');
            if (RollPercentage(chance)) {
                const ms_base_pct = this.Get_Object('16', 'ms_base_pct');
                const duration = this.Get_Object('16', 'duration');
                this.caster.AddNewModifier(this.caster, null, 'modifier_picture_effect_16', {
                    duration: duration,
                    ms_base_pct: ms_base_pct,
                });
            }
        }
        return false;
    }

    _ExecutedBaseAbility(params?: any) {
        if (this.object['7'] != null) {
            // 7	飓风LV%lv%:使用基础技能时有15%概率提高25%攻击速度持续3秒
            const chance = this.Get_Object('7', 'chance');
            if (RollPercentage(chance)) {
                const attackspeed_pct = this.Get_Object('7', 'attackspeed_pct');
                const duration = this.Get_Object('7', 'duration');
                this.caster.SetAttributeInKey('picture_7', {
                    AttackSpeed: {
                        BasePercent: attackspeed_pct,
                    },
                });
            }
        }
    }

    _CritEvent(params: ApplyCustomDamageOptions) {
        // 17	掌控LV%lv%:暴击时，吸收本次伤害1%的血量
        if (this.object['17'] != null) {
            const health = this.Get_Object('17', 'value') * 0.01 * params.damage;
            GameRules.BasicRules.Heal(this.caster, health);
        }
    }

    _OnTakeDamage(params: ApplyCustomDamageOptions) {
        const dotatime = GameRules.GetDOTATime(false, false);
        // 20	致命LV%lv%:造成伤害时有5%概率进入致命状态，使接下来3秒内所有伤害均暴击
        if (this.object['20'] != null) {
            const picture_20_cd = this.caster.CustomVariables['picture_20_cd'] ?? 0;
            const chance = this.Get_Object('20', 'chance');
            if (picture_20_cd < dotatime && RollPercentage(chance)) {
                const duration = this.Get_Object('20', 'duration');
                const cd = this.Get_Object('20', 'cd') + duration;
                this.caster.CustomVariables['picture_20_cd'] = dotatime + cd;
                GameRules.BuffManager.AddGeneralDebuff(this.caster, this.caster, DebuffTypes.fatal, duration);
            }
        }

        // 23	熔火LV%lv%:火元素技能造成伤害时，临时提高5%火元素穿透和5%火元素伤害，持续5秒。cd：18秒
        if (this.object['23'] != null && params.element_type == ElementTypes.FIRE) {
            const picture_cd = this.caster.CustomVariables['picture_23_cd'] ?? 0;
            if (picture_cd < dotatime) {
                const cd = this.Get_Object('23', 'cd');
                this.caster.CustomVariables['picture_23_cd'] = dotatime + cd;

                const value1 = this.Get_Object('23', 'value1');
                const value2 = this.Get_Object('23', 'value2');
                const duration = this.Get_Object('23', 'duration');

                this.caster.SetAttributeInKey(
                    'picture_23',
                    {
                        FirePent: {
                            Base: value1,
                        },
                        FireDamageBonus: {
                            Base: value2,
                        },
                    },
                    duration
                );
            }
        }
        // 24	极冰LV%lv%:冰元素技能造成伤害时，临时提高5%冰元素穿透和5%冰元素伤害，持续5秒。cd18秒
        if (this.object['24'] != null && params.element_type == ElementTypes.ICE) {
            const picture_cd = this.caster.CustomVariables['picture_24_cd'] ?? 0;
            if (picture_cd < dotatime) {
                const cd = this.Get_Object('24', 'cd');
                this.caster.CustomVariables['picture_24_cd'] = dotatime + cd;

                const value1 = this.Get_Object('24', 'value1');
                const value2 = this.Get_Object('24', 'value2');
                const duration = this.Get_Object('24', 'duration');

                this.caster.SetAttributeInKey(
                    'picture_24',
                    {
                        IcePent: {
                            Base: value1,
                        },
                        IceDamageBonus: {
                            Base: value2,
                        },
                    },
                    duration
                );
            }
        }
        // 25	迅雷LV%lv%:雷元素技能造成伤害时，临时提高5%雷元素穿透和5%雷元素伤害，持续5秒。cd18秒
        if (this.object['25'] != null && params.element_type == ElementTypes.THUNDER) {
            const picture_cd = this.caster.CustomVariables['picture_25_cd'] ?? 0;
            if (picture_cd < dotatime) {
                const cd = this.Get_Object('25', 'cd');
                this.caster.CustomVariables['picture_25_cd'] = dotatime + cd;

                const value1 = this.Get_Object('25', 'value1');
                const value2 = this.Get_Object('25', 'value2');
                const duration = this.Get_Object('25', 'duration');

                this.caster.SetAttributeInKey(
                    'picture_25',
                    {
                        ThunderPent: {
                            Base: value1,
                        },
                        ThunderDamageBonus: {
                            Base: value2,
                        },
                    },
                    duration
                );
            }
        }

        // 26	和风LV%lv%:风元素技能造成伤害时，临时提高5%风元素穿透和5%风元素伤害，持续5秒。cd18秒
        if (this.object['26'] != null && params.element_type == ElementTypes.WIND) {
            const picture_cd = this.caster.CustomVariables['picture_26_cd'] ?? 0;
            if (picture_cd < dotatime) {
                const cd = this.Get_Object('26', 'cd');
                this.caster.CustomVariables['picture_26_cd'] = dotatime + cd;

                const value1 = this.Get_Object('26', 'value1');
                const value2 = this.Get_Object('26', 'value2');
                const duration = this.Get_Object('26', 'duration');

                this.caster.SetAttributeInKey(
                    'picture_26',
                    {
                        WindPent: {
                            Base: value1,
                        },
                        WindDamageBonus: {
                            Base: value2,
                        },
                    },
                    duration
                );
            }
        }
    }

    _OnDeath(killer?: CDOTA_BaseNPC) {
        // print("modifier_picture_abilities _OnDeath", this.test_mode)
        if (this.object['9'] != null) {
            // 9	雷霆LV%lv%:英雄阵亡时，将触发雷霆自爆，消灭自身半径300码所有敌方单位
            const radius = this.Get_Object('9', 'value');
            const enemies = FindUnitsInRadius(
                this.caster.GetTeamNumber(),
                this.caster.GetAbsOrigin(),
                null,
                radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );

            for (const enemy of enemies) {
                if (enemy.IsBossCreature()) {
                    continue;
                }
                enemy.Kill(null, this.caster);
            }
        }

        // 10	梦境LV%lv%:每阵亡一次，获得5%暴击伤害
        if (this.object['10'] != null) {
            this.no10_count += 1;
            const value = this.Get_Object('10', 'value') * this.no10_count;
            this.caster.SetAttributeInKey('picture_10', {
                CriticalDamage: {
                    Base: value,
                },
            });
        }
    }
}
