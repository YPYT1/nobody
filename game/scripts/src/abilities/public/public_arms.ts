import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

// 属性
@registerAbility()
export class public_arms extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_public_arms"
    }
}

@registerModifier()
export class modifier_public_arms extends BaseModifier {

    timer: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.StartIntervalThink(0.03)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.StartIntervalThink(0.03)
    }

    OnIntervalThink(): void {
        let hParent = this.GetParent();
        if (!hParent.IsAlive()) { this.StartIntervalThink(-1) }
        let fGameTime = GameRules.GetDOTATime(false, false);
        for (let i = 0; i < 6; i++) {
            let hArms = hParent.GetAbilityByIndex(i);
            if (hArms && (hArms.ArmsActTime ?? 0) <= fGameTime) {
                // print("hArms",hArms.GetAbilityName())
                hArms._ArmsEffectStart();
            }
        }
    }
}