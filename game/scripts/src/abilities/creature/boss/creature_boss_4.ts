import { modifier_motion_adsorb } from "../../../modifier/motion/modifier_motion_adsorb";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_4	万象天引	
 * 蓄力3秒，对自身直径1000码范围内敌人强吸引，并每秒造成伤害，距离boss越近受到伤害越高。
 * 持续4秒（每秒伤害玩家最大生命值25%）
 */
@registerAbility()
export class creature_boss_4 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster,this,"modifier_state_boss_invincible",{})
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin)
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible_channel", {})
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_creature_boss_4_channel", {})
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName("modifier_creature_boss_4_channel");
        this.hCaster.RemoveModifierByName("modifier_state_boss_invincible_channel")
    }
}

@registerModifier()
export class modifier_creature_boss_4_channel extends BaseModifier {

    radius: number;
    origin: Vector;
    caster: CDOTA_BaseNPC;
    interval: number;
    dmg_max_hp: number;

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return this.radius; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_creature_boss_4_aura"; }

    OnCreated(params: object): void {
        this.radius = this.GetAbility().GetSpecialValueFor("radius");
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.origin = this.caster.GetAbsOrigin();
        this.dmg_max_hp = 25;
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_enigma/enigma_blackhole.vpcf",
            ParticleAttachment.ABSORIGIN,
            this.GetParent()
        )
        // ParticleManager.SetParticleControlTransform
        this.AddParticle(effect_fx, false, false, -1, false, false)
        // this.OnIntervalThink()
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRadius(
            this.caster.GetTeam(),
            this.origin,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        // 黑洞吸附效果
        // 从离boss1000码起，每100码伤害递增5%
        for (let enemy of enemies) {
            let target_vect = enemy.GetAbsOrigin();
            let direction = target_vect - this.origin as Vector;
            let distance = direction.Length2D();

            let bonus_dmg_pct = 5 * (math.max(0, 1000 - distance) / 100);
            let damage = enemy.GetMaxHealth() * (this.dmg_max_hp + bonus_dmg_pct) * 0.01;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                ability: this.GetAbility(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        // print("OnDestroy",this.GetName())
    }
}

@registerModifier()
export class modifier_creature_boss_4_aura extends modifier_motion_adsorb {

    _OnCreated(params: any): void {
        this.speed = 275
    }
}