import { BaseAbility, BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import * as RuneConfig from "../../json/config/game/rune/rune_config.json";

// LinkLuaModifier("modifier_shop_prop_10", "modifiers/prop_effect/modifier_shop_prop_10", LuaModifierMotionType.NONE);

type runeName = keyof typeof RuneConfig;

/** 通用符文效果 */
@registerModifier()
export class modifier_rune_effect extends BaseModifier {

    caster: CDOTA_BaseNPC;
    ability: CDOTABaseAbility;
    player_id: PlayerID;

    _rune_object: { [rune: string]: AbilityValuesProps };

    IsHidden(): boolean { return true }
    IsPermanent(): boolean { return true }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.player_id = this.caster.GetPlayerOwnerID();
        this._rune_object = {}
        this.OnRefresh(params);
        this.StartIntervalThink(1)
    }

    Rune_Object<
        Key extends keyof typeof RuneConfig,
        T2 extends typeof RuneConfig[Key]
    >(rune_name: Key, rune_key: keyof T2["AbilityValues"]) {
        return this._rune_object[rune_name as string][rune_key as string]
    }

    Rune_InputAbilityValues(rune_name: string, rune_input: AbilityValuesProps): void {
        this._rune_object[rune_name] = rune_input;
        GameRules.CustomAttribute.UpdataPlayerSpecialValue(this.player_id)
    }

    OnRefresh(params: any): void {
        // this.caster.rune_passive_type[""]
        // 更新符文效果
    }

    OnKillEvent(hTarget: CDOTA_BaseNPC): void {
        // 通用符文11	击杀敌人时有15%概率获得5%/10%/15%伤害加成，持续5秒，最高5层
        if (this._rune_object["rune_11"]) {
            if (RollPercentage(this.Rune_Object("rune_11", 'chance'))) {
                let bp_ingame = this.Rune_Object('rune_11', 'bp_ingame');
                let duration = this.Rune_Object('rune_11', 'duration');
                let max_stack = this.Rune_Object('rune_11', 'max_stack');
                this.caster.AddNewModifier(this.caster, this.ability, "modifier_rune_effect_11", {
                    duration: duration,
                    max_stack: max_stack,
                    value: bp_ingame,
                })
            }

        }

        // rune_15	通用符文15	击败敌人时，有15%的概率回复10%/15%/20%已损失生命值
        if (this._rune_object["rune_15"]) {
            if (RollPercentage(this.Rune_Object("rune_15", 'chance'))) {
                let restore_lose_hp = this.Rune_Object('rune_15', 'restore_lose_hp')
                let heal_value = this.caster.GetHealthDeficit() * restore_lose_hp * 0.01;
                GameRules.BasicRules.Heal(this.caster, heal_value, this.ability);
            }
        }
    }



    /** 触发技能 */
    Rune_ExecutedAbility(params: any) {
        // rune_8	通用符文8	使用技能之后，护甲提高1%/2%/3%，持续5秒，可叠加10层
        if (this._rune_object["rune_8"]) {
            let armor_pct = this.Rune_Object('rune_8', 'armor_pct');
            let duration = this.Rune_Object('rune_8', 'duration');
            let max_stack = this.Rune_Object('rune_8', 'max_stack')
            this.caster.AddNewModifier(this.caster, this.ability, "modifier_rune_effect_8", {
                duration: duration,
                max_stack: max_stack,
                value: armor_pct,
            })
        }

    }

    /**
     * 受到伤害
     * 可能的参数 受伤,伤害来源,伤害类型,伤害数值
     * @param params 
     */
    OnBeInjured(params: ApplyCustomDamageOptions) {
        // rune_9	通用符文9	移速提高30%，受到伤害后失去该效果8秒
        if (this._rune_object["rune_9"]) {
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, "rune_9_debuff", {
                'MoveSpeed': {
                    "BasePercent": -30,
                }
            }, 8)
        }
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) { return }
        // 毎损失10%生命百分比
        let lost_health_pct = math.floor((100 - this.caster.GetHealthPercent()) / 10);

        // rune_12	通用符文12	获得50%伤害加成，作为代价，在生命值高于30%时，每秒扣除10%最大生命值
        if (this._rune_object["rune_12"]) {
            let is_above30pct = this.caster.GetHealthPercent() > 30;
            // print("rune_12", is_above30pct)
            if (is_above30pct) {
                let lost_hp_value = this.caster.GetMaxHealth() * 0.1;
                this.caster.SetHealth(this.caster.GetHealth() - lost_hp_value);
                // 是否作为受伤??
            }
        }

        // rune_10	通用符文10	每损失10%生命值，提高5%/7%/10%移动速度
        if (this._rune_object["rune_10"]) {
            let ms_pct = this.Rune_Object('rune_10', 'ms_pct');
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, "rune_10", {
                'MoveSpeed': {
                    "BasePercent": ms_pct * lost_health_pct,
                }
            })
        }

        // rune_20	通用符文20	"附近每存在一个敌军，提高自身%AttackSpeed%攻击速度,最高提升%MaxValue%%%
        if (this._rune_object["rune_20"]) {
            let max_value = this.Rune_Object("rune_20", 'MaxValue');
            let distance = this.Rune_Object("rune_20", "distance")
            let StackAttackSpeed = this.Rune_Object("rune_20", "StackAttackSpeed");
            let enemies = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                this.caster.GetAbsOrigin(),
                null,
                distance,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            )
            let boss_bonus = 0;
            for (let enemy of enemies) {
                if (enemy.IsBossCreature()) {
                    boss_bonus += 14;
                }
            }
            let bonus_value = math.min((enemies.length + boss_bonus) * StackAttackSpeed, max_value);
            // print("bonus_value",bonus_value)
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, "rune_20", {
                "AttackSpeed": {
                    "Base": bonus_value,
                }
            })
        }

        // rune_22	通用符文22	最大蓝量值蓝量大于100时，每高1点着获得1%伤害减免，最高可获得60%伤害减免
        if (this._rune_object["rune_22"]) {
            let last_maxmana = this.Rune_Object("rune_22", 'last_maxmana');
            let dmg_reduction_limit = this.Rune_Object("rune_22", 'dmg_reduction_limit')
            let bonus_value = math.min(math.max(0, this.caster.GetMaxMana() - last_maxmana), dmg_reduction_limit);
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, "rune_22", {
                "DmgReductionPct": {
                    "Base": bonus_value,
                }
            })
        }

        // rune_23	通用符文23	每损失10%生命值，提高5%/7%/10%伤害加成
        if (this._rune_object["rune_23"]) {
            let ever_dmg_bonus = this.Rune_Object("rune_23", 'ever_dmg_bonus');
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, "rune_23", {
                "DamageBonusMul": {
                    "Base": ever_dmg_bonus * lost_health_pct,
                }
            })
        }

        if (this._rune_object["rune_24"]) {
            let range_check = this.Rune_Object("rune_24", "range_check");
            let enemies = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                this.caster.GetAbsOrigin(),
                null,
                range_check,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            )
            let crit_chance = enemies.length == 0 ? this.Rune_Object("rune_24", "crit_chance") : 0;
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, "rune_23", {
                "CriticalChance": {
                    "Base": crit_chance
                }
            });
        }

    }
}