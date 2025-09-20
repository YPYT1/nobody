import { BaseAbility, BaseModifier, registerModifier } from '../../utils/dota_ts_adapter';
import type * as RuneConfig from '../../json/config/game/rune/rune_config.json';

// LinkLuaModifier("modifier_shop_prop_10", "modifiers/prop_effect/modifier_shop_prop_10", LuaModifierMotionType.NONE);

type runeName = keyof typeof RuneConfig;

/** 通用符文效果 */
@registerModifier()
export class modifier_rune_effect extends BaseModifier {
    caster: CDOTA_BaseNPC;
    ability: CDOTABaseAbility;
    player_id: PlayerID;

    _rune_object: { [rune: string]: AbilityValuesProps };

    timer_114: number;
    kills_115: number;
    IsHidden(): boolean {
        return true;
    }

    IsPermanent(): boolean {
        return true;
    }

    RemoveOnDeath(): boolean {
        return false;
    }

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.player_id = this.caster.GetPlayerOwnerID();
        this._rune_object = {};

        this.timer_114 = 0;
        this.kills_115 = 0;
        this.OnRefresh(params);
        this.StartIntervalThink(1);
    }

    Rune_Object<Key extends keyof typeof RuneConfig, T2 extends (typeof RuneConfig)[Key]>(rune_name: Key, rune_key: keyof T2['AbilityValues']) {
        return this._rune_object[rune_name as string][rune_key as string];
    }

    Rune_InputAbilityValues(rune_name: string, rune_input: AbilityValuesProps): void {
        this._rune_object[rune_name] = rune_input;
        GameRules.CustomAttribute.UpdataPlayerSpecialValue(this.player_id);
    }

    OnRefresh(params: any): void {
        // this.caster.rune_passive_type[""]
        // 更新符文效果
    }

    OnKillEvent(hTarget: CDOTA_BaseNPC): void {
        // 通用符文11	击杀敌人时有15%概率获得5%/10%/15%伤害加成，持续5秒，最高5层
        if (this._rune_object['rune_11']) {
            if (RollPercentage(this.Rune_Object('rune_11', 'chance'))) {
                const bp_ingame = this.Rune_Object('rune_11', 'bp_ingame');
                const duration = this.Rune_Object('rune_11', 'duration');
                const max_stack = this.Rune_Object('rune_11', 'max_stack');
                this.caster.AddNewModifier(this.caster, this.ability, 'modifier_rune_effect_11', {
                    duration: duration,
                    max_stack: max_stack,
                    value: bp_ingame,
                });
            }
        }

        // rune_15	通用符文15	击败敌人时，有15%的概率回复10%/15%/20%已损失生命值
        if (this._rune_object['rune_15']) {
            if (RollPercentage(this.Rune_Object('rune_15', 'chance'))) {
                const restore_lose_hp = this.Rune_Object('rune_15', 'restore_lose_hp');
                const heal_value = this.caster.GetHealthDeficit() * restore_lose_hp * 0.01;
                GameRules.BasicRules.Heal(this.caster, heal_value, this.ability);
            }
        }

        // rune_17	生命补充	击杀敌人时，有%chance%%%概率回复%health_pct%%%最大生命值
        if (this._rune_object['rune_17']) {
            if (RollPercentage(this.Rune_Object('rune_17', 'chance'))) {
                const health_pct = this.Rune_Object('rune_17', 'health_pct');
                const heal_value = this.caster.GetMaxHealth() * health_pct * 0.01;
                GameRules.BasicRules.Heal(this.caster, heal_value, this.ability);
            }
        }

        // rune_21	移动圣塔	击杀敌人时，有8%概率获得随机一种圣塔效果，持续5秒
        if (this._rune_object['rune_21']) {
            if (RollPercentage(this.Rune_Object('rune_21', 'chance'))) {
                const duration = this.Rune_Object('rune_21', 'duration');
                const altar_index = RandomInt(1, 7);
                this.caster.AddNewModifier(this.caster, null, 'modifier_altar_effect_' + altar_index, {
                    duration: duration,
                });
            }
        }

        // rune_105	灵魂征收	击杀敌人时，会额外获得3点灵魂
        if (this._rune_object['rune_105']) {
            GameRules.ResourceSystem.ModifyResource(this.player_id, {
                Soul: 3,
            });
        }

        // rune_115	累积急速	每击杀50个敌人获得1点技能急速
        if (this._rune_object['rune_105']) {
            this.kills_115 += 1;
            if (this.kills_115 >= 50) {
                this.kills_115 -= 50;
                GameRules.CustomAttribute.ModifyAttribute(this.caster, {
                    AbilityHaste: {
                        Base: 1,
                    },
                });
            }
        }
    }

    /** 触发技能 */
    Rune_ExecutedAbility(params: any) {
        // rune_8	通用符文8	使用技能之后，护甲提高1%/2%/3%，持续5秒，可叠加10层
        if (this._rune_object['rune_8']) {
            const armor_pct = this.Rune_Object('rune_8', 'armor_pct');
            const duration = this.Rune_Object('rune_8', 'duration');
            const max_stack = this.Rune_Object('rune_8', 'max_stack');
            this.caster.AddNewModifier(this.caster, this.ability, 'modifier_rune_effect_8', {
                duration: duration,
                max_stack: max_stack,
                value: armor_pct,
            });
        }
    }

    /**
     * 受到伤害
     * 可能的参数 受伤,伤害来源,伤害类型,伤害数值
     * @param params
     */
    OnBeInjured(params: ApplyCustomDamageOptions) {
        // rune_9	通用符文9	移速提高30%，受到伤害后失去该效果8秒
        if (this._rune_object['rune_9']) {
            GameRules.CustomAttribute.SetAttributeInKey(
                this.caster,
                'rune_9_debuff',
                {
                    MoveSpeed: {
                        BasePercent: -30,
                    },
                },
                8
            );
        }

        return false;
    }

    OnLevelUprade() {
        if (this._rune_object['rune_103']) {
            const kv_value = GameRules.RuneSystem.GetKvOfUnit_V2(this.caster, 'rune_103', 'value');
            this.caster.rune_trigger_count['rune_103']++;
            const value = this.caster.rune_trigger_count['rune_103'] * kv_value;
            const attr_count: CustomAttributeTableType = {
                AbilityHaste: {
                    Base: value,
                },
            };
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_103_AbilityHaste', attr_count);
        }
        if (this.caster.rune_level_index['rune_113']) {
            const kv_value = GameRules.RuneSystem.GetKvOfUnit_V2(this.caster, 'rune_113', 'move_speed');
            this.caster.rune_trigger_count['rune_113']++;
            let value = this.caster.rune_trigger_count['rune_113'] * kv_value;
            //所有夜魇符文的累积的效果翻倍
            if (this.caster.rune_level_index['rune_118']) {
                value = value * 2;
            }
            const attr_count: CustomAttributeTableType = {
                MoveSpeed: {
                    Base: value,
                },
            };
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_113_MoveSpeed', attr_count);
        }
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) {
            return;
        }
        // 毎损失10%生命百分比
        const lost_health_pct = math.floor((100 - this.caster.GetHealthPercent()) / 10);
        // let mana = this.caster.GetMana();
        // let max_mana = this.caster.GetMaxMana();
        const mana_pct = this.caster.GetManaPercent();
        // rune_12	通用符文12	获得50%伤害加成，作为代价，在生命值高于30%时，每秒扣除10%最大生命值
        if (this._rune_object['rune_12']) {
            const is_above30pct = this.caster.GetHealthPercent() > 30;
            // print("rune_12", is_above30pct)
            if (is_above30pct) {
                const lost_hp_value = this.caster.GetMaxHealth() * 0.1;
                this.caster.SetHealth(this.caster.GetHealth() - lost_hp_value);
                // 是否作为受伤??
            }
        }

        // rune_10	通用符文10	每损失10%生命值，提高5%/7%/10%移动速度
        if (this._rune_object['rune_10']) {
            const ms_pct = this.Rune_Object('rune_10', 'ms_pct');
            // print("lost_health_pct", lost_health_pct)
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_10', {
                MoveSpeed: {
                    BasePercent: ms_pct * lost_health_pct,
                },
            });
        }

        // rune_16 但是蓝量大于%last_mana_pct%%%时，所有技能伤害提高%bp_ingame%%%
        if (this._rune_object['rune_16']) {
            const last_mana_pct = this.Rune_Object('rune_16', 'last_mana_pct');
            const bp_ingame = this.Rune_Object('rune_16', 'bp_ingame');
            if (mana_pct > last_mana_pct) {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_16', {
                    AbilityImproved: {
                        Base: bp_ingame,
                    },
                });
            } else {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_16', {
                    AbilityImproved: {
                        Base: 0,
                    },
                });
            }
        }
        // rune_20	通用符文20	"附近每存在一个敌军，提高自身%AttackSpeed%攻击速度,最高提升%MaxValue%%%
        if (this._rune_object['rune_20']) {
            const max_value = this.Rune_Object('rune_20', 'MaxValue');
            const distance = this.Rune_Object('rune_20', 'distance');
            const StackAttackSpeed = this.Rune_Object('rune_20', 'StackAttackSpeed');
            const enemies = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                this.caster.GetAbsOrigin(),
                null,
                distance,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            let boss_bonus = 0;
            for (const enemy of enemies) {
                if (enemy.IsBossCreature()) {
                    boss_bonus += 14;
                }
            }
            const bonus_value = math.min((enemies.length + boss_bonus) * StackAttackSpeed, max_value);
            // print("bonus_value",bonus_value)
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_20', {
                AttackSpeed: {
                    Base: bonus_value,
                },
            });
        }

        // rune_22	通用符文22	最大蓝量值蓝量大于100时，每高1点着获得1%伤害减免，最高可获得60%伤害减免
        if (this._rune_object['rune_22']) {
            const last_maxmana = this.Rune_Object('rune_22', 'last_maxmana');
            const dmg_reduction_limit = this.Rune_Object('rune_22', 'dmg_reduction_limit');
            const bonus_value = math.min(math.max(0, this.caster.GetMaxMana() - last_maxmana), dmg_reduction_limit);
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_22', {
                DmgReductionPct: {
                    Base: bonus_value,
                },
            });
        }

        // rune_23	通用符文23	每损失10%生命值，提高5%/7%/10%伤害加成
        if (this._rune_object['rune_23']) {
            const ever_dmg_bonus = this.Rune_Object('rune_23', 'ever_dmg_bonus');
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_23', {
                DamageBonusMul: {
                    Base: ever_dmg_bonus * lost_health_pct,
                },
            });
        }

        if (this._rune_object['rune_24']) {
            const range_check = this.Rune_Object('rune_24', 'range_check');
            const enemies = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                this.caster.GetAbsOrigin(),
                null,
                range_check,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            const crit_chance = enemies.length == 0 ? this.Rune_Object('rune_24', 'crit_chance') : 0;
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_24', {
                CriticalChance: {
                    Base: crit_chance,
                },
            });
        }

        // rune_101	飞毛腿	自身每拥有1%移速加成，自身造成的伤害提高1%
        if (this._rune_object['rune_101']) {
            const ms_pct = math.floor((100 * math.max(this.caster.custom_attribute_value.MoveSpeed - 350, 0)) / 350);
            // print("ms_pct", ms_pct)
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_24', {
                DamageBonusMul: {
                    Base: ms_pct,
                },
            });
        }
        // rune_110	代谢增速	每秒恢复50%最大生命值，但最大生命值减少60%
        if (this._rune_object['rune_110']) {
            const health_amount = this.caster.GetMaxHealth() * this.Rune_Object('rune_110', 'heal_pct') * 0.01;
            GameRules.BasicRules.Heal(this.caster, health_amount);
        }
        // rune_114	无人之境	每过15秒，获得伤害加成在-50%~125%波动，持续15秒
        if (this._rune_object['rune_114']) {
            this.timer_114 += 1;
            const interval = this.Rune_Object('rune_114', 'interval');
            if (this.timer_114 >= interval) {
                this.timer_114 = 0;
                const min = this.Rune_Object('rune_114', 'min');
                const max = this.Rune_Object('rune_114', 'max');
                const damage_bonus = RandomInt(min, max);
                GameRules.CustomAttribute.SetAttributeInKey(
                    this.caster,
                    'rune_114',
                    {
                        DamageBonusMul: {
                            Base: damage_bonus,
                        },
                    },
                    interval
                );
            }
        }

        // rune_117	法力燃烧	每秒扣除5点蓝量，对自身500码范围内敌人造成每秒扣除蓝量的1000%真实伤害
        if (this._rune_object['rune_117']) {
            const mana_regen = this.caster.custom_attribute_value.ManaRegen;
            if (mana_regen < 0) {
                const damage = math.abs(mana_regen) * 10;
                const enemies = FindUnitsInRadius(
                    DotaTeam.GOODGUYS,
                    this.caster.GetAbsOrigin(),
                    null,
                    500,
                    UnitTargetTeam.ENEMY,
                    UnitTargetType.BASIC + UnitTargetType.HERO,
                    UnitTargetFlags.NONE,
                    FindOrder.ANY,
                    false
                );
                for (const enemy of enemies) {
                    ApplyCustomDamage({
                        victim: enemy,
                        attacker: this.caster,
                        damage: damage,
                        damage_type: DamageTypes.PURE,
                        element_type: ElementTypes.NONE,
                        ability: this.GetAbility(),
                        is_primary: false,
                    });
                }
            }
        }
    }

    // 获得灵魂
    OnGetSoul(soul: number) {
        // rune_104	灵魂补充	每获得1点灵魂，恢复同等的生命值
        if (this._rune_object['rune_104']) {
            GameRules.BasicRules.Heal(this.caster, soul);
        }
    }
}
