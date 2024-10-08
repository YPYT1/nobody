import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_2a, skywrath_2a } from "./skywrath_2a";


@registerAbility()
export class skywrath_2a_b extends skywrath_2a {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_2a_b"
    }
}
@registerModifier()
export class modifier_skywrath_2a_b extends modifier_skywrath_2a {

}