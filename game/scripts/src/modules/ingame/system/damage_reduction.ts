
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
     * @param value2 值,正数为减伤必须为正数 第二层减伤 最终伤害先乘以第一层减伤 逐步下去(解决减伤过低 变为0问题)  
     * @param value3 值,正数为减伤必须为正数 第三层减伤 不运用于增伤
     */
     AddCustomReductionPct(hUnit: CDOTA_BaseNPC, key: string, value: number, timer: number = -1 , value2: number = 0, value3: number = 0) {
        key = "reduction_" + key;
        if (hUnit.ReductionPct == null) { hUnit.ReductionPct = {}; }
        hUnit.ReductionPct[key] = value;
        if(value2 > 0){
            hUnit.ReductionPct2[key] = value2;
        }
        if(value3 > 0){
            hUnit.ReductionPct3[key] = value3;
        }
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
            let base_value2 = 1;
            for (let key in hUnit.ReductionPct2) {
                let value = hUnit.ReductionPct2[key];
                base_value2 = base_value2 * math.abs(1 - value * 0.01);
            }
            let base_value3 = 1;
            for (let key in hUnit.ReductionPct3) {
                let value = hUnit.ReductionPct3[key];
                base_value3 = base_value3 * math.abs(1 - value * 0.01);
            }
            hUnit.ReductionResult = base_value;
            hUnit.ReductionResult2 = base_value2;
            hUnit.ReductionResult3 = base_value3;
            return null;
        }, 0.03);
    }
    
    /** 受到伤害时 */
    GetTotalReductionPct(event: ModifierAttackEvent) {
        return 0
    }
}