import { BaseAbility, BaseItem, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';



/**
 * 怪物技能基础模版
 */
export class BaseCreatureAbility extends BaseAbility {

    nPreviewFX: ParticleID;
    nPreviewFX_List: ParticleID[] = [];
    nPreviewFX_2: ParticleID;

    _cast_point: number;

    vPoint: Vector;
    vTarget: Vector;
    hTarget: CDOTA_BaseNPC;
    hCaster: CDOTA_BaseNPC;
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

    OnAbilityPhaseStart(): boolean { return true; }
    OnAbilityPhaseInterrupted() {
        this.DestroyWarningFx()
    }

    DestroyWarningFx() {
        if (this.nPreviewFX) {
            ParticleManager.DestroyParticle(this.nPreviewFX, true);
            this.nPreviewFX = null;
        }
        if (this.nPreviewFX_2) {
            ParticleManager.DestroyParticle(this.nPreviewFX_2, true);
            this.nPreviewFX_2 = null;
        }

        for (let preview of this.nPreviewFX_List) {
            ParticleManager.DestroyParticle(preview, true);
        }
        this.nPreviewFX_List = []
    }

    Precache(context: CScriptPrecacheContext): void {
        
    }

    OnUpgrade(): void {
        this.hCaster = this.GetCaster();
        this._radius = this.GetSpecialValueFor("radius");
        this._damage_factor = this.GetSpecialValueFor("damage_factor");
        this._duration = this.GetSpecialValueFor("duration");
        this._interval = this.GetSpecialValueFor("interval");
        this._distance = this.GetCastRange(this.GetCaster().GetOrigin(), this.GetCaster());
        this._cast_point = this.GetCastPoint();
    }
}