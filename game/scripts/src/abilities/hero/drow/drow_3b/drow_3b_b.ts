import { StackModifier } from "../../../../modifier/extends/modifier_stack";
import { BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_3b, modifier_drow_3b, modifier_drow_3b_thinker, modifier_drow_3b_thinker_arrow } from "./drow_3b";


/**
 * 
37	集火	多支箭矢命中相同敌人时，会额外造成10%的伤害。上限5/7/10层。
38	急冻	箭雨技能赋予冰元素效果，伤害变为冰元素伤害。额外增加4/8支箭。
 */
@registerAbility()
export class drow_3b_b extends drow_3b {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_3b_b"
    }
}

@registerModifier()
export class modifier_drow_3b_b extends modifier_drow_3b {

    mdf_thinker = "modifier_drow_3b_b_thinker";
}

@registerModifier()
export class modifier_drow_3b_b_thinker extends modifier_drow_3b_thinker {

    limit_stack: number;
    bonus_dmg: number;
    talent_37: boolean;
    talent_38: boolean;
    // thinker_arrow = "modifier_drow_3b_b_thinker_arrow";

    OnCreated_Extends(): void {
        this.talent_37 = (this.GetCaster().hero_talent["37"] ?? 0) > 0;
        this.talent_38 = (this.GetCaster().hero_talent["38"] ?? 0) > 0;
        this.limit_stack = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.GetCaster(), "37", "limit_stack");
        // rune_46	游侠#21	箭雨【集火】最高可叠加层数增加10层
        if (this.caster.rune_level_index.hasOwnProperty("rune_46")) {
            this.limit_stack += GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_46', 'jihuo_stack')
        }
        this.bonus_dmg = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.GetCaster(), "37", "bonus_dmg");

        if (this.talent_38) {
            this.element_type = ElementTypes.ICE;
            this.arrow_thinker = "modifier_drow_3b_thinker_arrow_ice"
        }
    }

    DoDamageTarget(target: CDOTA_BaseNPC, ability_damage: number): void {
        target.SetContextThink(DoUniqueString("drow3_b_delay"), () => {
            let DamageBonusMul = 0
            if (this.talent_37) {
                // 集火
                let stack = target.GetModifierStackCount("modifier_drow_3b_b_stack", this.GetCaster());
                let buff_increase = this.ability.GetTypesAffixValue(stack, "Buff", "skv_buff_increase");
                // print("talent_37", buff_increase, this.bonus_dmg)
                DamageBonusMul += buff_increase * this.bonus_dmg
                target.AddNewModifier(this.caster, this.GetAbility(), "modifier_drow_3b_b_stack", {
                    duration: 2,
                    max_stack: this.limit_stack,
                })
            }
            ApplyCustomDamage({
                victim: target,
                attacker: this.GetCaster(),
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                element_type: this.element_type,
                ability: this.GetAbility(),
                is_primary: true,
                SelfAbilityMul: this.SelfAbilityMul,
                DamageBonusMul: this.DamageBonusMul + DamageBonusMul,

            });
            return null
        }, 0.3)
    }

}

@registerModifier()
export class modifier_drow_3b_b_stack extends StackModifier {

    IsHidden(): boolean {
        return true
    }
}