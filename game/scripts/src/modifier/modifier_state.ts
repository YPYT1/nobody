import { BaseAbility, registerAbility, BaseModifier, registerModifier } from "../utils/dota_ts_adapter";


@registerModifier()
export class modifier_state_invincible extends BaseModifier {

    IsHidden(): boolean { return false; }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        }
    }

}

@registerModifier()
export class modifier_state_damage_immunity extends BaseModifier {

    IsHidden(): boolean { return false; }

}


@registerModifier()
export class modifier_state_bloodmage extends BaseModifier {

    RemoveOnDeath(): boolean { return false }
    IsHidden(): boolean { return true; }
    IsPermanent(): boolean { return true }
}

@registerModifier()
export class modifier_state_movetips extends BaseModifier {

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        let vect = Vector(params.x, params.y, params.z);

        let line_pfx = ParticleManager.CreateParticle(
            "particles/diy_particles/move.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent(),
        );
        ParticleManager.SetParticleControl(line_pfx, 1, vect);
        this.AddParticle(line_pfx, false, false, -1, false, false);
    }
}

/** 任务单位 */
@registerModifier()
export class modifier_state_mission extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSLOWABLE]: true,
            // [ModifierState.NOT_ON_MINIMAP]:true,
        }
    }
}

/** 任务单位 */
@registerModifier()
export class modifier_state_noheathbar extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
        }
    }
}