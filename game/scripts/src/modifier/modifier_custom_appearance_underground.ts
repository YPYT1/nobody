import { BaseModifierMotionBoth, registerModifier } from '../utils/dota_ts_adapter';

/** 单位地上登场 */
@registerModifier()
export class modifier_custom_appearance_underground extends BaseModifierMotionBoth {

    init_vect: Vector;
    bMoved: boolean;
    flOffsetZ: number;

    IsDebuff(): boolean { return false; }
    GetPriority(): ModifierPriority { return ModifierPriority.ULTRA + 100000; }

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        let hParent = this.GetParent();
        this.init_vect = hParent.GetOrigin();
        this.bMoved = true;
        let effect_fx = ParticleManager.CreateParticle(
            "particles/econ/events/fall_2021/teleport_end_fall_2021_lvl1.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_fx, 0, this.GetParent().GetAbsOrigin());
        ParticleManager.SetParticleControlForward(effect_fx, 0, this.GetParent().GetForwardVector());
        this.AddParticle(effect_fx, false, false, -1, false, false);
        let fHeight = 190 * this.GetDuration();
        this.flOffsetZ = fHeight / (this.GetDuration() + 0.1);
        print(fHeight, this.flOffsetZ)
        let vOffetPos = this.GetParent().GetAbsOrigin() + Vector(0, 0, -1 * fHeight) as Vector;
        this.GetParent().SetOrigin(vOffetPos);
        if (this.ApplyVerticalMotionController() == false || this.ApplyHorizontalMotionController() == false) {
            this.Destroy();
            return;
        }

    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        // 加特效 
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_ursa/ursa_earthshock.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_fx, 0, this.init_vect);
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(600, 1, 1));
        ParticleManager.ReleaseParticleIndex(effect_fx);

        this.GetParent().RemoveVerticalMotionController(this);
        this.GetParent().RemoveHorizontalMotionController(this);
        this.GetParent().SetOrigin(this.init_vect);

        //有目标才进攻
        // if (this.GetCaster()) {
        //     ExecuteOrderFromTable({
        //         UnitIndex: this.GetParent().entindex(),
        //         OrderType: UnitOrder.ATTACK_TARGET,
        //         TargetIndex: this.GetCaster().entindex(),
        //         Queue: false,
        //     });
        // }
    }

    UpdateVerticalMotion(me: CDOTA_BaseNPC, dt: number): void {
        if (!IsServer()) { return; }
        let vNewPos = this.GetParent().GetAbsOrigin() + Vector(0, 0, this.flOffsetZ * dt) as Vector;
        if (vNewPos.z >= this.init_vect.z) {
            this.Destroy();
            return;
        }
        this.GetParent().SetOrigin(vNewPos);
    }

    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {
        if (!IsServer()) { return; }
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.STUNNED]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.UNSELECTABLE]: true,
        };
    }


}