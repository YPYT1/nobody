import { BaseAbility, BaseModifier } from "../../utils/dota_ts_adapter";

export class BaseHeroAbility extends BaseAbility {

    init: boolean;
    caster: CDOTA_BaseNPC;
    team: DotaTeam;

    OnUpgrade(): void {
        if (this.init != true) {
            this.init = true;
            this.caster = this.GetCaster();
            this.team = this.caster.GetTeamNumber();
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

    tracking_proj_name: string = "";

    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.element_type = ElementTypes.NONE;
        this.damage_type = DamageTypes.PHYSICAL
        this.team = this.caster.GetTeamNumber();
        this.ability = this.GetAbility();
        this.ability_damage = 0;
        this.ability.IntrinsicMdf = this;
        this.tracking_proj_name = this.caster.GetRangedProjectileName()
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
        this.UpdataAbilityValue();
        this.UpdataSpecialValue();
    }

    /** 技能的Ability更新 */
    UpdataAbilityValue() { }
    /** 技能的特殊词条更新 */
    UpdataSpecialValue() { }

    OnIntervalThink(): void { }

    PlayEffect(params: PlayEffectProps) { }

    PlayPerformAttack(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC, ability_damage: number, fakeAttack: boolean = false) {
        if (fakeAttack) { return }
        ProjectileManager.CreateTrackingProjectile({
            Source: hCaster,
            Target: hTarget,
            Ability: this.GetAbility(),
            EffectName: this.tracking_proj_name,
            iSourceAttachment: ProjectileAttachment.HITLOCATION,
            vSourceLoc: hCaster.GetAbsOrigin(),
            iMoveSpeed: hCaster.GetProjectileSpeed(),
            ExtraData: {
                a: ability_damage,
                et: this.element_type,
                dt: this.damage_type,
            }
        })
    }
}