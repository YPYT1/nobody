import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_1, skywrath_1 } from "./skywrath_1";


@registerAbility()
export class skywrath_1b extends skywrath_1 {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_1b"
    }
}
@registerModifier()
export class modifier_skywrath_1b extends modifier_skywrath_1 {

}