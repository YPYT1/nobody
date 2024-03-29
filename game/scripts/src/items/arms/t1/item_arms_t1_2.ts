import { modifier_motion_surround } from "../../../modifier/modifier_motion";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsItem, BaseArmsModifier } from "../base_arms";

@registerAbility()
export class item_arms_t1_2 extends BaseArmsItem {

    mdf_name = "modifier_item_arms_t1_2";

    ArmsEffectStart(): void {

        GameRules.CustomAttribute.ModifyAttribute(this.caster, {
            "HealthPoints": {
                "Base": 1
            }
        })
    }
}

@registerModifier()
export class modifier_item_arms_t1_2 extends BaseArmsModifier { }



