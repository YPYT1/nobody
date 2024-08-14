import { registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2b, modifier_drow_2b } from "./drow_2b";

/**
 * 双喷【范围型】《冰》（3/3）：
散射技能赋予冰元素效果，伤害变为冰元素伤害。有25%/30%/40%概率再次释放一次。（不可套娃）
23.重创【增益型】（2/2）：散射对距离越近的单位造成伤害越高。最近判定25码。最高提高伤害100%/200%。"
24.痛击（3/3）：散射对被降低移速的敌人造成的伤害提高30%/60%/100%。"

 */
@registerAbility()
export class drow_2b_b extends drow_2b {

    tj_value: number;

    closest_distance: number;
    zc_value: number;

    rune_36_state: boolean = false;
    GetIntrinsicModifierName(): string {
        return "modifier_drow_2b_b"
    }

    UpdataSpecialValue(): void {
        this.closest_distance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "23", "closest_distance");
        this.zc_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "23", "bonus_value");
        this.tj_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "24", "bonus_value");
        // rune_39	游侠#14	"散射【痛击】生效时，造成伤害提供至500%，但该次伤害不会再暴击"
        if (this.caster.rune_passive_type["rune_36"]) {
            this.rune_36_state = true;
            this.tj_value = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_39', 'tj_dmg')
        }
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            let critical_flag: -1 | 0 | 1 = 0;

            let SelfAbilityMul = extraData.SelfAbilityMul;
            let DamageBonusMul = extraData.DamageBonusMul;

            if (this.zc_value > 0) {
                let vOrigin = Vector(extraData.x, extraData.y, 0);
                let vTarget = target.GetAbsOrigin();
                let distance = math.max(this.closest_distance, (vOrigin - vTarget as Vector).Length2D());
                // 散射对距离越近的单位造成伤害越高。最近25码
                let dmg_bonus = (1 - (distance - this.closest_distance) / 1000) * this.zc_value;
                DamageBonusMul += dmg_bonus
            }
            if (this.tj_value > 0 && UnitIsSlowed(target)) {
                DamageBonusMul += this.tj_value
                if (this.rune_36_state) {
                    critical_flag = -1;
                }

            }

            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.ICE,
                is_primary: true,
                critical_flag: critical_flag,
                SelfAbilityMul: SelfAbilityMul,
                DamageBonusMul: DamageBonusMul,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_drow_2b_b extends modifier_drow_2b {

    sp_chance: number;
    sp_extra: number;
    UpdataSpecialValue(): void {
        this.proj_name = G_PorjLinear.ice
        this.sp_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "22", "chance");
        // rune_38	游侠#13	双喷再次释放时可以再次触发效果（可套娃）
        this.sp_extra = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_38', 'sp_extra');
    }

    PlayEffect(params: PlayEffectProps): void {
        // this.ability_damage = this.caster.GetAverageTrueAttackDamage(null) * this.base_value * 0.01
        let vTarget = params.hTarget.GetAbsOrigin()
        this.MultiShot(vTarget, params.value);

        if (RollPercentage(this.sp_chance)) {
            this.caster.SetContextThink(DoUniqueString("sp_chance"), () => {
                if (this.sp_extra > 0) {
                    this.PlayEffect(params);
                } else {
                    this.MultiShot(vTarget, params.value);
                }
                return null
            }, 0.15)
        }
    }
}