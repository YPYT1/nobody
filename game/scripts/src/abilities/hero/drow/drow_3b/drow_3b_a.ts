import { registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_3b, modifier_drow_3b, modifier_drow_3b_thinker } from "./drow_3b";


/**
 *
 *  35	燃矢	"箭雨技能赋予火元素效果，伤害变为火元素伤害。（2级触发灼烧伤害持续时间延长2秒，伤害增加攻击力25%。）
 * 36	焚身	箭雨对被灼烧的敌人造成伤害提高%extra_dmg_pct%%%
 */
@registerAbility()
export class drow_3b_a extends drow_3b {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_3b_a"
    }
}

@registerModifier()
export class modifier_drow_3b_a extends modifier_drow_3b {

    mdf_thinker = "modifier_drow_3b_a_thinker";
}

@registerModifier()
export class modifier_drow_3b_a_thinker extends modifier_drow_3b_thinker {

    extra_dmg_pct: number;

    OnCreated_Extends(): void {
        this.element_type = ElementTypes.FIRE;
        this.extra_dmg_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.GetCaster(), "drow_ranger", "36", "extra_dmg_pct")
    }

    DoDamageTarget(target: CDOTA_BaseNPC, ability_damage: number): void {
        target.SetContextThink(DoUniqueString("drow3_b_delay"), () => {
            if (this.extra_dmg_pct > 0 && target.HasModifier("modifier_element_effect_fire")) {
                ability_damage *= (1 + this.extra_dmg_pct * 0.01)
            }
            ApplyCustomDamage({
                victim: target,
                attacker: this.GetCaster(),
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                element_type: this.element_type,
                ability: this.GetAbility(),
                is_primary: true,
            });
            return null
        }, 0.3)
    }
}