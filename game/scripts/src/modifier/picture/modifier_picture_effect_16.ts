import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

// 幽冥
@registerModifier()
export class modifier_picture_effect_16 extends BaseModifier {

    buff_key = "picture_16";


    OnCreated(params: Object): void {
        if (!IsServer()) { return }
        const ms_base_pct = params["ms_base_pct"] as number;
        this.parent = this.GetParent()
        this.parent.SetAttributeInKey(this.buff_key, {
            "MoveSpeed": {
                "BasePercent": ms_base_pct
            }
        })

        let effect_fx = ParticleManager.CreateParticle(
            "particles/items_fx/ghost.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        this.parent.DelAttributeInKey(this.buff_key)
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.SILENCED]: true,
            [ModifierState.DISARMED]: true,
            [ModifierState.MAGIC_IMMUNE]: true,
            [ModifierState.ATTACK_IMMUNE]: true,
            [ModifierState.INVULNERABLE]: true,
        }
    }

    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_ghost.vpcf";
    }
}