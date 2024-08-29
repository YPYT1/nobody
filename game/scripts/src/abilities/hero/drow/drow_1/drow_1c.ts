import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
 * 分裂箭【目标型】（1/3）：攻击可以同时命中2个敌人。（2/3）：同时命中3个敌人。（3/3）同时命中5个敌人。
9	冰箭	伤害提高%bonus_value%%%，技能赋予冰元素效果，伤害变为冰元素伤害。
10	积蓄	分裂箭命中时会额外回复%add_mana%点蓝量。

 */
@registerAbility()
export class drow_1c extends drow_1 {

    add_mana: number = 0;
    rune_31_bonus = 0;
    GetIntrinsicModifierName(): string {
        return "modifier_drow_1c"
    }

    UpdataSpecialValue(): void {
        this.add_mana = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '10', 'add_mana');
        // rune_31	游侠#6	分裂箭对减速的敌人造成的伤害提高200%
        this.rune_31_bonus = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_31', 'slow_bonus_value');
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            this.caster.GiveMana(this.add_mana)
            let SelfAbilityMul = extraData.SelfAbilityMul;
            let DamageBonusMul = extraData.DamageBonusMul;
            if (this.rune_31_bonus > 0 && UnitIsSlowed(target)) {
                DamageBonusMul += this.rune_31_bonus
            }
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                ability: this,
                damage: extraData.a,
                damage_type: extraData.dt,
                element_type: extraData.et,
                is_primary: true,
                SelfAbilityMul: SelfAbilityMul,
                DamageBonusMul: DamageBonusMul,
            })
        }
    }
}

@registerModifier()
export class modifier_drow_1c extends modifier_drow_1 {

    /** 分裂箭 */
    targes: number;

    UpdataSpecialValue(): void {
        this.fakeAttack = true;
        this.targes = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster,  "8", 'targes') - 1;
        this.DamageBonusMul = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster,  "9", "bonus_value");
        if (this.DamageBonusMul > 0) {
            this.element_type = ElementTypes.ICE;
            this.damage_type = DamageTypes.MAGICAL;
            this.tracking_proj_name = G_PorjTrack.ice;
        }
        // rune_30	游侠#5	分裂箭的基础伤害提高200%
        this.SelfAbilityMul += GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_30', 'base_value');
    }

    PlayAttackStart(params: PlayEffectProps): void {
        let hTarget = params.hTarget;
        let targets_chance_list = this.ability.GetTypesAffixSpecialValue("Targeting", "skv_targeting_multiple");
        let bonus_targets = this.ability.GetTypesAffixValue(0, "Targeting", "skv_targeting_count");
        let extra_index = GetRandomListIndex(targets_chance_list);
        if (extra_index != -1) {
            bonus_targets += (extra_index + 1)
        }
        let attack_damage = this.caster.GetAverageTrueAttackDamage(null);
        let ssk_21_bonus = this.ability.GetServerSkillEffect("21", bonus_targets);
        let DamageBonusMul = this.DamageBonusMul + ssk_21_bonus
        let enemies = FindUnitsInRadius(
            this.team,
            this.caster.GetAbsOrigin(),
            null,
            this.caster.Script_GetAttackRange() + 64,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.FOW_VISIBLE,
            FindOrder.ANY,
            false
        )
        this.fakeAttack = false;
        let count = 0;
        this.PlayPerformAttack(this.caster, hTarget, attack_damage, this.SelfAbilityMul, DamageBonusMul)
        for (let enemy of enemies) {
            if (enemy != hTarget) {
                count += 1;
                this.PlayPerformAttack(this.caster, enemy, attack_damage, this.SelfAbilityMul, DamageBonusMul)
            }
            if (count >= this.targes + bonus_targets) {
                break
            }
        }
        this.fakeAttack = true;
    }

}