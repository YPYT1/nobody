import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_2b, skywrath_2b } from "./skywrath_2b";


@registerAbility()
export class skywrath_2b_a extends skywrath_2b {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_2b_a"
    }
}
@registerModifier()
export class modifier_skywrath_2b_a extends modifier_skywrath_2b {

}