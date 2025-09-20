import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../../../../utils/dota_ts_adapter';
import { drow_1, modifier_drow_1 } from './drow_1';

/**
 * 攻击变为%aoe_radius%码范围伤害，伤害提高%bonus_value%%%，伤害变为火元素伤害。
 * 爆炸分支
3	浓缩	爆炸箭有%mul_chance%%%概率%mul_value%倍伤害
4	碎裂	爆炸箭范围提高%skv_aoe_radius%码，灼烧伤害提高%burn_dmg%%%。
 */
@registerAbility()
export class drow_1a extends drow_1 {
    mul_chance: number;
    mul_value: number;
    aoe_radius: number;

    GetIntrinsicModifierName(): string {
        return 'modifier_drow_1a';
    }

    UpdataSpecialValue(): void {
        // this.SelfAbilityMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster,  "2", "bonus_value");
        this.mul_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '3', 'mul_chance');
        this.mul_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '3', 'mul_value');
        // rune_27	游侠#2	爆裂箭【浓缩】的触发概率提高至30%，伤害提高5倍
        if (this.mul_chance > 0 && this.caster.rune_level_index.hasOwnProperty('rune_27')) {
            this.mul_chance = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_27', 'mul_chance');
            this.mul_value += GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_27', 'mul_value');
        }

        const aoe_radius =
            GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '2', 'skv_aoe_radius') +
            GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '4', 'skv_aoe_radius');
        this.aoe_radius = this.GetTypesAffixValue(aoe_radius, 'Aoe', 'skv_aoe_radius');
        this.DamageBonusMul += this.GetTypesAffixValue(0, 'Aoe', 'skv_aoe_d_bonus');
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            this.SelfAbilityMul = extraData.SelfAbilityMul;

            let damage = this.caster.GetAverageTrueAttackDamage(null);
            const has_run50buff = this.caster.HasModifier('modifier_drow_5_buff_rune50');
            if (has_run50buff) {
                damage *= 2;
            }
            const vPos = target.GetAbsOrigin();
            this.TriggerActive({ vPos, damage });
            const aoe_multiple = this.GetTypesAffixValue(0, 'Aoe', 'skv_aoe_chance');
            if (RollPercentage(aoe_multiple)) {
                this.MultiCastAoe(vPos, damage);
            }
        }
    }

    TriggerActive(params: PlayEffectProps) {
        const vPos = params.vPos;
        let damage = params.damage;
        // const SelfAbilityMul = params.SelfAbilityMul;
        //PlayEffectAoe(vPos: Vector, aoe_damage: number, SelfAbilityMul: number) {
        // 浓缩伤害
        if (RollPercentage(this.mul_chance)) {
            damage *= this.mul_value;
        }
        const has_pojun = false;
        const enemies = FindUnitsInRadius(
            this.team,
            vPos,
            null,
            this.aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        // rune_26	游侠#1	爆炸箭对生命值高于30%的敌人伤害提高100%
        const has_rune26 = this.caster.rune_level_index.hasOwnProperty('rune_26');
        // print("has_rune26", has_rune26)
        const run26_bonus = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_26', 'bonus_value');
        const run26_hp_pct = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_26', 'hp_pct');

        for (const enemy of enemies) {
            let bonus = 0;
            if (has_rune26 && enemy.GetHealthPercent() > run26_hp_pct) {
                bonus += run26_bonus;
            }

            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: damage,
                damage_type: DamageTypes.MAGICAL,
                element_type: ElementTypes.FIRE,
                ability: this,
                is_primary: true,
                SelfAbilityMul: this.SelfAbilityMul + this.BasicAbilityDmg,
                DamageBonusMul: this.DamageBonusMul + bonus,
                // bonus_percent: bonus_percent,
            });
        }

        const cast_fx = ParticleManager.CreateParticle('particles/dev/hero/drow/drow_1/explosion_arrow.vpcf', ParticleAttachment.WORLDORIGIN, null);
        ParticleManager.SetParticleControl(cast_fx, 0, vPos);
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.aoe_radius, 1, 1));
        ParticleManager.ReleaseParticleIndex(cast_fx);
    }
}

@registerModifier()
export class modifier_drow_1a extends modifier_drow_1 {
    UpdataSpecialValue(): void {
        this.SelfAbilityMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '2', 'bonus_value');
        this.tracking_proj_name = G_PorjTrack.drow.fire;
    }
}
