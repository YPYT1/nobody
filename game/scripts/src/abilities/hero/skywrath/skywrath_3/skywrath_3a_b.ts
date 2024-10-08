import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_3a, skywrath_3a } from "./skywrath_3a";


@registerAbility()
export class skywrath_3a_b extends skywrath_3a {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_3a_b"
    }
}
@registerModifier()
export class modifier_skywrath_3a_b extends modifier_skywrath_3a {

}