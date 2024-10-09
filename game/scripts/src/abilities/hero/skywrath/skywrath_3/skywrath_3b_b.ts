import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_3b, skywrath_3b } from "./skywrath_3b";


@registerAbility()
export class skywrath_3b_b extends skywrath_3b {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_3b_b"
    }
}
@registerModifier()
export class modifier_skywrath_3b_b extends modifier_skywrath_3b {

}