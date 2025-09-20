import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_boss_2	地狱烈焰
 * 蓄力2秒，朝前方30°扇形释放持续火焰灼烧，每秒造成大量伤害（伤害间隔1秒一次，每次伤害为玩家最大生命值25%）
 * 并顺时针/逆时针（随机方向）转动，持续5秒。转动速度较慢（5秒转360°）。技能长度1000码
 */
@registerAbility()
export class creature_boss_2 extends BaseCreatureAbility {
    line_width: number;
    line_distance: number;

    Precache(context: CScriptPrecacheContext): void {
        precacheResString('particles/custom/creature/elite/hellfire/hellfire_thrower.vpcf', context);
    }

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible', {});
        this.vPoint = this.GetCursorPosition();
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.line_width = this.GetSpecialValueFor('line_width');
        this.line_distance = this.GetSpecialValueFor('line_distance');
        // this.vPoint = hTarget.GetAbsOrigin();
        this.channel_timer = this.GetChannelTime();
        this.nPreviewFX = GameRules.WarningMarker.Line(
            this.hCaster,
            this.line_width,
            this.hCaster.GetAbsOrigin(),
            this.vPoint,
            this.line_distance,
            this._cast_point
        );
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning', {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        });
        return true;
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_1', {});
        const dir = ((this.vPoint - this.vOrigin) as Vector).Normalized();
        dir.z = 0;
        const vTarget = (this.vOrigin + dir * this.line_distance) as Vector;
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_2_channel', {
            duration: this.channel_timer,
            distance: this.line_distance,
        });
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName('modifier_creature_boss_2_channel');
        GameRules.CMsg.BossCastWarning(false);
    }
}

@registerModifier()
export class modifier_creature_boss_2_channel extends BaseModifier {
    effect_fx: ParticleID;
    interval: number;
    think_angle: number;
    caster: CDOTA_BaseNPC;
    origin: Vector;
    distance: number;

    bonus: number;
    start_angley: number;
    line_width: number;
    team: DotaTeam;
    reverse: number;

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.distance = params.distance;
        this.caster = this.GetCaster();
        this.origin = this.caster.GetAbsOrigin();
        this.start_angley = this.caster.GetAngles().y;
        this.team = this.caster.GetTeam();
        this.line_width = this.GetAbility().GetSpecialValueFor('line_width');
        this.bonus = 0;
        // 每秒需要转多少度
        this.interval = 0.03;
        const reverse = RandomInt(0, 1) == 0 ? 1 : -1;
        this.think_angle = (360 / this.GetDuration()) * this.interval * reverse;

        // this.effect_fx = ParticleManager.CreateParticle(
        //     "particles/econ/items/phoenix/phoenix_solar_forge/phoenix_sunray_solar_forge.vpcf",
        //     ParticleAttachment.CUSTOMORIGIN,
        //     this.caster
        // );
        // let origin = Vector(this.origin.x, this.origin.y, this.origin.z + 50)
        // ParticleManager.SetParticleControlEnt(
        //     this.effect_fx,
        //     0,
        //     this.caster,
        //     ParticleAttachment.POINT_FOLLOW,
        //     "attach_hitloc",
        //     Vector(0, 0, 0),
        //     false
        // )
        // ParticleManager.SetParticleControlEnt(
        //     this.effect_fx,
        //     9,
        //     this.caster,
        //     ParticleAttachment.POINT_FOLLOW,
        //     "attach_hitloc",
        //     Vector(0, 0, 0),
        //     false
        // )
        this.effect_fx = ParticleManager.CreateParticle(
            'particles/custom/creature/elite/hellfire/hellfire_thrower.vpcf',
            ParticleAttachment.POINT_FOLLOW,
            this.caster
        );
        // ParticleManager.SetParticleControlEnt(
        //     this.effect_fx,
        //     0,
        //     this.caster,
        //     ParticleAttachment.POINT_FOLLOW,
        //     "attach_hitloc",
        //     Vector(0,0,0),
        //     true
        // )
        this.AddParticle(this.effect_fx, false, false, -1, false, false);
        this.OnIntervalThink();
        this.StartIntervalThink(this.interval);
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.PROVIDES_VISION]: true,
        };
    }

    OnIntervalThink(): void {
        this.bonus += this.think_angle;
        this.caster.SetAngles(0, this.start_angley + this.bonus, 0);
        const target_vect = (this.origin + this.caster.GetForwardVector() * this.distance) as Vector;
        target_vect.z += 35;
        ParticleManager.SetParticleControl(this.effect_fx, 1, target_vect);

        const enemies = FindUnitsInLine(
            this.team,
            this.origin,
            target_vect,
            null,
            this.line_width,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE
        );

        for (const enemy of enemies) {
            this.ApplyDamage(enemy);
        }

        DebugDrawLine(this.origin, target_vect, 255, 0, 0, true, 0.15);
    }

    ApplyDamage(hTarget: CDOTA_BaseNPC) {
        if (!hTarget.HasModifier('modifier_creature_boss_2_dmg_interval')) {
            hTarget.AddNewModifier(this.GetCaster(), this.GetAbility(), 'modifier_creature_boss_2_dmg_interval', {
                duration: 1,
            });
            const damage = hTarget.GetMaxHealth() * 0.25;
            ApplyCustomDamage({
                victim: hTarget,
                attacker: this.GetCaster(),
                ability: null,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            });
        }
    }
}

@registerModifier()
export class modifier_creature_boss_2_dmg_interval extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }
}
