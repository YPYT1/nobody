import { BaseAbility, BaseItem, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';

@registerAbility()
export class BaseArmsAbility extends BaseAbility {

    mdf_name: string;
    arms_cd: number;
    caster: CDOTA_BaseNPC;
    dmg_formula: string;
    player_id: PlayerID;
    ability_damage: number;

    // OverrideKyes
    projectile_speed: number
    bounce_count: number
    projectile_count: number
    aoe_radius: number
    damage_interval_cut: number
    cooldown_cut: number
    summoned_duration: number
    summoned_damage: number
    buff_duration: number
    debuff_duration: number
    shield_amplify: number
    health_amplify: number

    OnUpgrade() {
        this.element_type = 0;
        this.dmg_formula = "0";
        this.caster = this.GetCaster();
        this.player_id = this.caster.GetPlayerOwnerID();
        this.arms_cd = this.GetSpecialValueFor("arms_cd");
        if (this.arms_cd <= 0) { this.arms_cd = 1 }
        this.ArmsActTime = GameRules.GetDOTATime(false, false) + 1;
        this.UpdateDamageFormula()
        this._OnUpdateKeyValue()
    }

    UpdateDamageFormula() {
        let KeyValues = this.GetAbilityKeyValues() as any;
        if (KeyValues.DamageFormula) { this.dmg_formula = KeyValues.DamageFormula; }
        if (KeyValues.element_type) { this.element_type = tonumber(KeyValues.element_type) }

    }

    _OnUpdateKeyValue() { }

    RemoveSelf(): void {
        print("Ability RemoveSelf", this.GetAbilityName())
        const public_arms = this.caster.FindAbilityByName("public_arms") as public_arms;
        public_arms.AffectedRemove(this);
        public_arms.ArmsRemove(this);
        this._RemoveSelf();
    }

    _RemoveSelf() {

    }

    GetIntrinsicModifierName(): string {
        return this.mdf_name
    }

    _ArmsEffectStart(): void {
        this.ArmsEffectStart_Before()
        this.ArmsEffectStart()
        this.ArmsEffectStart_After()
    }

    ArmsEffectStart() { }
    ArmsEffectStart_Before() { this.ArmsActTime = GameRules.GetDOTATime(false, false) + this.arms_cd; }
    ArmsEffectStart_After() { }

    _AffectedEffectStart(event: ModifierAttackEvent) {
        this.AffectedEffectStart_Before()
        this.AffectedEffectStart(event)
        this.AffectedEffectStart_After()
    }

    AffectedEffectStart(event: ModifierAttackEvent) { }
    AffectedEffectStart_Before() { this.ArmsActTime = GameRules.GetDOTATime(false, false) + this.arms_cd; }
    AffectedEffectStart_After() { }


    /** 火力技注册 */
    ArmsAdd() {
        const public_arms = this.caster.FindAbilityByName("public_arms") as public_arms;
        public_arms.ArmsInsert(this)
    }

    /** 受击技注册 */
    AffectedAdd() {
        const public_arms = this.caster.FindAbilityByName("public_arms") as public_arms;
        public_arms.AffectedInsert(this)
    }

    GetAbilityDamage() {
        if (this.dmg_formula == null) {
            return 0;
        } else if (type(this.dmg_formula) == "number") {
            return tonumber(this.dmg_formula);
        }
        let tableData: { [name: string]: number; } = {};
        // 英雄等级
        tableData = this.caster.custom_attribute_value;
        tableData["Hlv"] = this.caster.GetLevel();
        let res_number = eval(this.dmg_formula, tableData) ?? 0;
        return res_number;
    }
}

@registerModifier()
export class BaseArmsModifier extends BaseModifier {

    thisItem: CDOTA_Item;
    parent: CDOTA_BaseNPC;
    item_key: string;

    IsHidden(): boolean {
        return true
    }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE
    }

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.item_key = "item_" + this.GetAbility().entindex();
        this._CreatedBefore(params);
        print("[BaseArmsModifier OnCreated]:", this.GetName(), this.item_key)
        let ability_attr = GameRules.CustomAttribute.GetAbilityAttribute(this.GetAbility().GetAbilityName());
        GameRules.CustomAttribute.SetAttributeInKey(this.parent, this.item_key, ability_attr)
        this._CreatedAfter(params)
    }

    _CreatedBefore(params: any) {

    }

    _CreatedAfter(params: any) {

    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        this._DestroyBefore()
        GameRules.CustomAttribute.DelAttributeInKey(this.parent, this.item_key)
        this._DestroyAfter();
    }

    _DestroyBefore() {

    }

    _DestroyAfter() {

    }
}


// 属性
@registerAbility()
export class public_arms extends BaseAbility {

    ArmsList: CDOTABaseAbility[];
    AffectedList: CDOTABaseAbility[];

    GetIntrinsicModifierName(): string {
        return "modifier_public_arms"
    }

    OnUpgrade(): void {
        if (this.ArmsList == null) { this.ArmsList = [] }
        if (this.AffectedList == null) { this.AffectedList = [] }
    }

    ArmsInsert(hAbility: CDOTABaseAbility) {
        let iIndex = this.ArmsList.indexOf(hAbility);
        if (iIndex == -1) { this.ArmsList.push(hAbility) }

    }

    ArmsRemove(hAbility: CDOTABaseAbility) {
        let iIndex = this.ArmsList.indexOf(hAbility);
        if (iIndex != -1) { this.ArmsList.splice(iIndex, 1); }
    }

    AffectedInsert(hAbility: CDOTABaseAbility) {
        let iIndex = this.AffectedList.indexOf(hAbility);
        if (iIndex == -1) { this.AffectedList.push(hAbility) }
    }

    AffectedRemove(hAbility: CDOTABaseAbility) {
        let iIndex = this.AffectedList.indexOf(hAbility);
        if (iIndex != -1) { this.AffectedList.splice(iIndex, 1); }
    }

}

@registerModifier()
export class modifier_public_arms extends BaseModifier {

    timer: number;
    hAbility: public_arms;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.hAbility = this.GetAbility() as public_arms;
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
        for (let hArmsAbility of this.hAbility.ArmsList) {
            if ((hArmsAbility.ArmsActTime ?? 0) <= fGameTime) {
                hArmsAbility._ArmsEffectStart()
            }
        }
        // for (let i = 0; i < 6; i++) {
        //     let hArms = hParent.GetAbilityByIndex(i);
        //     if (hArms && hArms.GetClassname() == "ability_lua" && ) {
        //         // print("hArms",hArms.GetAbilityName())
        //         hArms._ArmsEffectStart();
        //     }
        // }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ]
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        let fGameTime = GameRules.GetDOTATime(false, false);
        for (let hAffectedAbility of this.hAbility.AffectedList) {
            if ((hAffectedAbility.ArmsActTime ?? 0) <= fGameTime) {
                hAffectedAbility._AffectedEffectStart(event)
            }
        }
        return 0
    }
}