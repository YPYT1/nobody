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
        precacheResString("particles/econ/courier/courier_cluckles/courier_cluckles_ambient_rocket_explosion.vpcf", context)
    }
}

@registerModifier()
export class modifier_skywrath_3a_a extends modifier_skywrath_3a {


    meteor_count: number;
    range: number;

    UpdataSpecialValue(): void {
        this.channel_time = 3


        this.meteor_count = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "87", "meteor_count");
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
        print("PlayEffect")
        let vPos = this.caster.GetAbsOrigin();
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
                    duration: 1.3,
                    manacost_bonus: params.value,
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
                    duration: 2,
                    manacost_bonus: params.value,
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
        this.GetAbility().SetFrozenCooldown(true)
        this.caster = this.GetCaster();
        this.manacost_bonus = params.manacost_bonus;
        this.least_time = GameRules.GetDOTATime(false, false) + this.GetDuration()
        GameRules.BasicRules.StopMove(this.caster);
        GameRules.CMsg.AbilityChannel(this.caster, this, 1)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CMsg.AbilityChannel(this.caster, this, 0)
        this.GetAbility().SetFrozenCooldown(false)
        if (this.least_time <= GameRules.GetDOTATime(false, false)) {
            // 成功吟唱
            let mdf = this.caster.FindModifierByName("modifier_skywrath_3a_a") as modifier_skywrath_3a_a;
            if (mdf) mdf.PlayEffect({ value: this.manacost_bonus });
        }

    }
}

@registerModifier()
export class modifier_skywrath_3a_a_meteor extends BaseModifier {

    caster_origin: Vector;
    parent_origin: Vector;

    radius: number;
    attack_damage: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return }

        this.manacost_bonus = params.manacost_bonus
        this.caster = this.GetCaster()
        this.parent = this.GetParent()
        this.team = this.caster.GetTeamNumber();
        this.radius = 200;
        this.caster_origin = this.caster.GetAbsOrigin()
        this.parent_origin = this.parent.GetAbsOrigin();
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null);

        this.SelfAbilityMul = this.GetAbility().GetSpecialValueFor("base_value");
        this.SelfAbilityMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "87", "bonus_base");

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

        this.StartIntervalThink(1.3)
    }

    OnIntervalThink(): void {
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

        const meteor_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "90", "meteor_duration");
        const meteor_bonus = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "90", "meteor_bonus");
        for (let enemy of enemies) {

            let bonus = 0;
            if (enemy.HasModifier("modifier_skywrath_3a_a_fentian")){
                bonus = meteor_bonus
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
                DamageBonusMul: this.manacost_bonus + meteor_bonus
            })

            // fentian
            if(meteor_duration > 0){
                enemy.AddNewModifier(this.caster,this.GetAbility(),"modifier_skywrath_3a_a_fentian",{
                    duration:meteor_duration
                })
            }
            
        }
        // 89
        let explosion_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "89", "explosion_radius");
        if (explosion_radius > 0) {
            // 引爆火种
            let tinder_damage = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "89", "tinder_damage");
            let tinder_list = Entities.FindAllByNameWithin("npc_summoned_tinder", this.parent_origin, this.radius + 25);
            for (let tinder of tinder_list) {
                let tinder_origin = tinder.GetAbsOrigin();
                UTIL_Remove(tinder);
                this.PlayIgnite(tinder_origin, explosion_radius, tinder_damage)
            }

        }

        // 火种
        let tinder_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "88", "tinder_duration");
        if (tinder_duration > 0) {
            // 创建火种
            this.CreateTinder(tinder_duration)
        }

        this.StartIntervalThink(-1)
    }

    CreateTinder(tinder_duration: number) {
        let tinder = CreateUnitByName("npc_summoned_tinder", this.parent_origin, false, null, null, this.team);
        tinder.AddNewModifier(this.caster, null, "modifier_skywrath_3a_a_tinder", { duration: tinder_duration })
    }

    PlayIgnite(vPos: Vector, explosion_radius: number, tinder_damage: number) {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/econ/courier/courier_cluckles/courier_cluckles_ambient_rocket_explosion.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        ParticleManager.SetParticleControl(effect_fx, 0, vPos)
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
        //
        let effect_fx = ParticleManager.CreateParticle(
            "models/ui/candyworks/particles/candyworks_fireplace_light.vpcf",
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
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSELECTABLE]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        }
    }
}

@registerModifier()
export class modifier_skywrath_3a_a_fentian extends BaseModifier {

    IsHidden(): boolean {
        return true
    }
}