import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2a, modifier_drow_2a } from "./drow_2a";

/**
 * 15.穿透（3/3）:连续射击可穿透目标，伤害提高20%/40%/60%
16	刺骨	技能赋予冰元素效果，伤害变为冰元素伤害。（该技能冰元素减速效果增加至50%。2级才显示）
17	冰爆	连续射击命中被减速的敌人时，有12%概率发生冰爆，对范围300码敌人造成攻击力160%/200%/250%冰元素伤害。

 */
@registerAbility()
export class drow_2a_b extends drow_2a {

    // caster: CDOTA_BaseNPC;

    bonus_value: number;

    bb_chance: number;
    bb_radius: number;
    bb_value: number;

    cigu_value: number;

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2a_b"
    }

    UpdataSpecialValue(): void {
        this.bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", '15', 'bonus_value')
        this.cigu_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", '16', 'cigu_value')
        this.bb_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "17", "chance");
        this.bb_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "17", "base_value");
        let bb_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "17", "radius");
        this.bb_radius = this.GetTypesAffixValue(this.bb_chance, "Aoe", "skv_aoe_radius")
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            if (this.cigu_value > 0) {
                ApplyCustomDamage({
                    victim: target,
                    attacker: this.caster,
                    damage: ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this,
                    element_type: ElementTypes.ICE,
                    is_primary: true,
                })
            } else {
                ApplyCustomDamage({
                    victim: target,
                    attacker: this.caster,
                    damage: ability_damage,
                    damage_type: DamageTypes.PHYSICAL,
                    ability: this,
                    is_primary: true,
                })
            }


            // 减速的敌人有概率触发冰爆
            let is_slowed = UnitIsSlowed(target);
            // print("bingbao",is_slowed)
            if (is_slowed && RollPercentage(this.bb_chance)) {
                let vPos = target.GetAbsOrigin()
                let attack_damage = this.caster.GetAverageTrueAttackDamage(null);
                this.PlayEffectAoe(vPos, attack_damage);

                let aoe_multiple = this.GetTypesAffixValue(1, "Aoe", "skv_aoe_chance") - 1;
                if (RollPercentage(aoe_multiple)) {
                    let vPos2 = Vector(
                        vPos.x + RandomInt(-this.bb_radius, this.bb_radius),
                        vPos.y + RandomInt(-this.bb_radius, this.bb_radius),
                        vPos.z
                    );
                    this.PlayEffectAoe(vPos2, attack_damage);
                }

            }
            return false
        }
    }

    PlayEffectAoe(vPos: Vector, attack_damage: number) {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova_flash_c.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_fx, 0, vPos);
        ParticleManager.ReleaseParticleIndex(effect_fx);
        let enemies = FindUnitsInRadius(
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

        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.ICE,
                is_primary: true,
                // bonus_percent: this.bb_value
            })
        }
    }
}

@registerModifier()
export class modifier_drow_2a_b extends modifier_drow_2a {

    UpdataSpecialValue(): void {
        let cigu_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", '16', 'cigu_value')
        if (cigu_value > 0) {
            this.proj_name = G_PorjLinear.ice;
        }
        let bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", '15', 'bonus_value')
        this.base_value += bonus_value

    }
}