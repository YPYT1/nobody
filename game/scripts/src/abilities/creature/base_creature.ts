import { BaseAbility, BaseItem, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';



/**
 * 怪物技能基础模版
 */
export class BaseCreatureAbility extends BaseAbility {

    nPreviewFX: ParticleID;
    nPreviewFX_List: ParticleID[] = [];
    nPreviewFX_2: ParticleID;
    nExclamationFx: ParticleID;

    _cast_point: number;

    vOrigin: Vector;
    vPoint: Vector;
    vTarget: Vector;
    hTarget: CDOTA_BaseNPC;
    hCaster: CDOTA_BaseNPC;
    caster:CDOTA_BaseNPC
    particle_idx: ParticleID;
    // warning_fx: ParticleID;
    channel_timer: number;
    _distance: number;
    _damage_factor: number;
    _count: number;
    _interval: number;
    _radius: number;
    _damage: number;
    _duration: number;
    _project_speed: number;
    _team: DotaTeam;
    _cast_range: number;
    dmg_max_hp: number;
    dmg_cur_hp: number;

    OnAbilityPhaseStart(): boolean { return true; }

    OnAbilityPhaseInterrupted() {
        this.DestroyWarningFx()
    }

    DestroyWarningFx() {
        this.hCaster.RemoveModifierByName("modifier_state_boss_invincible");
        if (this.nPreviewFX) {
            ParticleManager.DestroyParticle(this.nPreviewFX, true);
            this.nPreviewFX = null;
        }
        if (this.nPreviewFX_2) {
            ParticleManager.DestroyParticle(this.nPreviewFX_2, true);
            this.nPreviewFX_2 = null;
        }
        if (this.nExclamationFx) {
            ParticleManager.DestroyParticle(this.nExclamationFx, true);
            this.nExclamationFx = null;
        }
        for (let preview of this.nPreviewFX_List) {
            ParticleManager.DestroyParticle(preview, true);
        }
        this.nPreviewFX_List = [];
        GameRules.CMsg.BossCastWarning(false)
    }

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_treant/treant_overgrowth_cast.vpcf", context)
    }

    OnUpgrade(): void {
        this.hCaster = this.GetCaster();
        this.caster = this.GetCaster();
        this._radius = this.GetSpecialValueFor("radius");
        this._damage_factor = this.GetSpecialValueFor("damage_factor");
        this._duration = this.GetSpecialValueFor("duration");
        this._interval = this.GetSpecialValueFor("interval");
        this._cast_range = this.GetCastRange(this.GetCaster().GetOrigin(), this.GetCaster());
        this._cast_point = this.GetCastPoint();
        this._team = this.hCaster.GetTeam();
        this.channel_timer = this.GetChannelTime()
        this.dmg_max_hp = this.GetSpecialValueFor("dmg_max_hp") * 0.01;
        this.dmg_cur_hp = this.GetSpecialValueFor("dmg_cur_hp") * 0.01;
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName("modifier_state_boss_invincible_channel");
        GameRules.CMsg.BossCastWarning(false)
    }

    /** 退 */
    OnKnockback(radius: number) {
        const vOrigin = this.hCaster.GetOrigin()
        const effect_px = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_phoenix/phoenix_supernova_reborn.vpcf",
            ParticleAttachment.ABSORIGIN,
            this.hCaster
        )
        ParticleManager.SetParticleControl(effect_px, 1, Vector(radius, radius, radius));
        ParticleManager.ReleaseParticleIndex(effect_px);

        let enemies = FindUnitsInRadius(
            this._team,
            vOrigin,
            null,
            radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            const damage = enemy.GetMaxHealth() * 0.25;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.hCaster,
                ability: this,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })

            enemy.AddNewModifier(this.hCaster, this, "modifier_knockback_lua", {
                center_x: vOrigin.x,
                center_y: vOrigin.y,
                center_z: 0,
                knockback_height: 100,
                knockback_distance: 450,
                knockback_duration: 1,
                duration: 1,
            })
        }
    }

    /** 阶段转换时清除该技能当前效果  */
    ClearCurrentPhase(){

    }
}