import { BaseAbility, BaseModifier } from "../../utils/dota_ts_adapter";

export class BaseHeroAbility extends BaseAbility {

    init: boolean;
    caster: CDOTA_BaseNPC;

    OnUpgrade(): void {
        if (this.init != true) {
            this.init = true;
            this.caster = this.GetCaster();
        }
        this.UpdataOnUpgrade();
        this.UpdataAbilityValue()
        this.UpdataSpecialValue()
    }

    /** 技能升级更新 */
    UpdataOnUpgrade() { }
    /** 技能的Ability更新 */
    UpdataAbilityValue() { }
    /** 技能的特殊词条更新 */
    UpdataSpecialValue() { }

}


export class BaseHeroModifier extends BaseModifier {

    caster: CDOTA_BaseNPC;
    team: DotaTeam;
    ability: CDOTABaseAbility;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.team = this.caster.GetTeamNumber();
        this.ability = this.GetAbility();
        this.MdfUpdataAbilityValue();
        this.MdfUpdataAbilityValue_Extends();

        this.MdfUpdataSpecialValue();

        this.StartIntervalThink(0.03)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.MdfUpdataAbilityValue();
        this.MdfUpdataAbilityValue_Extends();
        this.MdfUpdataSpecialValue();
    }

    /** 技能的Ability更新 */
    MdfUpdataAbilityValue() { }
    MdfUpdataAbilityValue_Extends() { }
    /** 技能的特殊词条更新 */
    MdfUpdataSpecialValue() { }

    OnIntervalThink(): void {}

    PlayEffect(params: PlayEffectProps) { }
}