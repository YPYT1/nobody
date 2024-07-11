import { registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2b, modifier_drow_2b } from "./drow_2b";

/**
 * 双喷【范围型】《冰》（3/3）：
散射技能赋予冰元素效果，伤害变为冰元素伤害。
有25%/30%/40%概率再次释放一次。（不可套娃）
重创【增益型】（2/2）：散射对距离越近的单位造成伤害越高。最近判定25码。最高提高伤害100%/200%。"
痛击（3/3）：散射对被降低移速的敌人造成的伤害提高30%/60%/100%。"

 */
@registerAbility()
export class drow_2b_b extends drow_2b {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2b_b"
    }
}

@registerModifier()
export class modifier_drow_2b_b extends modifier_drow_2b {

}