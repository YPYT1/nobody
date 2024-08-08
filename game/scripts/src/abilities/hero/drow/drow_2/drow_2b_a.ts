import { registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2b, modifier_drow_2b } from "./drow_2b";

/**
 * 火力覆盖【范围型】《火》（3/3）：
散射技能赋予火元素效果，伤害变为火元素伤害。伤害提高 60%/90%/120%
20.节减（2/2）：散射技能蓝耗下降5/10点
21.压制（3/3）：对生命值高于50%的单位造成伤害提升 30%/60%/100%

攻击力 + 加成 = 伤害 
 */
@registerAbility()
export class drow_2b_a extends drow_2b {

    heighest_mul: number;

    yazhi_value: number;
    yazhi_hp_heighest: number;

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2b_a"
    }

    GetManaCost(level: number): number {
        let player_id = this.GetCaster().GetPlayerOwnerID();
        let nettable = CustomNetTables.GetTableValue("hero_talent", `${player_id}`);
        if (nettable && nettable["20"].uc) {
            let cost = nettable["20"].uc * 5;
            return super.GetManaCost(level) - cost;
        }
        return super.GetManaCost(level)
    }

    UpdataSpecialValue(): void {
        this.yazhi_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "21", "bonus_value");
        this.yazhi_hp_heighest = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "21", "hp_heighest");
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            let bp_ingame = extraData.bp_ingame;
            let bp_server = extraData.bp_server;
            if (this.yazhi_value > 0 && target.GetHealthPercent() > this.yazhi_hp_heighest) {
                bp_ingame += this.yazhi_value
            }
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.FIRE,
                is_primary: true,
                bp_ingame: bp_ingame,
                bp_server: bp_server,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_drow_2b_a extends modifier_drow_2b {

    UpdataSpecialValue(): void {
        this.bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "19", "bonus_value");
        this.proj_name = G_PorjLinear.fire
    }

    PlayEffect(params: PlayEffectProps): void {
        let vTarget = params.hTarget.GetAbsOrigin()
        this.MultiShot(vTarget);
    }
}