import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_picture_effect_8 extends BaseModifier {

    heal_pct: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.heal_pct = 0.01;
        this.parent = this.GetParent()
        this.OnRefresh(params)
        this.StartIntervalThink(1)
    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return }
        let max_heal_pct = params.max_heal_pct as number;
        this.heal_pct = max_heal_pct / this.GetDuration() * 0.01;
    }

    OnIntervalThink(): void {
        let heal_value = this.parent.GetMaxHealth() * this.heal_pct;
        GameRules.BasicRules.Heal(this.parent, heal_value)
    }
}