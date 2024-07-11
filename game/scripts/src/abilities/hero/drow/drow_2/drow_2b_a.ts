import { registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2b, modifier_drow_2b } from "./drow_2b";

/**
 * 火力覆盖【范围型】《火》（3/3）：
散射技能赋予火元素效果，伤害变为火元素伤害。伤害提高 60%/90%/120%
1.1.节减（2/2）：散射技能蓝耗下降5/10点
1.2.压制（3/3）：对生命值高于50%的单位造成伤害提升 30%/60%/100%

攻击力 + 加成 = 伤害 
 */
@registerAbility()
export class drow_2b_a extends drow_2b {

    heighest_mul:number;
    
    GetIntrinsicModifierName(): string {
        return "modifier_drow_2b_a"
    }

    GetManaCost(level: number): number {
        return super.GetManaCost(level) - 5
    }

    
    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            if(target.GetHealthPercent() > 50){
                ability_damage *= 1.3
            }

            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.fire,
                is_primary: true,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_drow_2b_a extends modifier_drow_2b {

    PlayEffect(params: PlayEffectProps): void {
        this.ability_damage = this.caster.GetAverageTrueAttackDamage(null) * 2.4
        let vTarget = params.hTarget.GetAbsOrigin()
        this.MultiShot(vTarget);
    }
}