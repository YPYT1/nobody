import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 爆栗出击	"攻击时有25%概率发射一枚橡栗，
在直径350范围内的敌方单位之间跳跃弹射。
弹射次数：4
伤害系数：弹射伤害攻击力20%·风元素伤害"

 */
@registerAbility()
export class arms_13 extends BaseArmsAbility {

    skv_orb_chance: number;
    skv_bounce_count: number;
    bounce_speed: number;

    Precache(context: CScriptPrecacheContext): void {
        PrecacheUnitByNameSync("npc_dota_hero_hoodwink", context);
    }

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnAttackStart"])
    }

    UpdataCustomKeyValue(): void {
        this.skv_orb_chance = this.GetSpecialValueFor("skv_orb_chance");
        this.skv_bounce_count = this.GetSpecialValueFor("skv_bounce_count")
        this.bounce_speed = this.GetSpecialValueFor("bounce_speed")
    }

    OnAttackStart(hTarget: CDOTA_BaseNPC): void {
        print("arms_13 OnAttackStart")
        if (RollPercentage(this.skv_orb_chance)) {

            CreateModifierThinker(
                this.caster,
                this,
                "modifier_arms_13_shot_thinker",
                {
                    iStartTarget: hTarget.entindex(),
                    bounce_count: this.skv_bounce_count,
                    bounce_speed: this.bounce_speed
                },
                this.caster.GetOrigin(),
                this.caster.GetTeamNumber(),
                false
            );
        }
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: any): boolean | void {
        let thinker = EntIndexToHScript(extraData.thinker) as CDOTA_BaseNPC;
        if (!thinker) { return; }
        let thinker_buff = thinker.FindModifierByName("modifier_arms_13_shot_thinker") as modifier_arms_13_shot_thinker;
        if (!thinker_buff) { return; }
        if (target) {
            // 造成伤害
            thinker_buff.ApplyCustomDamage(target);
            EmitSoundOn("Hero_Hoodwink.AcornShot.Target", target);
        }

        // thinker.SetOrigin(location);
        thinker_buff.ToNextProjectileHit(target);
    }
}

@registerModifier()
export class modifier_arms_13 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_13_shot_thinker extends BaseModifier {

    bounce_count: number;
    bounce_speed: number;
    ability_damage: number;
    /** 发射源 */
    hSource: CDOTA_BaseNPC;
    /** 目标源 */
    hTarget: CDOTA_BaseNPC;
    hLastUnit: CDOTA_BaseNPC;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.bounce_count = params.bounce_count ?? 4;
        this.bounce_speed = 1000;
        this.ability_damage = this.GetAbility().GetAbilityDamage();
        this.hLastUnit = EntIndexToHScript(params.iStartTarget) as CDOTA_BaseNPC;
        this.TrackingProjectile(this.GetCaster(), this.hLastUnit);
    }

    TrackingProjectile(hSource: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC) {
        this.bounce_count -= 1;
        ProjectileManager.CreateTrackingProjectile({
            Source: hSource,
            Target: hTarget,
            Ability: this.GetAbility(),
            EffectName: "particles/units/heroes/hero_hoodwink/hoodwink_acorn_shot_tracking.vpcf",
            iSourceAttachment: ProjectileAttachment.HITLOCATION,
            // vSourceLoc: this.GetCaster().GetAbsOrigin(),
            iMoveSpeed: this.bounce_speed,
            ExtraData: {
                thinker: this.GetParent().entindex(),
            }
        });
    }

    ToNextProjectileHit(lastUnit: CDOTA_BaseNPC) {
        if (lastUnit == null) {
            this.Destroy();
            return;
        }
        if (this.bounce_count > 0) {
            let hCaster = this.GetCaster();
            // let search_radius = 400;
            let enemies = FindUnitsInRadius(
                hCaster.GetTeamNumber(),
                lastUnit.GetOrigin(),
                null,
                400,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            let is_shot = false;
            for (let enemy of enemies) {
                if (enemy == lastUnit) { continue; }
                is_shot = true;
                this.TrackingProjectile(lastUnit, enemy);
                // ProjectileManager.CreateTrackingProjectile({
                //     Source: lastUnit,
                //     Target: enemy,
                //     Ability: this.GetAbility(),
                //     EffectName: "particles/units/heroes/hero_hoodwink/hoodwink_acorn_shot_tracking.vpcf",
                //     iSourceAttachment: ProjectileAttachment.HITLOCATION,
                //     // vSourceLoc: this.GetCaster().GetAbsOrigin(),
                //     iMoveSpeed: this.bounce_speed,
                //     ExtraData: {
                //         thinker: this.GetParent().entindex(),
                //     }
                // });
            }
            if (is_shot == false) {
                this.Destroy();
            }
        } else {
            this.Destroy();
        }
    }

    ApplyCustomDamage(hTarget: CDOTA_BaseNPC) {

        ApplyCustomDamage({
            victim: hTarget,
            attacker: this.GetCaster(),
            damage: this.ability_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            // element_type: 0,
        });
        // this.damage_factor *= (1 + this.dmg_reduction);

    }
    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_RemoveImmediate(this.GetParent())
    }
}