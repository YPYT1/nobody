import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { element_orb, modifier_skywrath_2a, modifier_skywrath_2a_surround, modifier_skywrath_2a_surround_collision, skywrath_2a } from "./skywrath_2a";

/**
 * 69	炎爆	"每5秒生成一颗火球环绕自身，触碰到敌人时爆炸造成范围火元素伤害，提升50%技能基础伤害。爆炸范围150码。火球上限3/4/5个。
持续时间10秒或触碰到敌人消失。
蓝量消耗：10"
70	烈炎	火球生成时间间隔减少1/2秒。
71	炽热	火球不再因为爆炸消失，火球持续时间延长5秒。

 */

@registerAbility()
export class skywrath_2a_a extends skywrath_2a {

    aoe_radius:number;
    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_2a_a"
    }

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/econ/items/phoenix/phoenix_ti10_immortal/phoenix_ti10_fire_spirit_ground.vpcf",context)
    }
    UpdataSpecialValue(): void {
        this.aoe_radius = this.GetTypesAffixValue(this.caster.GetTalentKv("69","bz_radius"),"Aoe","skv_aoe_radius") 
    }

    TriggerActive(params: PlayEffectProps): void {
        const damage = this.caster.GetAverageTrueAttackDamage(null);
        let enemies = FindUnitsInRadius(
            this.team,
            params.vPos,
            null,
            this.aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.FIRE,
                is_primary: true,
                SelfAbilityMul: params.SelfAbilityMul,
                DamageBonusMul: params.DamageBonusMul ?? 0,
                is_clone: params.is_clone ?? 0,
            })
        }
        let cast_fx = ParticleManager.CreateParticle(
            "particles/econ/items/phoenix/phoenix_ti10_immortal/phoenix_ti10_fire_spirit_ground.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(cast_fx, 0, params.vPos);
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.aoe_radius, 1, 1));
        ParticleManager.ReleaseParticleIndex(cast_fx);
    }
}

@registerModifier()
export class modifier_skywrath_2a_a extends modifier_skywrath_2a {

    count: number = 0;
    surround_mdf = "modifier_skywrath_2a_a_surround";
    constant_cd = 0;

    UpdataSpecialValue(): void {
        this.SelfAbilityMul += 50;
        this.surround_count = 1;
        this.surround_limit = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "69", "fb_count");
        // rune_60	法爷#9	炎爆每次生成火球时，一次性生成5个，火球数量上限+3
        this.surround_limit += this.caster.GetRuneKv("rune_60", "limit");
        let rune60_value = this.caster.GetRuneKv("rune_60", "value")
        if (rune60_value > 0) {
            this.surround_count = rune60_value
        }
        this.surround_duration += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "71", "fb_duration_bonus")
        this.constant_cd = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "70", "reduce_interval")
    }

    OnIntervalThink() {
        if (this.CastingConditions() && this.count < this.surround_limit) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            const clone_unit = this.caster.clone_unit;
            const max_count = this.surround_limit - this.count;
            let total_count = math.min(max_count, this.surround_count);
            // 1个 面向 2个对角 3
            let pre_angle = 360 / total_count;
            let surround_speed = 300// this.ability.GetTypesAffixValue(300, "Surround", "skv_surround_speed");
            let surround_distance = this.surround_radius;//this.ability.GetTypesAffixValue(, "Surround", "skv_surround_distance")
            for (let i = 0; i < total_count; i++) {
                this.count += 1;
                let surround_qangle = i * pre_angle;
                let hSpirit = GameRules.SummonedSystem.CreatedUnit(
                    "npc_summoned_dummy",
                    this.caster.GetAbsOrigin() + Vector(0, 300, 0) as Vector,
                    this.caster,
                    this.surround_duration,
                    true
                )

                hSpirit.AddNewModifier(this.caster, this.ability, this.surround_mdf, {
                    duration: this.surround_duration,
                    surround_distance: surround_distance,
                    surround_qangle: surround_qangle,
                    surround_speed: surround_speed,
                    surround_entity: this.caster.entindex(),
                    is_clone: 0,
                });

                if (this.CheckClone()) {
                    let hSpirit2 = GameRules.SummonedSystem.CreatedUnit(
                        "npc_summoned_dummy",
                        clone_unit.GetAbsOrigin() + Vector(0, 300, 0) as Vector,
                        this.caster,
                        this.surround_duration,
                        true
                    )

                    hSpirit2.AddNewModifier(this.caster, this.ability, this.surround_mdf, {
                        duration: this.surround_duration,
                        surround_distance: surround_distance,
                        surround_qangle: surround_qangle,
                        surround_speed: surround_speed,
                        surround_entity: clone_unit.entindex(),
                        is_clone: 1,
                    });
                }
            }

        }
    }

    SummonedUnit(hUnit: CDOTA_BaseNPC, manacost_bonus: number, clone_factor: number): void {

    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.COOLDOWN_REDUCTION_CONSTANT
        ]
    }

    GetModifierCooldownReduction_Constant(event: ModifierAbilityEvent): number {
        if (IsServer()) {
            if (event.ability == this.GetAbility()) {
                return this.constant_cd
            }
        }

    }
}

@registerModifier()
export class modifier_skywrath_2a_a_surround extends modifier_skywrath_2a_surround {

    ModifierAura = "modifier_skywrath_2a_a_surround_collision";

    is_clone: number;

    C_OnCreated(params: any): void {
        this.is_clone = params.is_clone
        this.GetParent().summoned_damage = GameRules.GetDOTATime(false, false) + 1;
        this.GetParent().is_clone = params.is_clone
        let effect_name = "particles/custom/hero/skywrath2a/surround_orb_fire_2.vpcf";
        let cast_fx = ParticleManager.CreateParticle(
            effect_name,
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        ParticleManager.SetParticleControlEnt(
            cast_fx, 1, this.GetParent(), ParticleAttachment.POINT_FOLLOW, "attach_hitloc", Vector(0, 0, 0), true
        )
        this.AddParticle(cast_fx, false, false, 1, false, false);
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        if (IsValid(this.caster) == false) {
            let main_mdf = this.caster.FindModifierByName("modifier_skywrath_2a_a") as modifier_skywrath_2a_a;
            if (main_mdf && this.is_clone == 0) main_mdf.count -= 1;
        }

        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_skywrath_2a_a_surround_collision extends modifier_skywrath_2a_surround_collision {

    OnCreated_Extends() {
        if (this.GetAuraOwner().summoned_damage < GameRules.GetDOTATime(false, false)) {
            this.GetAuraOwner().summoned_damage = GameRules.GetDOTATime(false, false) + this.interval
            this.damage_type = DamageTypes.MAGICAL
            this.element_type = ElementTypes.FIRE;
            const manacost_bonus = this.GetAuraOwner().manacost_bonus;
            const is_clone = this.GetParent().is_clone;
            const vPos = this.GetParent().GetAbsOrigin();
            this.GetAbility().TriggerActive({
                vPos: vPos,
                is_clone: is_clone,
                DamageBonusMul: manacost_bonus,
                SelfAbilityMul: this.SelfAbilityMul,
            })
            let aoe_multiple = this.GetAbility().GetTypesAffixValue(0, "Aoe", "skv_aoe_chance");
            if (RollPercentage(aoe_multiple)) {
                this.GetAbility().MultiCastAoe(vPos)
            }
            let talent71 = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "71", "fb_duration_bonus")
            if (this.GetAuraOwner()) {
                if (talent71 == 0) {
                    let surround_mdf = this.GetAuraOwner().FindModifierByName("modifier_skywrath_2a_a_surround");
                    if (surround_mdf) surround_mdf.Destroy()
                }

            }
        }




    }
}