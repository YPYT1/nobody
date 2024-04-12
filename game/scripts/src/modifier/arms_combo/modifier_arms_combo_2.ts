import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import { ArmsComboModifier } from "./arms_combo";

/** 
 * 【野狼disco】：1000码内的友军皆享受【头狼】和【群狼】的收益。
*/
@registerModifier()
export class modifier_arms_combo_2 extends ArmsComboModifier {

    combo_id: number = 2;
}