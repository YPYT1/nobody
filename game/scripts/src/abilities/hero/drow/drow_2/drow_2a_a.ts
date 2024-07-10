import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2a, modifier_drow_2a } from "./drow_2a";

/**
 * 
1.连发（1/3）：连续射击的弓箭数量增加2/4/6支
1.1.击破（1/3）.连续射击的每支箭都会使目标收到的伤害增加2%/3%/5%，持续3秒，最高10层效果。
1.2.风箭《风》（1/2）：技能赋予风元素效果，伤害变为风元素伤害。
（2/2）：风元素伤害增加15%。
 */
@registerAbility()
export class drow_2a_a extends drow_2a {

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                is_primary: true,
                element_type: ElementTypeEnum.wind
            })
            target.AddNewModifier(this.caster, this, "modifier_drow_2a_a_debuff", {
                duration: 3
            })
            return true
        }
    }

}

@registerModifier()
export class modifier_drow_2a_a extends modifier_drow_2a {

    extra_lianfa: number;

    UpdateSpecialValue() {
        this.damage_mul = 130;
        this.skv_count = 10;
        this.attack_range = 750;
        this.mana_cost = this.ability.GetManaCost(0)
    }
}

@registerModifier()
export class modifier_drow_2a_a_debuff extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.SetStackCount(1)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        if (this.GetStackCount() < 10) {
            this.IncrementStackCount()
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ]
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        return this.GetStackCount() * 5
    }
}