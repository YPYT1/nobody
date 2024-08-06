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
            this.InitCustomAbilityType();
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

    InitCustomAbilityType() {
        this.custom_ability_types = {
            skv_type: {
                Summon: false,
                Ring: false,
                Surround: false,
                Aoe: false,
                Bounce: false,
                Missile: false,
                Targeting: false,
                Dot: false,
                Orb: false,
                Resource: false,
                Growth: false,
                Buff: false,
            },
            element_type: [],
        };
        // this.PreLoadCustomAbilityType();
        // this.LoadCustomAbilityType()
    }

    // PreLoadCustomAbilityType() { }
    // /** 加载该技能的初始类型 */
    // LoadCustomAbilityType() { }

    SetCustomAbilityType(type_key: CustomHeroAbilityTypes, type_state: boolean) {
        if (type_key == 'Null') { return }
        if (this.custom_ability_types.skv_type[type_key] != type_state) {
            this.custom_ability_types.skv_type[type_key] = type_state;
            CustomNetTables.SetTableValue(
                "custom_ability_types",
                `${this.GetEntityIndex()}`,
                this.custom_ability_types
            );
        }
    }

    /** 增加元素 */
    AddCustomAbilityElement(element_key: ElementTypes, type_state: boolean = true) {
        let index = this.custom_ability_types.element_type.indexOf(element_key);
        if (index == -1 && type_state) {
            this.custom_ability_types.element_type.push(element_key);
            CustomNetTables.SetTableValue(
                "custom_ability_types",
                `${this.GetEntityIndex()}`,
                this.custom_ability_types
            );
        }
    }

}


export class BaseHeroModifier extends BaseModifier {

    caster: CDOTA_BaseNPC;
    team: DotaTeam;
    ability: BaseHeroAbility;
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
        this.ability = this.GetAbility() as BaseHeroAbility;
        this.ability_damage = 0;
        this.ability.IntrinsicMdf = this;
        this.tracking_proj_name = G_PorjTrack.none;
        this.SetStackCount(0)
        this.C_OnCreated();
        this.OnRefresh(params)
        this.StartIntervalThink(0.1)
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
        // print("this",this.tracking_proj_name)
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