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

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_2a_a"
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
        this.surround_duration += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "71", "fb_duration_bonus")
        this.constant_cd = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "70", "reduce_interval")
    }

    OnIntervalThink() {
        if (this.CastingConditions() && this.count < this.surround_limit) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            const max_count = this.surround_limit - this.count;
            let total_count = math.min(max_count, this.surround_count);
            // 1个 面向 2个对角 3
            let pre_angle = 360 / total_count;
            let surround_speed = this.ability.GetTypesAffixValue(300, "Surround", "skv_surround_speed");
            let surround_distance = this.ability.GetTypesAffixValue(this.surround_radius, "Surround", "skv_surround_distance")
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
                });
            }

        }
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

    C_OnCreated(params: any): void {
        this.GetParent().summoned_damage = GameRules.GetDOTATime(false, false) + 1;
        let effect_name = element_orb[ElementTypes.FIRE];
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
            if (main_mdf) main_mdf.count -= 1;
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
            const vPos = this.GetParent().GetAbsOrigin();
            let enemies = FindUnitsInRadius(
                this.team,
                vPos,
                null,
                150,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            )
            for (let enemy of enemies) {
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.GetCaster(),
                    damage: this.ability_damage,
                    damage_type: this.damage_type,
                    ability: this.ability,
                    element_type: this.element_type,
                    is_primary: true,
                    damage_vect: this.GetParent().GetAbsOrigin(),
                    SelfAbilityMul: this.SelfAbilityMul,
                })
            }
            let cast_fx = ParticleManager.CreateParticle(
                "particles/dev/hero/drow/drow_1/explosion_arrow.vpcf",
                ParticleAttachment.WORLDORIGIN,
                null
            )
            ParticleManager.SetParticleControl(cast_fx, 0, vPos);
            ParticleManager.SetParticleControl(cast_fx, 1, Vector(150, 1, 1));
            ParticleManager.ReleaseParticleIndex(cast_fx);

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