import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 修仙-炼气期	"在原地不动处于未被攻击的状态持续10秒会进入炼气期闭关状态，期间移动则出关。
闭关状态每2秒获得1点HP上限 1点MP上限 1点攻击力 1点灵魂
该技能过180将会自动升级为【修仙-筑基期】"

 */
@registerAbility()
export class arms_12 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_12 extends BaseArmsModifier {

    skv_grow_value: number;
    status: boolean;

    timer: number;
    act_time: number;
    upgrade_time: number;
    biguan_timer: number;

    last_vect: Vector;

    IsHidden(): boolean {
        return false
    }

    C_UpdateKeyvalue(): void {
        this.skv_grow_value = this.ability.GetSpecialValueFor("skv_grow_value")
    }

    C_OnCreated(params: any): void {
        this.status = false;
        this.timer = 0;
        this.biguan_timer = 0;
        this.act_time = this.ability.GetSpecialValueFor("act_time");
        this.upgrade_time = this.ability.GetSpecialValueFor("upgrade_time");
        this.last_vect = this.caster.GetAbsOrigin();
        // const fix_interval = this.ability.GetSpecialValueFor("fix_interval")
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let vOrigin = this.caster.GetAbsOrigin();
        if (vOrigin == this.last_vect) { return };
        this.last_vect = vOrigin;
        this.timer += 1;

        if (this.timer > this.act_time) {
            this.biguan_timer += 1;
            this.SetStackCount(this.biguan_timer);
            // 获得闭关收益

            GameRules.CustomAttribute.ModifyAttribute(this.caster, {
                "HealthPoints": {
                    "Base": this.skv_grow_value
                },
                "ManaPoints": {
                    "Base": this.skv_grow_value
                },
                "AttackDamage": {
                    "Base": this.skv_grow_value
                }
            })

            GameRules.ResourceSystem.ModifyResource(this.player_id, {
                "Soul": this.skv_grow_value
            })

            if (this.biguan_timer >= this.upgrade_time) {
                this.StartIntervalThink(-1)
                // 该技能进行升级
            }
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ]
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        this.timer = 0;
        return 0
    }

}