
import { modifier_debuff_stunned } from "../../../modifier/modifier_debuff";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_25	最强之矛	
 * "蓄力3秒，会在boss自身范围1000码内随机位置出现道具【圣枪】（数量=最大玩家数），
 * 随即boss开始无差别群体远程攻击，持续10秒。
玩家拾取【圣枪】之后会自动丢向boss，在所有圣枪都丢向boss之后，boss会停止攻击并眩晕4秒。"
 */
@registerAbility()
export class creature_boss_25 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible", {})
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.hCaster.RemoveModifierByName("modifier_creature_boss_25_hits");
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin);
        GameRules.CMsg.BossCastWarning(true, "custom_text_boss_cast_warning", {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        })
        return true
    }


    PlaceSpear(pos: Vector) {
        let shield_unit = CreateUnitByName(
            "npc_public_hide_creature",
            pos,
            false,
            null,
            null,
            this._team
        )
        // 
        shield_unit.AddNewModifier(this.hCaster, this, "modifier_creature_boss_25_spear", {
            duration: this.channel_timer,
        })
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        GameRules.CMsg.BossCastWarning(true, "custom_text_boss_cast_warning_19", {})
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible_channel", {})
        for (let i = 0; i < PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS); i++) {
            let place_vect = this.vOrigin + RandomVector(RandomInt(800, 1200)) as Vector;
            this.PlaceSpear(place_vect)
        }
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_basic_countdown", {
            duration: this.channel_timer
        })
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_creature_boss_25_channel", {
            duration: this.channel_timer
        })
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName("modifier_creature_boss_25_channel");
        this.hCaster.RemoveModifierByName("modifier_basic_countdown");
        this.hCaster.RemoveModifierByName("modifier_state_boss_invincible_channel")
        GameRules.CMsg.BossCastWarning(false)
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean | void {
        if (target) {
            if (target == this.hCaster) {
                target.AddNewModifier(target, this, "modifier_creature_boss_25_hits", {})
                return true
            }
            const damage = target.GetMaxHealth() * 0.25;
            ApplyCustomDamage({
                victim: target,
                attacker: this.hCaster,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this,
                miss_flag: 1,
            })

            return false
        }
    }
}

@registerModifier()
export class modifier_creature_boss_25_hits extends BaseModifier {

    need_stack: number;
    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetCaster();
        this.need_stack = PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS)
        print("this.need_stack", this.need_stack)
        this.SetStackCount(1)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.IncrementStackCount()
    }

    OnStackCountChanged(stackCount: number): void {
        if (!IsServer()) { return }
        let stack = this.GetStackCount();
        print("OnStackCountChanged:", stack, this.need_stack)
        if (stack >= this.need_stack) {
            // 移除无敌 和 增加眩晕BOss,
            this.parent.InterruptChannel();
            // GameRules.BuffManager.AddGeneralDebuff(this.parent, this.parent, DebuffTypes.stunned, 4);
            this.parent.AddNewModifier(this.parent, this.GetAbility(), "modifier_creature_boss_25_stunned", { duration: 4 })
            this.Destroy()
        }
    }
}
@registerModifier()
export class modifier_creature_boss_25_channel extends BaseModifier {

    count: number;
    origin2: Vector;
    wave_distance: number;
    wave_width: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.wave_distance = this.GetAbility().GetSpecialValueFor("wave_distance")
        this.wave_width = this.GetAbility().GetSpecialValueFor("wave_width")
        this.origin = this.GetCaster().GetAbsOrigin();
        this.origin2 = this.origin + Vector(100, 0, 0) as Vector;
        this.count = 3;//this.GetAbility().GetSpecialValueFor("")
        // this.SetStackCount()

        let effect_fx = ParticleManager.CreateParticle(
            "particles/generic_gameplay/rune_shield_bubble.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 2, Vector(255, 255, 0))
        this.AddParticle(effect_fx, false, false, -1, false, false)
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        // 发波
        this.PlayEffect();
        this.count += 1
    }

    PlayEffect() {
        for (let i = 0; i < this.count; i++) {
            let pos = RotatePosition(this.origin, QAngle(0, RandomInt(0, 359), 0), this.origin2);
            this.SendProjectile(pos)
        }
        // ProjectileManager.CreateLinearProjectile
    }

    SendProjectile(pos: Vector) {
        let vDirection = (this.origin - pos as Vector).Normalized()
        vDirection.z = 0
        ProjectileManager.CreateLinearProjectile({
            Ability: this.GetAbility(),
            EffectName: "particles/units/heroes/hero_magnataur/magnataur_shockwave.vpcf",
            fDistance: this.wave_distance,
            fStartRadius: this.wave_width,
            fEndRadius: this.wave_width,
            vSpawnOrigin: this.origin,
            Source: this.GetCaster(),
            vVelocity: (vDirection * 700) as Vector,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
        })
    }
}

@registerModifier()
export class modifier_creature_boss_25_spear extends BaseModifier {

    vCaster: Vector;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        let hCaster = this.GetCaster();
        this.parent = this.GetParent();
        this.origin = this.GetParent().GetAbsOrigin();
        this.vCaster = hCaster.GetAbsOrigin();
        let origin = this.GetParent().GetAbsOrigin();
        origin.z += 100;
        this.parent.SetAbsOrigin(origin)

        this.GetParent().SetAbsAngles(RandomInt(60, 120), RandomInt(0, 359), 0);

        //
        let effect_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/move_glow.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControlEnt(
            effect_fx, 0,
            this.parent,
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc", Vector(0, 0, 0), true
        )
        ParticleManager.SetParticleControl(effect_fx, 1, this.origin)
        ParticleManager.SetParticleControl(effect_fx, 6, Vector(255, 165, 0))
        this.AddParticle(effect_fx, false, false, -1, false, false)

        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.origin,
            null,
            200,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        if (enemies.length > 0) {
            this.StartIntervalThink(-1);
            let vDirection = (this.vCaster - this.origin as Vector).Normalized()
            vDirection.z = 0
            ProjectileManager.CreateLinearProjectile({
                Ability: this.GetAbility(),
                EffectName: "particles/econ/items/mars/mars_ti9_immortal/mars_ti9_immortal_spear.vpcf",
                fDistance: 5000,
                fStartRadius: 100,
                fEndRadius: 100,
                vSpawnOrigin: this.origin,
                Source: this.GetCaster(),
                vVelocity: (vDirection * 500) as Vector,
                iUnitTargetTeam: UnitTargetTeam.FRIENDLY,
                iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            })

            this.Destroy()
        }
    }
    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSELECTABLE]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MODEL_CHANGE,
            ModifierFunction.MODEL_SCALE,
        ]
    }

    GetModifierModelScale(): number {
        return 2
    }

    GetModifierModelChange(): string {
        return "models/items/mars/mars_ti9_immortal_weapon/mars_ti9_immortal_weapon.vmdl"
    }
}

@registerModifier()
export class modifier_creature_boss_25_stunned extends modifier_debuff_stunned { }