import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_1, skywrath_1 } from "./skywrath_1";

/**
 * 62	寒风波	技能赋予冰元素效果，变为冰元素伤害。
 * 提高25%/35%/50%技能基础伤害。技能命中敌人时，会分散给周围至多3个单位，（判定范围目标周围半径150码）
63	凛冽	分散单位增加 1/2
64	霜冻	寒风波命中的冰冻状态下的敌人时，造成伤害提高2.5/5倍。

 */
@registerAbility()
export class skywrath_1b extends skywrath_1 {

    split_count: number = 1;
    split_radius: number = 150;
    frozen_mul: number = 0
    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_1b"
    }

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_lich/lich_chain_frost.vpcf", context)
    }

    UpdataSpecialValue(): void {
        this.split_count = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "62", 'split_count');
        this.split_count += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "63", 'split_count_bonus');
        this.split_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "62", 'split_radius');

        this.frozen_mul = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "64", 'frozen_mul');
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            const code = extraData.c ?? 0;
            if (code == 0) {
                let enemies = FindUnitsInRadius(
                    this.team,
                    target.GetAbsOrigin(),
                    null,
                    this.split_radius,
                    UnitTargetTeam.ENEMY,
                    UnitTargetType.HERO + UnitTargetType.BASIC,
                    UnitTargetFlags.FOW_VISIBLE,
                    FindOrder.ANY,
                    false
                )
                let count = 0;
                for (let unit of enemies) {
                    if (count < this.split_count && unit != target) {
                        count += 1;
                        ProjectileManager.CreateTrackingProjectile({
                            // Source: this.caster,
                            Target: unit,
                            vSourceLoc: target.GetAbsOrigin(),
                            Ability: this,
                            EffectName: "particles/units/heroes/hero_lich/lich_chain_frost.vpcf",
                            iSourceAttachment: ProjectileAttachment.HITLOCATION,
                            iMoveSpeed: this.caster.GetProjectileSpeed(),
                            ExtraData: {
                                a: extraData.a,
                                et: extraData.et,
                                dt: extraData.dt,
                                SelfAbilityMul: extraData.SelfAbilityMul,
                                DamageBonusMul: extraData.DamageBonusMul,
                                c: 1,
                            } as ProjectileExtraData
                        })
                    }
                }
            }

            let attack_damage = extraData.a;
            let SelfAbilityMul = extraData.SelfAbilityMul ?? 100;

            if (target.HasModifier("modifier_element_effect_ice_frozen")) {
                attack_damage *= (1 + this.frozen_mul)
            }

            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.ICE,
                is_primary: true,
                // 增伤
                SelfAbilityMul: SelfAbilityMul + this.BasicAbilityDmg,
                // DamageBonusMul: extraData.DamageBonusMul,
                // DamageBonusMul:0,
            })
        }
    }

}

@registerModifier()
export class modifier_skywrath_1b extends modifier_skywrath_1 {

    UpdataSpecialValue(): void {
        this.tracking_proj_name = "particles/units/heroes/hero_lich/lich_chain_frost.vpcf";
        this.SelfAbilityMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "62", 'base_bonus');
    }
}