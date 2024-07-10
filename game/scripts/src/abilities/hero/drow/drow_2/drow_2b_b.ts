import { registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2b, modifier_drow_2b } from "./drow_2b";

@registerAbility()
export class drow_2b_b extends drow_2b {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2b_b"
    }
}

@registerModifier()
export class modifier_drow_2b_b extends modifier_drow_2b {

}