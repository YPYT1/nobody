import { BaseAbility, BaseItem, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';

@registerAbility()
export class BaseArmsItem extends BaseAbility {

    mdf_name: string;
    arms_cd: number;
    caster: CDOTA_BaseNPC;
    dmg_formula: string;


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
        this.caster = this.GetCaster();
        this.arms_cd = this.GetSpecialValueFor("arms_cd");
        if (this.arms_cd <= 0) { this.arms_cd = 1 }
        this.ArmsActTime = GameRules.GetDOTATime(false, false) + 1;
        this.UpdateDamageFormula()
    }

    UpdateDamageFormula() {
        let KeyValues = this.GetAbilityKeyValues() as any;
        this.dmg_formula = KeyValues.DamageFormula;
    }

    RemoveEffects(flags: EntityEffects): void {
        print("Ability RemoveEffects", flags, this.GetAbilityName())
    }

    RemoveSelf(): void {
        print("Ability RemoveSelf", this.GetAbilityName())
    }

    GetIntrinsicModifierName(): string {
        return this.mdf_name
    }

    _ArmsEffectStart(): void {
        this.ArmsEffectStart_Before()
        this.ArmsEffectStart()
        this.ArmsEffectStart_After()
    }

    ArmsEffectStart_Before(): void {
        this.ArmsActTime = GameRules.GetDOTATime(false, false) + (this.arms_cd ?? 1);
    }

    ArmsEffectStart(): void { }
    ArmsEffectStart_After(): void { }

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
        let item_attr = GameRules.CustomAttribute.GetItemAttribute(this.GetAbility().GetAbilityName());
        GameRules.CustomAttribute.SetAttributeInKey(this.parent, this.item_key, item_attr)
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