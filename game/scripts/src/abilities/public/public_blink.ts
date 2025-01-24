import { modifier_generic_arc_lua } from "../../modifier/modifier_generic_arc_lua";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";
import { BaseHeroAbility } from "../hero/base_hero_ability";


@registerAbility()
export class public_blink extends BaseHeroAbility {

    distance: number;
    // caster: CDOTA_BaseNPC;

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_faceless_void/faceless_void_time_walk.vpcf", context)
        precacheResString("particles/units/heroes/hero_faceless_void/faceless_void_time_walk_preimage.vpcf", context)
        precacheResString("particles/econ/events/spring_2021/phase_boots_spring_2021_cascadeimage.vpcf", context)
    }


    OnUpgrade(): void {
        this.distance = this.GetSpecialValueFor("distance");
        this.caster = this.GetCaster();
    }

    OnSpellStart(): void {
        let vTarget = this.caster.GetOrigin() + (this.caster.GetForwardVector() * this.distance) as Vector;
        this.caster.AddNewModifier(this.caster, this, "modifier_public_blink", {
            target_x: vTarget.x,
            target_y: vTarget.y,
            target_z: vTarget.z,
            height: 100,
            speed: 1000,
            duration: 0.5,
            path:1,
        })

        // let effect_fx = ParticleManager.CreateParticle(
        //     "particles/units/heroes/hero_faceless_void/faceless_void_time_walk_preimage.vpcf",
        //     ParticleAttachment.POINT,
        //     this.caster
        // )
        // ParticleManager.SetParticleControl(effect_fx, 1, vTarget)
        // ParticleManager.SetParticleControlEnt(effect_fx, 2, this.caster, ParticleAttachment.POINT_FOLLOW,
        //     "attach_hitloc", Vector(0, 0, 0), true
        // );
        // ParticleManager.ReleaseParticleIndex(effect_fx)
    }
}


@registerModifier()
export class modifier_public_blink extends modifier_generic_arc_lua {

    _OnCreated(kv: any): void {
        // this.bFindPath = GridNav.CanFindPath(this.vTarget, this.GetParent().GetOrigin());
        // this.GetAbility().SetFrozenCooldown(true)
        // let effect_fx = ParticleManager.CreateParticle(
        //     "particles/ability/blink/blink_preimage.vpcf",
        //     ParticleAttachment.POINT_FOLLOW,
        //     this.GetParent()
        // )
        // ParticleManager.SetParticleControlEnt(effect_fx, 0, this.GetParent(), ParticleAttachment.POINT_FOLLOW,
        //     "attach_hitloc", Vector(0, 0, 0), true
        // );
        // this.AddParticle(effect_fx, false, false, -1, false, false)

    }

    CheckState(): Partial<Record<ModifierState, boolean>> {

        return {
            [ModifierState.STUNNED]: this.isStun ?? false,
            [ModifierState.COMMAND_RESTRICTED]: this.isRestricted ?? false,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.ROOTED]: true,
            // [ModifierState.INVULNERABLE]: true,
        };
    }

    _OnDestroy(): void {
        // this.GetAbility().SetFrozenCooldown(false)
    }
}