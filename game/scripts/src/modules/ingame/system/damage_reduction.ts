
import { reloadable } from "../../../utils/tstl-utils";

/**
 * 伤害减免计算
 */
@reloadable
export class DamageReduction {

    /**
    * [设置]一个减伤/增伤乘区
    * @param hUnit 
    * @param key 索引key
    * @param value 值,正数为减伤,负数为增伤
    * @param timer 持续时间.默认永久
    */
    AddCustomReductionPct(hUnit: CDOTA_BaseNPC, key: string, value: number, timer: number = -1) {
        key = "reduction_" + key;
        if (hUnit.ReductionPct == null) { hUnit.ReductionPct = {}; }
        hUnit.ReductionPct[key] = value;
        if (timer > 0) {
            hUnit.SetContextThink(key, () => {
                this.DelCustomReductionPct(hUnit, key);
                return null;
            }, timer);
        }
        this.MathCustomReductionPct(hUnit);
    }

    DelCustomReductionPct(hUnit: CDOTA_BaseNPC, key: string) {
        if (hUnit == null || hUnit.ReductionPct == null) { return; }
        key = "reduction_" + key;
        if (hUnit.ReductionPct.hasOwnProperty(key)) {
            delete hUnit.ReductionPct[key];
        }
        this.MathCustomReductionPct(hUnit);
    }

    MathCustomReductionPct(hUnit: CDOTA_BaseNPC) {
        hUnit.SetContextThink("MathCustomReductionPct", () => {
            let base_value = 1;
            for (let key in hUnit.ReductionPct) {
                let value = hUnit.ReductionPct[key];
                base_value = base_value * math.abs(1 - value * 0.01);
            }
            hUnit.ReductionResult = base_value;
            return null;
        }, 0.03);
    }

    /** 受到伤害时 */
    GetTotalReductionPct(event: ModifierAttackEvent) {
        return 0
    }

    /** 获取该目标的最终伤害减免 */
    GetReductionPercent(hUnit: CDOTA_BaseNPC) {
        return 0
    }
}