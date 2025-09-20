import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_boss_3	雷霆万钧
 * 蓄力3秒，对自身直径800码范围内的所有区域随机降下雷霆打击，雷霆打击的范围为直径200码。
 * 每秒3次雷霆。持续5秒（每次雷霆打击伤害为玩家最大生命值25%，每次打击延迟1.5秒）
 */
@registerAbility()
export class creature_boss_3 extends BaseCreatureAbility {
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
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_3_thunder', {
            duration: this._duration,
        });
    }
}

@registerModifier()
export class modifier_creature_boss_3_thunder extends BaseModifier {
    thunder_interval: number;
    thunder_radius: number;
    thunder_count: number;
    _cast_range: number;

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.thunder_interval = this.GetAbility().GetSpecialValueFor('thunder_interval');
        this.thunder_count = this.GetAbility().GetSpecialValueFor('thunder_count');
        this._cast_range = (this.GetAbility() as BaseCreatureAbility)._cast_range;
        this.OnIntervalThink();
        this.StartIntervalThink(this.thunder_interval);
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_2', {});
    }

    OnIntervalThink(): void {
        const vOrigin = this.GetParent().GetAbsOrigin();
        for (let i = 0; i < this.thunder_count; i++) {
            const vLine = (vOrigin + Vector(RandomInt(-this._cast_range, this._cast_range))) as Vector;
            const vRandvect = RotatePosition(vOrigin, QAngle(0, RandomInt(0, 359), 0), vLine);
            // ThunderApplyPoint(vRandvect)

            CreateModifierThinker(
                this.GetCaster(),
                this.GetAbility(),
                'modifier_creature_boss_3_thunder_delay',
                {
                    duration: this.thunder_interval,
                },
                vRandvect,
                this.GetCaster().GetTeam(),
                false
            );
        }
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        GameRules.CMsg.BossCastWarning(false);
    }
}

@registerModifier()
export class modifier_creature_boss_3_thunder_delay extends BaseModifier {
    thunder_radius: number;
    dmg_max_hp: number;

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.dmg_max_hp = this.GetAbility().GetSpecialValueFor('dmg_max_hp');
        this.thunder_radius = this.GetAbility().GetSpecialValueFor('thunder_radius');
        const effect_fx = GameRules.WarningMarker.Circular(this.thunder_radius, this.GetDuration(), this.GetParent().GetAbsOrigin(), false);
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        this.ThunderApplyPoint(this.GetParent().GetAbsOrigin());
        UTIL_Remove(this.GetParent());
    }

    ThunderApplyPoint(vPoint: Vector) {
        const thunder_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_zuus/zuus_lightning_bolt.vpcf',
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        ParticleManager.SetParticleControl(thunder_fx, 1, vPoint);
        ParticleManager.SetParticleControl(thunder_fx, 0, (vPoint + Vector(0, 0, 1000)) as Vector);
        ParticleManager.ReleaseParticleIndex(thunder_fx);

        const aoe_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_zuus/zuus_lightning_bolt_aoe.vpcf',
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        ParticleManager.SetParticleControl(aoe_fx, 0, vPoint);
        ParticleManager.SetParticleControl(aoe_fx, 1, Vector(this.thunder_radius, 1, 1));
        ParticleManager.ReleaseParticleIndex(aoe_fx);

        const enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            vPoint,
            null,
            this.thunder_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        for (const enemy of enemies) {
            const damage = enemy.GetMaxHealth() * this.dmg_max_hp * 0.01;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                ability: this.GetAbility(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            });
        }
    }
}
