import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import { ArmsComboModifier } from "./arms_combo";

/** 
 * 认知失调 
*/
@registerModifier()
export class modifier_arms_combo_1 extends ArmsComboModifier {

    combo_id = 1;
    QueryUnit: EntityIndex;
    hParent: CDOTA_BaseNPC;
    State: boolean;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.State = true;
        this.hParent = this.GetParent();
        this.QueryUnit = this.GetParent().entindex();
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.State = true;
    }

    GetEffectName(): string {
        return "particles/generic_gameplay/generic_stunned.vpcf"
    }

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.OVERHEAD_FOLLOW
    }

    // DeclareFunctions(): ModifierFunction[] {
    //     return [
    //         ModifierFunction.ON_ORDER
    //     ]
    // }

    // OnOrder(event: ModifierUnitEvent): void {
    //     if (event.unit != this.hParent) { return }
    //     if (!this.hParent.IsAlive()) { return }
    //     if (this.State == false) { return }
    //     let order_type = event.order_type;
    //     let move_pos = event.new_pos;
    //     if (order_type == UnitOrder.ATTACK_TARGET || order_type == UnitOrder.MOVE_TO_TARGET) {
    //         move_pos = event.unit.GetAbsOrigin();
    //     }
    //     if (move_pos == Vector(0, 0, 0)) { return }
    //     let new_pos = RotatePosition(this.hParent.GetAbsOrigin(), QAngle(0, 180, 0), move_pos);
    //     this.State = false;
    //     this.GetParent().SetContextThink("combie_1_order", () => {
    //         ExecuteOrderFromTable({
    //             UnitIndex: this.QueryUnit,
    //             OrderType: UnitOrder.MOVE_TO_POSITION,
    //             Position: new_pos,
    //             Queue: false,
    //         })
    //         this.State = true;
    //         return null
    //     }, 0)

    // }
}