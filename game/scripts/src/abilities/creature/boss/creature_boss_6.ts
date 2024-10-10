import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * 灵魂吸取	蓄力2秒，向前方宽300码，长900码进行灵魂吸取，不断将敌人吸取到技能释放点，
 * 同时造成伤害并扣除一定蓝量，持续4秒。（每秒伤害为玩家最大生命值25%，蓝量扣除50点每秒）

 */
@registerAbility()
export class creature_boss_6 extends BaseCreatureAbility {

    line_width: number;
    line_distance: number;

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/econ/items/lion/lion_demon_drain/lion_spell_mana_drain_demon.vpcf", context)
    }

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible", {})
        this.vPoint = this.GetCursorPosition();
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.line_width = this.GetSpecialValueFor("line_width");
        this.line_distance = this.GetSpecialValueFor("line_distance");
        this.channel_timer = this.GetChannelTime();
        this.nPreviewFX = GameRules.WarningMarker.Line(
            this.hCaster,
            this.line_width,
            this.hCaster.GetAbsOrigin(),
            this.vPoint,
            this.line_distance,
            this._cast_point
        )
        GameRules.CMsg.BossCastWarning(true, "custom_text_boss_cast_warning", {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        })
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible_channel", {})
        this.hCaster.AddNewModifier(
            this.hCaster,
            this,
            "modifier_creature_boss_6_channel",
            {
                duration: this.channel_timer,

            }
        )
        GameRules.CMsg.BossCastWarning(true, "custom_text_boss_cast_warning_4", {})
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName("modifier_creature_boss_6_channel")
        this.hCaster.RemoveModifierByName("modifier_state_boss_invincible_channel");
        this.OnKnockback(300);
        GameRules.CMsg.BossCastWarning(false)
    }
}

@registerModifier()
export class modifier_creature_boss_6_channel extends BaseModifier {

    caster: CDOTA_BaseNPC;
    origin: Vector;
    target_vect: Vector;
    line_vect: Vector;
    line_distance: number;
    line_width: number;
    team: DotaTeam;

    npc_list: CDOTA_BaseNPC[];

    interval: number;
    timer: number;
    speed: number;
    OnCreated(params: object): void {
        this.timer = 0
        this.interval = GameRules.GetGameFrameTime()
        if (!IsServer()) { return }
        this.speed = 300;
        this.npc_list = [];
        this.line_width = this.GetAbility().GetSpecialValueFor("line_width");
        this.line_distance = this.GetAbility().GetSpecialValueFor("line_distance");
        this.caster = this.GetCaster()
        this.team = this.caster.GetTeam();
        this.origin = this.GetParent().GetAbsOrigin()
        this.line_vect = this.origin + this.caster.GetForwardVector() * (this.line_distance - this.line_width * 0.5) as Vector
        this.target_vect = this.origin + this.caster.GetForwardVector() * (this.line_distance + this.line_width * 0.5) as Vector
        this.StartIntervalThink(this.interval)

        this.PlayEffect(this.target_vect);
        let offset_vect1 = RotatePosition(this.origin, QAngle(0, 15, 0), this.target_vect);
        this.PlayEffect(offset_vect1);
        let offset_vect2 = RotatePosition(this.origin, QAngle(0, -15, 0), this.target_vect);
        this.PlayEffect(offset_vect2);
    }

    PlayEffect(vPos) {
        AddFOWViewer(DotaTeam.GOODGUYS, vPos, 600, this.GetDuration(), false)
        vPos.z += 50;
        const dummy = CreateModifierThinker(
            this.caster,
            this.GetAbility(),
            "modifier_creature_boss_6_dummy",
            {},
            vPos,
            DotaTeam.GOODGUYS,
            false
        )

        this.npc_list.push(dummy)
        let effect_fx = ParticleManager.CreateParticle(
            "particles/econ/items/lion/lion_demon_drain/lion_spell_mana_drain_demon.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        vPos.z += 30;
        // ParticleManager.SetParticleControl(effect_fx, 0, vPos)
        ParticleManager.SetParticleControlEnt(
            effect_fx,
            0,
            dummy,
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 50),
            true
        )

        // let xx = this.caster.ScriptLookupAttachment()
        // let yy = this.caster.attach
        ParticleManager.SetParticleControlEnt(
            effect_fx,
            1,
            this.caster,
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0),
            true
        )
        print("caster forward", this.caster.GetForwardVector())
        ParticleManager.SetParticleControlTransformForward(effect_fx, 1, this.caster.GetAbsOrigin(), Vector(0.9, 0.9, 0))
        this.AddParticle(effect_fx, false, false, -1, false, false)
    }

    OnIntervalThink(): void {
        this.timer += this.interval
        let enemies = FindUnitsInLine(
            this.team,
            this.origin,
            this.line_vect,
            null,
            this.line_width,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE
        )
        // print("this.timer ", this.timer)
        for (let enemy of enemies) {
            if (this.timer > 1) {
                this.ApplyDamage(enemy)
            }
            // 吸附效果
            this.PlayAdsorbEffect(enemy)
        }

        if (this.timer > 1) {
            this.timer = 0
        }
    }

    PlayAdsorbEffect(hTarget: CDOTA_BaseNPC) {
        let target_vect = hTarget.GetAbsOrigin();
        let direction = target_vect - this.origin as Vector;
        let distance = direction.Length2D();
        direction = direction.Normalized();
        if (distance > 100) {
            hTarget.SetOrigin(target_vect - direction * this.speed * this.interval as Vector)
            // FindClearSpaceForUnit(, false)
        } else {
            FindClearSpaceForUnit(hTarget, target_vect - direction * this.speed * this.interval as Vector, false)
        }
    }
    ApplyDamage(hTarget: CDOTA_BaseNPC) {
        const damage = hTarget.GetMaxHealth() * 0.25;
        ApplyCustomDamage({
            victim: hTarget,
            attacker: this.GetCaster(),
            ability: null,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        })
        GameRules.BasicRules.RestoreMana(hTarget, -30, this.GetAbility())
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        for (let unit of this.npc_list) {
            UTIL_Remove(unit)
        }
    }
}

@registerModifier()
export class modifier_creature_boss_6_dummy extends BaseModifier {

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}