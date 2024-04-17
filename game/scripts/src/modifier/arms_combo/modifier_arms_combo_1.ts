import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import { ArmsComboModifier } from "./arms_combo";

/** 
 * 认知失调 
*/
@registerModifier()
export class modifier_arms_combo_1 extends ArmsComboModifier {

    combo_id = 1;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
    }

    GetEffectName(): string {
        return "particles/generic_gameplay/generic_stunned.vpcf"
    }

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.OVERHEAD_FOLLOW
    }
}