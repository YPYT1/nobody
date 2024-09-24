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

    OnAbilityPhaseStart(): boolean {
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
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        this.hCaster.AddNewModifier(
            this.hCaster,
            this,
            "modifier_creature_boss_6_channel",
            {
                duration: this.channel_timer,

            }
        )
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName("modifier_creature_boss_6_channel")
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

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.line_width = this.GetAbility().GetSpecialValueFor("line_width");
        this.line_distance = this.GetAbility().GetSpecialValueFor("line_distance");
        this.caster = this.GetCaster()
        this.team = this.caster.GetTeam();
        this.origin = this.GetParent().GetAbsOrigin()
        this.line_vect = this.origin + this.caster.GetForwardVector() * (this.line_distance - this.line_width * 0.5) as Vector
        this.target_vect = this.origin + this.caster.GetForwardVector() * (this.line_distance + this.line_width * 0.5) as Vector
        this.StartIntervalThink(0.1)

        this.PlayEffect(this.target_vect);
        let offset_vect1 = RotatePosition(this.origin, QAngle(0, 15, 0), this.target_vect);
        this.PlayEffect(offset_vect1);
        let offset_vect2 = RotatePosition(this.origin, QAngle(0, -15, 0), this.target_vect);
        this.PlayEffect(offset_vect2);
    }

    PlayEffect(vPos) {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_lion/lion_spell_mana_drain.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            this.GetCaster()
        )
        vPos.z += 30;
        ParticleManager.SetParticleControl(effect_fx, 0, vPos)
        ParticleManager.SetParticleControlEnt(
            effect_fx,
            1,
            this.caster,
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0),
            true
        )
        this.AddParticle(effect_fx, false, false, -1, false, false)
    }
    OnIntervalThink(): void {
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
        for (let enemy of enemies) {
            this.ApplyDamage(enemy)
        }

    }

    ApplyDamage(hTarget: CDOTA_BaseNPC) {
        const damage = hTarget.GetMaxHealth() * 0.025;
        ApplyCustomDamage({
            victim: hTarget,
            attacker: this.GetCaster(),
            ability: null,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        })
        GameRules.BasicRules.RestoreMana(hTarget, -3, this.GetAbility())
    }
}

// @registerModifier()
// export class modifier_creature_boss_6_dmginterval extends BaseModifier {

//     IsHidden(): boolean { return true }
// }