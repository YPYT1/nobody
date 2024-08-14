import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2a, modifier_drow_2a } from "./drow_2a";

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

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2a_b"
    }

    UpdataSpecialValue(): void {
        this.DamageBonusMul = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", '15', 'bonus_value')
        this.cigu_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", '16', 'cigu_value')
        this.bb_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "17", "chance");
        this.bb_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "17", "base_value");
        // rune_34	游侠#9	连续射击【冰爆】的伤害提升至500%
        if (this.caster.rune_passive_type["rune_34"]) {
            this.bb_value = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_34', 'bb_dmg')
        }
        let bb_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "17", "radius");
        this.bb_radius = this.GetTypesAffixValue(this.bb_chance, "Aoe", "skv_aoe_radius")
        // rune_35	游侠#10	连续射击【冰爆】的范围提高50%，且必定触发冰爆
        if (this.caster.rune_passive_type["rune_35"]) {
            let bb_radius_bonus_pct = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_35', 'bb_radius_bonus_pct') * 0.01;
            this.bb_radius *= (1 + bb_radius_bonus_pct)
            this.bb_state = true;
        }
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            let SelfAbilityMul = extraData.SelfAbilityMul;
            let DamageBonusMul = extraData.DamageBonusMul;

            if (this.cigu_value > 0) {
                ApplyCustomDamage({
                    victim: target,
                    attacker: this.caster,
                    damage: ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this,
                    element_type: ElementTypes.ICE,
                    is_primary: true,
                    SelfAbilityMul: SelfAbilityMul,
                    DamageBonusMul: DamageBonusMul,
                })
            } else {
                ApplyCustomDamage({
                    victim: target,
                    attacker: this.caster,
                    damage: ability_damage,
                    damage_type: DamageTypes.PHYSICAL,
                    ability: this,
                    is_primary: true,
                    SelfAbilityMul: SelfAbilityMul,
                    DamageBonusMul: DamageBonusMul,
                })
            }


            // 减速的敌人有概率触发冰爆
            let is_slowed = UnitIsSlowed(target);
            // print("bingbao",is_slowed)
            if (is_slowed && (this.bb_state || RollPercentage(this.bb_chance))) {
                let vPos = target.GetAbsOrigin()
                // let attack_damage = this.caster.GetAverageTrueAttackDamage(null);
                this.PlayEffectAoe(vPos, ability_damage, DamageBonusMul);

                let aoe_multiple = this.GetTypesAffixValue(1, "Aoe", "skv_aoe_chance") - 1;
                if (RollPercentage(aoe_multiple)) {
                    let vPos2 = Vector(
                        vPos.x + RandomInt(-this.bb_radius, this.bb_radius),
                        vPos.y + RandomInt(-this.bb_radius, this.bb_radius),
                        vPos.z
                    );
                    this.PlayEffectAoe(vPos2, ability_damage, DamageBonusMul);
                }

            }
            return false
        }
    }

    PlayEffectAoe(vPos: Vector, attack_damage: number, DamageBonusMul: number) {
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
                SelfAbilityMul: this.bb_value,
                DamageBonusMul: DamageBonusMul,
                // bp_ingame: bp_ingame,
                // bp_server: bp_server,
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
        this.DamageBonusMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", '15', 'bonus_value')

    }
}