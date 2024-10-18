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
    yl_thunder_bonus: number;
    yl_radius: number;
    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_zuus/zuus_base_attack.vpcf", context)
        precacheResString("particles/units/heroes/hero_zuus/zuus_lightning_bolt_aoe.vpcf", context)
        precacheResString("particles/units/heroes/hero_zuus/zuus_lightning_bolt_glow_fx.vpcf", context)
        precacheResString("particles/econ/items/zeus/lightning_weapon_fx/zuus_lightning_bolt_immortal_lightning.vpcf", context)
        precacheResString("particles/units/heroes/hero_zeus/zeus_cloud.vpcf", context)
    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_1a"
    }

    UpdataSpecialValue(): void {
        this.lm_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "59", "radius");
        this.yl_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "61", "yl_radius");
        // rune_54	法爷#3	引雷区域半径提高200码
        this.yl_radius += this.caster.GetRuneKv("rune_54", "radius")
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let vPos = target.GetAbsOrigin();
            this.OnAttackLandAoe(vPos, extraData)
        }
    }

    OnAttackLandAoe(vPos: Vector, extraData: ProjectileExtraData) {
        let SelfAbilityMul = extraData.SelfAbilityMul;
        let attack_damage = extraData.a;
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


        // rune_53	法爷#2	悲鸣的要求改变为不需要暴击可直接触发
        let bm_crit = this.caster.GetRuneKv("rune_53", "bm_value");
        let clone_res = this.CloneRes(extraData)

        for (let enemy of enemies) {
            let is_crit = RollPercentage(this.caster.custom_attribute_value.CriticalChance);
            if (is_crit) { bm_crit = 1 }
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: attack_damage,
                damage_type: DamageTypes.MAGICAL,
                element_type: extraData.et,
                ability: this,
                is_primary: true,
                SelfAbilityMul: SelfAbilityMul + this.BasicAbilityDmg,
                critical_flag: is_crit ? 1 : -1,
                is_clone: clone_res.Clone,
            })
        }

        let base_bonus_mul = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "60", "base_bonus_mul");
        if (bm_crit == 1 && base_bonus_mul > 0) {
            let effect_fx2 = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_zuus/zuus_lightning_bolt_glow_fx.vpcf",
                ParticleAttachment.WORLDORIGIN,
                null
            )
            ParticleManager.SetParticleControl(effect_fx2, 0, vPos);
            const vPos2 = vPos + Vector(0, 0, 1000) as Vector;
            ParticleManager.SetParticleControl(effect_fx2, 1, vPos2)
            ParticleManager.ReleaseParticleIndex(effect_fx2);

            let attack_damage2 = attack_damage * base_bonus_mul * 0.01
            for (let enemy of enemies) {
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: attack_damage2,
                    damage_type: DamageTypes.MAGICAL,
                    element_type: ElementTypes.THUNDER,
                    ability: this,
                    is_primary: true,
                    SelfAbilityMul: SelfAbilityMul + this.BasicAbilityDmg,
                    is_clone: clone_res.Clone,
                })
            }
        }
        // this.yl_radius = 200;
        if (this.yl_radius > 0) {
            CreateModifierThinker(
                this.caster,
                this,
                "modifier_skywrath_1a_yinlei",
                {
                    duration: 3,
                    yl_radius: this.yl_radius,
                },
                vPos,
                this.team,
                false
            )
        }
    }

    OnCriticalStrike() {

    }
}

@registerModifier()
export class modifier_skywrath_1a extends modifier_skywrath_1 {

    UpdataSpecialValue(): void {
        this.tracking_proj_name = "particles/units/heroes/hero_zuus/zuus_base_attack.vpcf";
        this.SelfAbilityMul += this.caster.GetTalentKv("59", "base_bonus");
        // rune_52	法爷#1	雷鸣技能基础伤害提高100%
        this.SelfAbilityMul += this.caster.GetRuneKv("rune_2", "value")

        this.element_type = ElementTypes.THUNDER
    }
}

@registerModifier()
export class modifier_skywrath_1a_yinlei extends BaseModifier {

    yl_radius: number;
    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 250; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_skywrath_1a_yinlei_aura"; }

    OnCreated(params: any): void {
        this.yl_radius = 0
        if (!IsServer()) { return }
        this.yl_radius = params.yl_radius as number;
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_zeus/zeus_cloud.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        let origin = this.GetParent().GetAbsOrigin();
        let cloud_pos = origin + Vector(0, 0, -500) as Vector;
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.yl_radius, 1, 1))
        ParticleManager.SetParticleControl(effect_fx, 2, cloud_pos)
        this.AddParticle(effect_fx, false, false, -1, false, false)
    }
}

@registerModifier()
export class modifier_skywrath_1a_yinlei_aura extends BaseModifier {

    buff_key = "skywrath_1a_yinlei";

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        let yl_thunder_bonus = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.GetCaster(), "61", "yl_thunder_bonus");
        let yinlei_mul = this.caster.GetTalentKv("93", "yinlei_mul");
        if (yinlei_mul > 0) {
            yinlei_mul = -100
        }
        GameRules.EnemyAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            "ThunderDamageIncome": {
                "Base": yl_thunder_bonus
            },
            "DmgReductionPct": {
                "Base": yinlei_mul
            }
        })

    }


    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.EnemyAttribute.DelAttributeInKey(this.GetParent(), this.buff_key)
    }
}