import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_dire_6_vision extends BaseModifier {

    parent: CDOTA_BaseNPC;
    buff_key = "dire_6_vision";
    
    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.VISION_DEGREES_RESTRICTION
        ]
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent()
        GameRules.CustomAttribute.SetAttributeInKey(this.parent, this.buff_key, {
            "VisionRange": {
                BasePercent: -100,
                Bonus: 300,
            }
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.parent, this.buff_key)
    }

    GetVisionDegreeRestriction() {
        return 30
    }
}