import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../../../../utils/dota_ts_adapter';
import { drow_2a, modifier_drow_2a } from './drow_2a';

/**
 * 15.穿透（3/3）:连续射击可穿透目标，伤害提高20%/40%/60%
16	刺骨	技能赋予冰元素效果，伤害变为冰元素伤害。（该技能冰元素减速效果增加至50%。2级才显示）
17	冰爆	连续射击命中被减速的敌人时，有12%概率发生冰爆，对范围300码敌人造成攻击力160%/200%/250%冰元素伤害。

 */
@registerAbility()
export class drow_2a_b extends drow_2a {
    bb_chance: number;
    bb_radius: number;
    bb_value: number;
    bb_state: boolean = false;
    cigu_value: number;

    ability_damage: number;

    aoe_chance: number;
    Precache(context: CScriptPrecacheContext): void {
        precacheResString('particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova_flash_c.vpcf', context);
    }

    GetIntrinsicModifierName(): string {
        return 'modifier_drow_2a_b';
    }

    UpdataSpecialValue(): void {
        // this.DamageBonusMul = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster,  '15', 'bonus_value')
        this.cigu_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '16', 'cigu_value');
        this.bb_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '17', 'chance');
        this.bb_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '17', 'base_value');
        // rune_34	游侠#9	连续射击【冰爆】的伤害提升至500%
        if (this.caster.rune_level_index.hasOwnProperty('rune_34')) {
            this.bb_value = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_34', 'bb_dmg');
        }
        const bb_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '17', 'radius');
        this.bb_radius = this.GetTypesAffixValue(bb_radius, 'Aoe', 'skv_aoe_radius');
        // rune_35	游侠#10	连续射击【冰爆】的范围提高50%，且必定触发冰爆
        if (this.caster.rune_level_index.hasOwnProperty('rune_35')) {
            const bb_radius_bonus_pct = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_35', 'bb_radius_bonus_pct') * 0.01;
            this.bb_radius *= 1 + bb_radius_bonus_pct;
            this.bb_state = true;
        }

        this.aoe_chance = this.GetTypesAffixValue(0, 'Aoe', 'skv_aoe_chance');
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            const SelfAbilityMul = extraData.SelfAbilityMul;
            const DamageBonusMul = extraData.DamageBonusMul;
            this.ability_damage = extraData.a;
            if (this.cigu_value > 0) {
                ApplyCustomDamage({
                    victim: target,
                    attacker: this.caster,
                    damage: this.ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this,
                    element_type: ElementTypes.ICE,
                    is_primary: true,
                    SelfAbilityMul: SelfAbilityMul,
                    DamageBonusMul: DamageBonusMul,
                });
            } else {
                ApplyCustomDamage({
                    victim: target,
                    attacker: this.caster,
                    damage: this.ability_damage,
                    damage_type: DamageTypes.PHYSICAL,
                    ability: this,
                    is_primary: true,
                    SelfAbilityMul: SelfAbilityMul,
                    DamageBonusMul: DamageBonusMul,
                });
            }

            // 减速的敌人有概率触发冰爆
            const is_slowed = UnitIsSlowed(target);
            if (is_slowed && (this.bb_state || RollPercentage(this.bb_chance))) {
                const vPos = target.GetAbsOrigin();
                this.TriggerActive({ vPos: vPos });
                if (RollPercentage(this.aoe_chance)) {
                    this.MultiCastAoe(vPos);
                }
            }
            return false;
        }
    }

    TriggerActive(params: PlayEffectProps): void {
        const vPos = params.vPos;
        const effect_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova_flash_c.vpcf',
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_fx, 0, vPos);
        ParticleManager.ReleaseParticleIndex(effect_fx);
        const enemies = FindUnitsInRadius(
            this.caster.GetTeam(),
            vPos,
            null,
            this.bb_radius,
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
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.ICE,
                is_primary: true,
                SelfAbilityMul: this.bb_value,
                DamageBonusMul: 0,
            });
        }
    }
}

@registerModifier()
export class modifier_drow_2a_b extends modifier_drow_2a {
    UpdataSpecialValue(): void {
        const cigu_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '16', 'cigu_value');
        if (cigu_value > 0) {
            this.proj_name = G_PorjLinear.drow.ice;
        }

        this.DamageBonusMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '15', 'bonus_value');
    }
}
