import { BaseAbility, BaseModifier } from "../../utils/dota_ts_adapter";

export class BaseHeroAbility extends BaseAbility {


}


export class BaseHeroModifier extends BaseModifier {

    caster: CDOTA_BaseNPC;
    team: DotaTeam;
    ability: CDOTABaseAbility;
    mana_cost: number;
    attack_range: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.team = this.caster.GetTeamNumber();
        this.ability = this.GetAbility();
        this.mana_cost = this.ability.GetManaCost(0)
        this.attack_range = 750;
        this.UpdateSpecialValue();
        this.OnIntervalThink()
        this.StartIntervalThink(0.03)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.UpdateSpecialValue();
    }

    UpdateSpecialValue() { }

    OnIntervalThink(): void {

    }

    PlayEffect(params: PlayEffectProps) { }
}