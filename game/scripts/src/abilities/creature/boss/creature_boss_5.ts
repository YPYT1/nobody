import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_5	退	被动，部分技能释放结束后,.会直接击退自身直径范围内300码的玩家，造成高额伤害。
 * 该技能只会出现在特定技能结束后（伤害为玩家最大生命值25%）
 */
@registerAbility()
export class creature_boss_5 extends BaseCreatureAbility {

}