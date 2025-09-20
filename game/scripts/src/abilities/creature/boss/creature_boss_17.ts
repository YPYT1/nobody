import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';
import { modifier_generic_arc_lua } from '../../../modifier/modifier_generic_arc_lua';

/**
 * creature_boss_17	起飞~啰	蓄力3秒，然后跳向距离最远的玩家，落地造成高额范围伤害。
 * 伤害范围500码。（伤害为玩家最大生命值75%）
 */
@registerAbility()
export class creature_boss_17 extends BaseCreatureAbility {
    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible', {});
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin);
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning', {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        });
        return true;
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        const enemies = FindUnitsInRadius(
            this._team,
            this.vOrigin,
            null,
            9999,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.FARTHEST,
            false
        );

        if (enemies.length > 0) {
            const hTarget = enemies[0];
            this.hTarget = hTarget;
            this.hTarget.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_17_channel', {
                duration: 1,
            });
        }
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_10', {});
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hTarget.RemoveModifierByName('modifier_creature_boss_17_channel');
        if (interrupted) {
            return;
        }
        if (this.hTarget) {
            const vTarget = this.hTarget.GetAbsOrigin();
            const distance = ((this.vOrigin - vTarget) as Vector).Length2D();
            const speed = 1000;
            const duration = distance / speed;
            // let height =
            this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_17_jump', {
                target_x: vTarget.x,
                target_y: vTarget.y,
                target_z: vTarget.z,
                height: 200,
                speed: 1000,
                duration: duration,
            });
        }
        GameRules.CMsg.BossCastWarning(false);
    }
}

@registerModifier()
export class modifier_creature_boss_17_channel extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        const radius = this.GetAbility().GetSpecialValueFor('radius');
        const warning_fx = GameRules.WarningMarker.Circular(radius, -1, Vector(0, 0, 0), false, Vector(255, 0, 0));
        ParticleManager.SetParticleControlEnt(
            warning_fx,
            0,
            this.GetParent(),
            ParticleAttachment.ABSORIGIN_FOLLOW,
            'attach_hitloc',
            Vector(0, 0, 0),
            true
        );
        this.AddParticle(warning_fx, false, false, -1, false, false);
    }
}
@registerModifier()
export class modifier_creature_boss_17_jump extends modifier_generic_arc_lua {
    radius: number;
    vPoint: Vector;
    dmg_max_hp: number;
    _OnCreated(kv: any): void {
        // this.r
        this.dmg_max_hp = this.GetAbility().GetSpecialValueFor('dmg_max_hp') * 0.01;
        this.radius = this.GetAbility().GetSpecialValueFor('radius');
        this.vPoint = Vector(kv.target_x, kv.target_y, kv.target_z);
        const aoe_fx = GameRules.WarningMarker.Circular(this.radius, this.GetDuration(), this.vPoint);
        this.AddParticle(aoe_fx, false, false, -1, false, false);
    }

    _OnDestroy(): void {
        const effect_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_elder_titan/elder_titan_echo_stomp_physical.vpcf',
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_fx, 0, this.vPoint);
        ParticleManager.ReleaseParticleIndex(effect_fx);

        const enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            this.vPoint,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        for (const enemy of enemies) {
            const damage = enemy.GetMaxHealth() * this.dmg_max_hp;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                ability: this.GetAbility(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            });
        }
        // particles/units/heroes/hero_elder_titan/elder_titan_echo_stomp_physical.vpcf
    }
}
