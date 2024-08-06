import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

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
    bonus_value: number;

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1a"
    }

    // LoadCustomAbilityType(): void {
    //     this.SetCustomAbilityType("Aoe", true)
    //     this.AddCustomAbilityElement(ElementTypes.FIRE)
    // }

    UpdataSpecialValue(): void {

        // this.GetLevelSpecialValueNoOverride()
        this.bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "2", "bonus_value");
        this.mul_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "3", "mul_chance");
        this.mul_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "3", "mul_value");
        let aoe_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "2", "skv_aoe_radius")
            + GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "4", "skv_aoe_radius");

        this.aoe_radius = GameRules.CustomOverrideAbility.GetTypesAffixValue(aoe_radius, "Aoe","skv_aoe_radius", this)
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            // let element_type: ElementTypes = extraData.et;
            // let damage_type: DamageTypes = extraData.dt;

            let vPos = target.GetAbsOrigin();
            let ability_damage = this.caster.GetAverageTrueAttackDamage(null) * (1 + (this.bonus_value) * 0.01)
            let effect_name = "particles/dev/hero/drow/drow_1/explosion_arrow.vpcf"
            if (RollPercentage(this.mul_chance)) {
                ability_damage *= this.mul_value
            }
            // print("this.aoe_radius", this.mul_chance, this.mul_value)
            let enemies = FindUnitsInRadius(
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

            for (let enemy of enemies) {
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    element_type: ElementTypes.FIRE,
                    ability: this,
                    is_primary: true,
                })
            }

            let cast_fx = ParticleManager.CreateParticle(
                effect_name,
                ParticleAttachment.WORLDORIGIN,
                null
            )
            ParticleManager.SetParticleControl(cast_fx, 0, vPos);
            ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.aoe_radius, 1, 1));
            ParticleManager.ReleaseParticleIndex(cast_fx);
        }
    }
}

@registerModifier()
export class modifier_drow_1a extends modifier_drow_1 {

    UpdataSpecialValue(): void {
        this.tracking_proj_name = G_PorjTrack.fire;
    }

}