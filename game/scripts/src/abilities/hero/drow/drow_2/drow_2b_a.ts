import { registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2b, modifier_drow_2b } from "./drow_2b";

/**
 * 火力覆盖【范围型】《火》（3/3）：
散射技能赋予火元素效果，伤害变为火元素伤害。伤害提高60%/90%/120%
1.1.节减（2/2）：散射技能蓝耗下降5/10点
1.2.压制（3/3）：对生命值高于50%的单位造成伤害提升30%/60%/100%
 */
@registerAbility()
export class drow_2b_a extends drow_2b {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2b_a"
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
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