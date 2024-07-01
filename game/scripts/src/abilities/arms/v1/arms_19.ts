import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 加农炮	"给普通攻击增幅，增加500码攻击距离，快速发动8次的攻击，对攻击范围内至多3个敌人同时造成伤害。
cd：5秒
每次攻击力只会造成攻击力的50%火元素伤害"
毎5秒获得BUFF,X层,消耗完才进入冷却
附魔攻击
 */
@registerAbility()
export class arms_19 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_19 extends BaseArmsModifier {

    timer: number;
    act_time: number;


    C_OnCreated(params: any): void {
        this.ability.ArmsActTime = GameRules.GetDOTATime(false, false);
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) { return }
        
    }
}
@registerModifier()
export class modifier_arms_19_stack extends BaseModifier {

    OnCreated(params: object): void {

    }

    OnDestroy(): void {
        if (!IsServer()) { return }
    }
}