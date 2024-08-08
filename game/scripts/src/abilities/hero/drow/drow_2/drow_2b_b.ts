import { registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2b, modifier_drow_2b } from "./drow_2b";

/**
 * 双喷【范围型】《冰》（3/3）：
散射技能赋予冰元素效果，伤害变为冰元素伤害。有25%/30%/40%概率再次释放一次。（不可套娃）
23.重创【增益型】（2/2）：散射对距离越近的单位造成伤害越高。最近判定25码。最高提高伤害100%/200%。"
24.痛击（3/3）：散射对被降低移速的敌人造成的伤害提高30%/60%/100%。"

 */
@registerAbility()
export class drow_2b_b extends drow_2b {

    tj_value: number;

    closest_distance: number;
    zc_value: number;

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2b_b"
    }

    UpdataSpecialValue(): void {
        this.closest_distance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "23", "closest_distance");
        this.zc_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "23", "bonus_value");
        this.tj_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "24", "bonus_value");
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            let bp_ingame = extraData.bp_ingame;
            let bp_server = extraData.bp_server;
            if (this.zc_value > 0) {
                let vOrigin = Vector(extraData.x, extraData.y, 0);
                let vTarget = target.GetAbsOrigin();
                let distance = math.max(this.closest_distance, (vOrigin - vTarget as Vector).Length2D());
                // 散射对距离越近的单位造成伤害越高。最近25码
                let dmg_bonus = (1 - (distance - this.closest_distance) / 1000) * this.zc_value;
                bp_ingame += dmg_bonus
            }
            if (this.tj_value > 0 && UnitIsSlowed(target)) {
                bp_ingame += this.tj_value

            }
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.ICE,
                is_primary: true,
                bp_ingame: bp_ingame,
                bp_server: bp_server,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_drow_2b_b extends modifier_drow_2b {

    sp_chance: number;

    UpdataSpecialValue(): void {
        this.proj_name = G_PorjLinear.ice
        this.sp_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "22", "chance");
    }

    PlayEffect(params: PlayEffectProps): void {
        this.ability_damage = this.caster.GetAverageTrueAttackDamage(null) * this.base_value * 0.01
        let vTarget = params.hTarget.GetAbsOrigin()
        this.MultiShot(vTarget);
        if (RollPercentage(this.sp_chance)) {
            this.caster.SetContextThink(DoUniqueString("sp_chance"), () => {
                this.MultiShot(vTarget);
                return null
            }, 0.15)
        }
    }
}