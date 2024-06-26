import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 雷鸣震击	"向直径400码数个敌人
制造出分叉闪电造成伤害。
技能逻辑也类似（仅对同一个方向扇形45°敌人生效）
cd：3秒
伤害系数：攻击力100%·雷元素伤害
作用范围：直径400码，3名敌军"

 */
@registerAbility()
export class arms_14 extends BaseArmsAbility {

    skv_target_count: number;
    sector_angle: number;

    Precache(context: CScriptPrecacheContext): void {
        PrecacheUnitByNameSync("npc_dota_hero_shadow_shaman", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_shadowshaman.vsndevts", context);
    }

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsInterval"])
    }

    UpdataCustomKeyValue(): void {
        this.sector_angle = this.GetSpecialValueFor("sector_angle")
        this.skv_target_count = this.GetSpecialValueFor("skv_target_count")
    }

    OnArmsInterval(): void {
        // print("arms_14")
        const ability_damage = this.GetAbilityDamage()
        const vOrigin = this.caster.GetOrigin();
        // const aoe_radius = this.GetSpecialValueFor("aoe_radius")
        // 

        let targets = FindUnitsInRadius(
            this.caster.GetTeam(),
            vOrigin,
            null,
            this.trigger_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );


        if (targets.length > 0) {
            EmitSoundOn("Hero_ShadowShaman.EtherShock",this.caster)
            let targets_shocked = 1;
            let main_target = targets[0];

            let cast_fx = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_shadowshaman/shadowshaman_ether_shock.vpcf",
                ParticleAttachment.WORLDORIGIN,
                this.caster
            )
            ParticleManager.SetParticleControl(cast_fx, 0, vOrigin);
            ParticleManager.SetParticleControl(cast_fx, 1, main_target.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(cast_fx);

            let enemies = Custom_FindUnitsInSector(
                this.caster.GetTeam(),
                this.caster,
                vOrigin,
                main_target.GetAbsOrigin(),
                this.trigger_distance,
                this.sector_angle,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY
            )


            for (let enemy of enemies) {
                if (targets_shocked >= this.skv_target_count) { break }
                if (enemy == main_target) { continue }
                targets_shocked += 1;
                let cast_fx = ParticleManager.CreateParticle(
                    "particles/units/heroes/hero_shadowshaman/shadowshaman_ether_shock.vpcf",
                    ParticleAttachment.WORLDORIGIN,
                    this.caster
                )
                ParticleManager.SetParticleControl(cast_fx, 0, vOrigin);
                ParticleManager.SetParticleControl(cast_fx, 1, enemy.GetAbsOrigin());
                ParticleManager.ReleaseParticleIndex(cast_fx);

                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this,
                    element_type: ElementTypeEnum.thunder,
                })

            }
        }
    }
}



@registerModifier()
export class modifier_arms_14 extends BaseArmsModifier { }