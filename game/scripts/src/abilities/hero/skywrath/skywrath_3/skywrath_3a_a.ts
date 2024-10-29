import { StackModifier } from "../../../../modifier/extends/modifier_stack";
import { modifier_element_effect_fire } from "../../../../modifier/modifier_element";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_3a, skywrath_3a } from "./skywrath_3a";

/**
 * 87	陨石雨	"吟唱3秒，召唤3枚陨石雨打击向自身范围1000码内随机敌军，
 * 对目标及周围单位造成范围火元素伤害，额外提高50%/70%/100%的技能基础伤害。
伤害范围：目标半径200码"
88	火种	"一颗陨石雨打击地面时，会在原地留下一枚火种。
89	引爆	"陨石雨造成伤害时若波及到火种，则会引爆火种，再造成一次范围伤害。
90	焚天	陨石雨对3秒内被陨石雨命中过目标造成伤害时，提高50%/100%伤害加成。
 */

@registerAbility()
export class skywrath_3a_a extends skywrath_3a {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_3a_a"
    }

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_invoker/invoker_chaos_meteor.vpcf", context);
        precacheResString("particles/units/heroes/hero_invoker/invoker_chaos_meteor_fly.vpcf", context)
        precacheResString("models/ui/candyworks/particles/candyworks_fireplace_light.vpcf", context)
        precacheResString("particles/custom/hero/skywrath3a/sun_strike.vpcf", context);
        precacheResString("particles/econ/courier/courier_cluckles/courier_cluckles_ambient_rocket_explosion.vpcf", context)
        precacheResString("particles/custom/hero/skywrath3a/tinder_explosion.vpcf", context)
    }
}

@registerModifier()
export class modifier_skywrath_3a_a extends modifier_skywrath_3a {


    meteor_count: number;
    range: number;

    UpdataSpecialValue(): void {
        this.channel_time = 3
        let meteor_count = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "87", "meteor_count");
        // rune_70	法爷#19	陨石雨数量增加1枚，范围扩大100码
        meteor_count += this.caster.GetRuneKv("rune_70", "value");

        this.meteor_count = this.GetAbility().GetTypesAffixValue(meteor_count, "Targeting", "skv_targeting_count");

        this.range = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "87", "range");


    }

    OnIntervalThink(): void {
        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            // 开始蓄力
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3a_a_channel", {
                duration: 3,
                manacost_bonus: manacost_bonus,
            })
        }
    }

    PlayEffect(params: PlayEffectProps) {
        // print("PlayEffect")
        let vPos = this.caster.GetAbsOrigin();
        this.PlayMeteor(vPos, params, 0)
        if (this.CheckClone()) {
            let clone_pos = this.caster.clone_unit.GetOrigin();
            this.PlayMeteor(clone_pos, params, 1)
        }


    }


    PlayMeteor(vPos: Vector, params: PlayEffectProps, is_clone: number) {
        let enemies = FindUnitsInRadius(
            this.team,
            vPos,
            null,
            this.range,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        let count = 0;
        for (let enemy of enemies) {
            count += 1;
            CreateModifierThinker(
                this.caster,
                this.GetAbility(),
                "modifier_skywrath_3a_a_meteor",
                {
                    manacost_bonus: params.value,
                    is_clone: is_clone
                },
                enemy.GetAbsOrigin() + RandomVector(50) as Vector,
                this.team,
                false
            )
            if (count >= this.meteor_count) {
                break;
            }
        }
        for (let i = count; i < this.meteor_count; i++) {
            CreateModifierThinker(
                this.caster,
                this.GetAbility(),
                "modifier_skywrath_3a_a_meteor",
                {
                    manacost_bonus: params.value,
                    is_clone: is_clone
                },
                vPos + RandomVector(RandomInt(300, this.range)) as Vector,
                this.team,
                false
            )
        }
    }
}

@registerModifier()
export class modifier_skywrath_3a_a_channel extends BaseModifier {

    least_time: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.manacost_bonus = params.manacost_bonus;
        this.least_time = GameRules.GetDOTATime(false, false) + this.GetDuration()
        // rune_71	法爷#20	陨石雨变为瞬发不再吟唱
        if (this.caster.GetRuneKv("rune_71", "value") > 0) {
            this.least_time = 0;
            this.Destroy()
        } else {
            GameRules.CMsg.AbilityChannel(this.caster, this, 1)
        }

    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CMsg.AbilityChannel(this.caster, this, 0)
        if (this.least_time <= GameRules.GetDOTATime(false, false)) {
            // 成功吟唱
            let mdf = this.caster.FindModifierByName("modifier_skywrath_3a_a") as modifier_skywrath_3a_a;
            if (mdf) {
                mdf.PlayEffect({ value: this.manacost_bonus });
            }
        }

    }
}

@registerModifier()
export class modifier_skywrath_3a_a_meteor extends BaseModifier {

    caster_origin: Vector;
    parent_origin: Vector;

    radius: number;
    attack_damage: number;

    mutle_chance: number;
    is_multi: boolean;

    Aoe_DamageBonusMul:number;
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.is_clone = params.is_clone;
        this.manacost_bonus = params.manacost_bonus
        this.caster = this.GetCaster()
        this.parent = this.GetParent()
        this.team = this.caster.GetTeamNumber();
        let radius = this.caster.GetTalentKv("87", "radius");
        // rune_70	法爷#19	陨石雨数量增加1枚，范围扩大100码
        radius += this.caster.GetRuneKv("rune_70", "radius");
        this.radius = this.GetAbility().GetTypesAffixValue(radius, "Aoe", "skv_aoe_radius");
        this.caster_origin = this.caster.GetAbsOrigin()
        this.parent_origin = this.parent.GetAbsOrigin();
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null);

        this.SelfAbilityMul = this.GetAbility().GetSpecialValueFor("base_value");
        this.SelfAbilityMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "87", "bonus_base");
        // rune_69	法爷#18	元素轰炸系列的技能基础伤害提高100%
        this.SelfAbilityMul += this.caster.GetRuneKv("rune_69", "value");

        let dealy = this.GetDuration();

        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_invoker/invoker_chaos_meteor_fly.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 0, this.caster_origin + Vector(0, 0, 1200) as Vector)
        ParticleManager.SetParticleControl(effect_fx, 1, this.parent_origin)
        ParticleManager.SetParticleControl(effect_fx, 2, Vector(1.3, 0, 0))
        ParticleManager.ReleaseParticleIndex(effect_fx)

        this.is_multi = false;
        this.mutle_chance = this.GetAbility().GetTypesAffixValue(0, "Aoe", "skv_aoe_chance");
        this.Aoe_DamageBonusMul = this.GetAbility().GetTypesAffixValue(0,"Aoe","skv_aoe_d_bonus");
        this.StartIntervalThink(1.3)
    }

    OnIntervalThink(): void {
        // effect
        let effect_fx = ParticleManager.CreateParticle(
            "particles/custom/hero/skywrath3a/sun_strike.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        ParticleManager.SetParticleControl(effect_fx, 0, this.parent_origin);
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.radius, 0, 0));
        ParticleManager.ReleaseParticleIndex(effect_fx);

        let enemies = FindUnitsInRadius(
            this.team,
            this.parent_origin,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        // rune_72	法爷#21	陨石雨命中时会直接结算敌方单位的灼烧伤害
        let rune_72 = this.caster.GetRuneKv("rune_72", "value")
        const meteor_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "90", "meteor_duration");
        const meteor_bonus = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "90", "meteor_bonus");

        // rune_75	法爷#24	焚天效果变为可叠加，至多叠加5层
        let fentian_stack = 1;
        fentian_stack = math.max(this.caster.GetRuneKv("rune_75", "value"), fentian_stack)
        for (let enemy of enemies) {
            if (rune_72 > 0 && enemy.HasModifier("modifier_element_effect_fire")) {
                let fire_mdf = enemy.FindModifierByName("modifier_element_effect_fire") as modifier_element_effect_fire;
                if (fire_mdf) {
                    fire_mdf.SettlementDamage()
                }
            }

            let bonus = 0;
            if (enemy.HasModifier("modifier_skywrath_3a_a_fentian")) {
                let stack = enemy.GetModifierStackCount("modifier_skywrath_3a_a_fentian", this.caster)
                bonus = stack * meteor_bonus
            }
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypes.FIRE,
                is_primary: true,
                // 增伤
                SelfAbilityMul: this.SelfAbilityMul,
                DamageBonusMul: this.manacost_bonus + meteor_bonus + this.Aoe_DamageBonusMul,
                is_clone: this.is_clone,
            })

            // fentian
            if (meteor_duration > 0) {
                enemy.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3a_a_fentian", {
                    duration: meteor_duration,
                    max_stack: fentian_stack
                })
            }

        }
        // 89
        let explosion_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "89", "explosion_radius");
        if (explosion_radius > 0) {
            // 引爆火种
            let tinder_damage = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "89", "tinder_damage");
            // let tinder_list = Entities.FindAllByNameWithin("npc_summoned_tinder", this.parent_origin, this.radius + 25);
            // DebugDrawCircle(this.parent_origin, Vector(255, 0, 0), 100, 225, true, 1)
            let tinder_list = FindUnitsInRadius(
                this.team,
                this.parent_origin,
                null,
                this.radius + 25,
                UnitTargetTeam.FRIENDLY,
                UnitTargetType.ALL,
                UnitTargetFlags.INVULNERABLE,
                FindOrder.ANY,
                false
            )

            for (let tinder of tinder_list) {
                let unitname = tinder.GetUnitName();
                if (unitname == "npc_summoned_tinder") {
                    let tinder_origin = tinder.GetAbsOrigin();
                    UTIL_Remove(tinder);
                    this.PlayIgnite(tinder_origin, explosion_radius, tinder_damage)
                }

            }

        }

        // 火种
        let tinder_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "88", "tinder_duration");
        if (tinder_duration > 0) {
            // 创建火种
            this.CreateTinder(tinder_duration)
        }
        print("this.is_multi", this.is_multi, this.mutle_chance,RollPercentage(this.mutle_chance))
        if (RollPercentage(this.mutle_chance)) {
            this.mutle_chance = 0;
            this.is_multi = true;
            this.StartIntervalThink(0.25)
            return
        }
        if (this.is_multi) { this.PlayMultiCast() }
        this.StartIntervalThink(-1)
        this.Destroy()
    }

    PlayMultiCast() {
        let value = 2;
        let sound_cast = "Hero_OgreMagi.Fireblast.x1";
        EmitSoundOn(sound_cast, this.GetParent());

        let effect_cast = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_ogre_magi/ogre_magi_multicast.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_cast, 0, this.GetParent().GetAbsOrigin())
        ParticleManager.SetParticleControl(effect_cast, 1, Vector(value, 2, 0));
        ParticleManager.ReleaseParticleIndex(effect_cast);

    }

    CreateTinder(tinder_duration: number) {
        let tinder = CreateUnitByName("npc_summoned_tinder", this.parent_origin, false, null, null, this.team);
        tinder.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3a_a_tinder", { duration: tinder_duration })

        // tinder.type
    }

    PlayIgnite(vPos: Vector, explosion_radius: number, tinder_damage: number) {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/custom/hero/skywrath3a/tinder_explosion.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(explosion_radius, 0, 0))
        ParticleManager.ReleaseParticleIndex(effect_fx)
        let enemies = FindUnitsInRadius(
            this.team,
            vPos,
            null,
            explosion_radius,
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
                damage: this.attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypes.FIRE,
                is_primary: false,
                // 增伤
                SelfAbilityMul: tinder_damage,
                is_clone: this.is_clone,
            })
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_skywrath_3a_a_tinder extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let effect_fx = ParticleManager.CreateParticle(
            "particles/world_environmental_fx/fire_torch.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        )
        this.AddParticle(effect_fx, false, false, -1, false, false)
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        if (this.GetCaster() == null || this.GetAbility() == null) {
            this.Destroy()
            return
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVISIBLE]: true,
            [ModifierState.UNSELECTABLE]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        }
    }
}

@registerModifier()
export class modifier_skywrath_3a_a_fentian extends StackModifier {

}