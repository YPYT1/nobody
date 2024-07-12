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


    ability_damage: number;

    branch_declare: modifierfunction[];

    /** 天赋分支 */
    talent_branch: number;
    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        this.branch_declare = [];
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.team = this.caster.GetTeamNumber();
        this.ability = this.GetAbility();
        this.talent_branch = 0;
        this.ability_damage = 0;
        this.ability.IntrinsicMdf = this;
        this.SetStackCount(0)
        this.C_OnCreated();
        this.OnRefresh(params)
        this.StartIntervalThink(0.03)
    }

    C_OnCreated(): void {

    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        // print("OnRefresh")
        this.MdfUpdataAbilityValue();
        this.MdfUpdataAbilityValue_Extends();
        this.MdfUpdataSpecialValue();
    }

    /** 技能的Ability更新 */
    MdfUpdataAbilityValue() { }
    MdfUpdataAbilityValue_Extends() { }
    /** 技能的特殊词条更新 */
    MdfUpdataSpecialValue() { }

    OnIntervalThink(): void { }

    PlayEffect(params: PlayEffectProps) { }
}