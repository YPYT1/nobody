import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 榴霰弹	
 * 射出一发带有爆炸弹片的榴霰弹，毎%wave_interval%秒在目标区域降下%wave_count%波%aoe_radius%范围的弹雨。区域内的敌军受到伤害并被减速。
伤害公式：%DamageFormula%"
 */
@registerAbility()
export class arms_15 extends BaseArmsAbility {

    Precache(context: CScriptPrecacheContext): void {
        PrecacheUnitByNameSync("npc_dota_hero_sniper", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_sniper.vsndevts", context);
        PrecacheResource("particle", "particles/units/heroes/hero_sniper/sniper_shrapnel.vpcf", context);
        PrecacheResource("particle", "particles/units/heroes/hero_sniper/sniper_shrapnel_launch.vpcf", context);
    }

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsInterval"])
    }

    OnArmsInterval(): void {
        const vCaster = this.caster.GetOrigin();
        let targets = FindUnitsInRadius(
            this.team,
            vCaster,
            null,
            this.trigger_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        let vTarget: Vector;
        if (targets.length > 0) {
            vTarget = targets[0].GetAbsOrigin()
        } else {
            vTarget = vCaster + RandomVector(RandomInt(0, this.trigger_distance)) as Vector
        }

        CreateModifierThinker(
            this.caster,
            this,
            "modifier_arms_15_thinker",
            {

            },
            vTarget,
            this.team,
            false
        )
    }
}

@registerModifier()
export class modifier_arms_15 extends BaseArmsModifier {

}

@registerModifier()
export class modifier_arms_15_thinker extends BaseModifier {

    wave_count: number;
    wave_timer: number;
    wave_interval: number;
    aoe_radius: number;
    ability_damage: number;

    caster: CDOTA_BaseNPC;
    team: DotaTeam;
    loc: Vector;

    state: boolean;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let hAbility = this.GetAbility();
        this.state = false;
        this.caster = this.GetCaster();
        this.team = this.GetCaster().GetTeamNumber();
        this.loc = this.GetParent().GetAbsOrigin();
        this.wave_interval = 1;//hAbility.GetSpecialValueFor("wave_interval");
        this.wave_count = 4;//hAbility.GetSpecialValueFor("wave_count");
        this.aoe_radius = 360;//hAbility.GetSpecialValueFor("skv_aoe_radius");
        this.wave_timer = 0;
        this.ability_damage = hAbility.GetAbilityDamage();
        this.GetCaster().EmitSound("Hero_Sniper.ShrapnelShoot");
        EmitSoundOn("Hero_Sniper.ShrapnelShatter", this.GetParent());
        let vPos = this.GetCaster().GetAbsOrigin()
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_sniper/sniper_shrapnel_launch.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            this.GetCaster()
        );
        ParticleManager.SetParticleControl(effect_fx, 0, this.GetCaster().GetAbsOrigin());
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(vPos.x, vPos.y, vPos.z + 800));
        ParticleManager.ReleaseParticleIndex(effect_fx);
        this.StartIntervalThink(1);
    }

    OnIntervalThink(): void {
        if (this.GetCaster() == null || this.GetAbility() == null) {
            this.StartIntervalThink(-1);
            this.Destroy();
            return
        }
        if (this.state == false) {
            this.state = true;
            this.PlayEffects();
            this.StartIntervalThink(this.wave_interval);
        } else {
            let enemies = FindUnitsInRadius(
                this.team,
                this.loc,
                null,
                this.aoe_radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            for (let enemy of enemies) {
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: this.ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this.GetAbility(),
                    element_type: ElementTypeEnum.fire,
                    is_direct: true,
                })
            }

            this.wave_timer += 1;
            if (this.wave_timer >= this.wave_count) {
                this.StartIntervalThink(-1)
                this.Destroy()
            }
        }
    }

    PlayEffects() {
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_sniper/sniper_shrapnel.vpcf",
            ParticleAttachment.WORLDORIGIN,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(cast_fx, 0, this.GetParent().GetOrigin());
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.aoe_radius, 1, 1));
        this.AddParticle(cast_fx, false, false, -1, false, false)
    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        StopSoundOn("Hero_Sniper.ShrapnelShatter", this.GetParent());
        UTIL_Remove(this.GetParent());
    }
}