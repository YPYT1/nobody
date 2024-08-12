import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
 * 攻击变为%aoe_radius%码范围伤害，伤害提高%bonus_value%%%，伤害变为火元素伤害。
 * 爆炸分支
3	浓缩	爆炸箭有%mul_chance%%%概率%mul_value%倍伤害
4	碎裂	爆炸箭范围提高%skv_aoe_radius%码，灼烧伤害提高%burn_dmg%%%。
 */
@registerAbility()
export class drow_1a extends drow_1 {

    mul_chance: number;
    mul_value: number;

    aoe_radius: number;
    bonus_value: number;

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1a"
    }

    UpdataSpecialValue(): void {
        this.bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "2", "bonus_value");
        this.mul_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "3", "mul_chance");
        this.mul_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "3", "mul_value");

        if (this.caster.rune_passive_type["rune_27"]) {
            this.mul_chance = GameRules.RuneSystem.GetKvOfUnit(this.caster, "rune_27", 'mul_chance')
            this.mul_value = GameRules.RuneSystem.GetKvOfUnit(this.caster, "rune_27", 'mul_value')
        }

        let aoe_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "2", "skv_aoe_radius")
            + GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "4", "skv_aoe_radius");
        this.aoe_radius = this.GetTypesAffixValue(aoe_radius, "Aoe", "skv_aoe_radius")
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let aoe_damage = this.caster.GetAverageTrueAttackDamage(null);
            let bp_ingame = this.bonus_value;
            let bp_server = 0;
            let vPos = target.GetAbsOrigin();
            this.PlayEffectAoe(vPos, aoe_damage, bp_ingame, bp_server);

            let aoe_multiple = this.GetTypesAffixValue(1, "Aoe", "skv_aoe_chance") - 1;
            // print("aoe_multiple",aoe_multiple)
            if (RollPercentage(aoe_multiple)) {
                let vPos2 = Vector(
                    vPos.x + RandomInt(-this.aoe_radius, this.aoe_radius),
                    vPos.y + RandomInt(-this.aoe_radius, this.aoe_radius),
                    vPos.z
                );
                this.PlayEffectAoe(vPos2, aoe_damage, bp_ingame, bp_server, true);
            }
        }
    }

    PlayEffectAoe(vPos: Vector, aoe_damage: number, bp_ingame: number, bp_server: number, second: boolean = false,) {
        if (RollPercentage(this.mul_chance)) {
            aoe_damage *= this.mul_value
        }
        let has_pojun = false;

        let enemies = FindUnitsInRadius(
            this.team,
            vPos,
            null,
            this.aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: aoe_damage,
                damage_type: DamageTypes.MAGICAL,
                element_type: ElementTypes.FIRE,
                ability: this,
                is_primary: true,
                bp_ingame: bp_ingame,
                bp_server: bp_server,
                // bonus_percent: bonus_percent,
            })
        }

        let cast_fx = ParticleManager.CreateParticle(
            "particles/dev/hero/drow/drow_1/explosion_arrow.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(cast_fx, 0, vPos);
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.aoe_radius, 1, 1));
        ParticleManager.ReleaseParticleIndex(cast_fx);
    }
}

@registerModifier()
export class modifier_drow_1a extends modifier_drow_1 {

    UpdataSpecialValue(): void {
        this.tracking_proj_name = G_PorjTrack.fire;

    }

}