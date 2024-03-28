import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

@registerAbility()
export class BaseArmsItem extends BaseAbility {

    mdf_name: string;

    GetIntrinsicModifierName(): string {
        return this.mdf_name
    }
}

@registerModifier()
export class BaseArmsModifier extends BaseModifier {

    parent: CDOTA_BaseNPC;
    item_key: string;

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
        print("[BaseArmsModifier OnDestroy]:", this.GetName(), this.item_key)
        GameRules.CustomAttribute.DelAttributeInKey(this.parent, this.item_key)
    }

    _DestroyBefore(params: any) {

    }

    _DestroyAfter(params: any) {

    }
}