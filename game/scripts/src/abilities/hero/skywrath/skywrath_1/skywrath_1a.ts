import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_1, skywrath_1 } from "./skywrath_1";

/**
 * 雷鸣	技能赋予雷元素效果，变为雷元素伤害。对目标单位及周围半径150/200/250码范围造成雷元素伤害，提高40%的技能基础伤害。
悲鸣	雷鸣触发暴击时，会追加从天而降的雷电，造成该次雷鸣的200%/300%伤害。
引雷	雷鸣造成伤害时会在区域留下250范围的引雷区持续3秒，引雷区域的单位受到雷元素伤害增加50%/100%。

 */
@registerAbility()
export class skywrath_1a extends skywrath_1 {

    lm_radius: number;

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_zuus/zuus_base_attack.vpcf", context)
        precacheResString("particles/units/heroes/hero_zuus/zuus_lightning_bolt_aoe.vpcf", context)
        precacheResString("particles/units/heroes/hero_zuus/zuus_lightning_bolt_glow_fx.vpcf", context)
        precacheResString("particles/econ/items/zeus/lightning_weapon_fx/zuus_lightning_bolt_immortal_lightning.vpcf", context)

    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_1a"
    }

    UpdataSpecialValue(): void {
        this.SetCustomAbilityType("Targeting", true)
        this.lm_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "59", "radius");
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let SelfAbilityMul = extraData.SelfAbilityMul;
            let attack_damage = this.caster.GetAverageTrueAttackDamage(null);
            let vPos = target.GetAbsOrigin();
            this.OnAttackLandAoe(vPos, attack_damage, SelfAbilityMul)
        }
    }

    OnAttackLandAoe(vPos: Vector, attack_damage: number, SelfAbilityMul: number) {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_zuus/zuus_lightning_bolt_aoe.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(effect_fx, 0, vPos);
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.lm_radius, 1, 1))
        ParticleManager.ReleaseParticleIndex(effect_fx)


        // print(this.team,vPos,this.lm_radius)
        let enemies = FindUnitsInRadius(
            this.team,
            vPos,
            null,
            this.lm_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );


        let bm_crit = 0;
        for (let enemy of enemies) {
            let is_crit = RollPercentage(this.caster.custom_attribute_value.CriticalChance);
            if (is_crit) { bm_crit = 1 }
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: attack_damage,
                damage_type: DamageTypes.MAGICAL,
                element_type: ElementTypes.THUNDER,
                ability: this,
                is_primary: true,
                SelfAbilityMul: SelfAbilityMul + this.BasicAbilityDmg,
                critical_flag: is_crit ? 1 : -1
            })
        }

        if (bm_crit == 1) {

        }
    }

    OnCriticalStrike() {

    }
}

@registerModifier()
export class modifier_skywrath_1a extends modifier_skywrath_1 {

    UpdataSpecialValue(): void {
        this.tracking_proj_name = "particles/units/heroes/hero_zuus/zuus_base_attack.vpcf";
        this.SelfAbilityMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "59", "base_bonus");
    }
}