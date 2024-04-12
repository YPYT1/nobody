// import { BaseAbility, BaseItem, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';

// @registerAbility()
// export class BaseArmsItem extends BaseAbility {

//     mdf_name: string;
//     arms_cd: number;
//     caster: CDOTA_BaseNPC;

//     // OverrideKyes
//     projectile_speed: number
//     bounce_count: number
//     projectile_count: number
//     aoe_radius: number
//     damage_interval_cut: number
//     cooldown_cut: number
//     summoned_duration: number
//     summoned_damage: number
//     buff_duration: number
//     debuff_duration: number
//     shield_amplify: number
//     health_amplify: number

//     _OnEquip() {
//         // print("_OnEquip")
//         this.caster = this.GetCaster();
//         this.arms_cd = this.GetSpecialValueFor("arms_cd");
//         if (this.arms_cd <= 0) { this.arms_cd = 1 }
//         this.ArmsActTime = GameRules.GetDOTATime(false, false) + 1;

//         this.OnEquip()
//     }

//     OnEquip(): void {

//     }

//     _OnUnequip() {
//         this._OnUnequip()
//     }

//     OnUnequip(): void {

//     }



//     GetIntrinsicModifierName(): string {
//         return this.mdf_name
//     }

//     _ArmsEffectStart(): void {
//         this.ArmsEffectStart_Before()
//         this.ArmsEffectStart()
//         this.ArmsEffectStart_After()
//     }

//     ArmsEffectStart(): void {

//     }

//     ArmsEffectStart_Before(): void {
//         this.ArmsActTime = GameRules.GetDOTATime(false, false) + this.arms_cd;
//     }

//     ArmsEffectStart_After(): void {

//     }
// }

// @registerModifier()
// export class BaseArmsModifier extends BaseModifier {

//     thisItem: CDOTA_Item;
//     parent: CDOTA_BaseNPC;
//     item_key: string;


//     GetAttributes(): ModifierAttribute {
//         return ModifierAttribute.MULTIPLE
//     }

//     ItemOnSpellStart() {

//     }

//     OnCreated(params: any): void {
//         if (!IsServer()) { return }
//         this.parent = this.GetParent();
//         this.item_key = "item_" + this.GetAbility().entindex();
//         this._CreatedBefore(params);
//         // this.thisItem = this.GetAbility() as CDOTA_Item;
//         // this.thisItem._OnEquip()
//         print("[BaseArmsModifier OnCreated]:", this.GetName(), this.item_key)
//         let item_attr = GameRules.CustomAttribute.GetItemAttribute(this.GetAbility().GetAbilityName());
//         GameRules.CustomAttribute.SetAttributeInKey(this.parent, this.item_key, item_attr)
//         this._CreatedAfter(params)
//     }

//     _CreatedBefore(params: any) {

//     }

//     _CreatedAfter(params: any) {

//     }

//     OnDestroy(): void {
//         if (!IsServer()) { return }
//         this.thisItem.OnEquip()
//         this._DestroyBefore()
//         GameRules.CustomAttribute.DelAttributeInKey(this.parent, this.item_key)
//         this._DestroyAfter();
//     }

//     _DestroyBefore() {

//     }

//     _DestroyAfter() {

//     }
// }