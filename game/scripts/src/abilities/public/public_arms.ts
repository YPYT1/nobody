import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

// 属性
@registerAbility()
export class public_arms extends BaseAbility {

    // GetIntrinsicModifierName(): string {
    //     return "modifier_public_arms"
    // }
}

@registerModifier()
export class modifier_public_arms extends BaseModifier {

    timer: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.timer = 0;
        // this.StartIntervalThink(0.03)
    }

    // OnIntervalThink(): void {
    //     let hParent = this.GetParent();
    //     let fGameTime = GameRules.GetDOTATime(false, false);
    //     // print("fGameTime",fGameTime)
    //     for (let i = 0; i < 6; i++) {
    //         let hItem = hParent.GetItemInSlot(i);
    //         if (hItem && (hItem.ArmsTriggerTime ?? 0) <= fGameTime) {
    //             GameRules.ItemArmsSystem.ItemEffect(hItem,hParent)
    //         }
    //     }
    // }
}