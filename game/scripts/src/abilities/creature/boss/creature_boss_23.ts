import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_boss_23	聚·散	蓄力3秒，boss会将所有玩家强制拉取目标玩家位置到一起（范围300码内），
 * 并对每一名玩家进行1次天降打击，打击延时3秒。打击范围直径300码，
 * 打击伤害可叠加，每多1次打击伤害，
 * 伤害提高25%（初始伤害为玩家最大生命值30%）
 */
@registerAbility()
export class creature_boss_23 extends BaseCreatureAbility {
    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible', {});
        this.vOrigin = this.hCaster.GetAbsOrigin();
        // this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin)

        const effect_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_magnataur/magnataur_reverse_polarity.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.hCaster
        );
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(3000, 3000, 3000));
        ParticleManager.SetParticleControl(effect_fx, 2, Vector(this._cast_point, 0, 0));
        ParticleManager.SetParticleControlEnt(
            effect_fx,
            3,
            this.hCaster,
            ParticleAttachment.ABSORIGIN_FOLLOW,
            'attach_hitloc',
            Vector(0, 0, 0),
            true
        );
        ParticleManager.SetParticleControlForward(effect_fx, 3, this.hCaster.GetForwardVector());
        this.nPreviewFX_2 = effect_fx;
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning', {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        });
        return true;
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_16', {});
        const heroes = HeroList.GetAllHeroes();
        const target_index = RandomInt(0, heroes.length - 1);
        const target_vect = heroes[target_index].GetAbsOrigin();

        for (const enemy of heroes) {
            FindClearSpaceForUnit(enemy, target_vect, false);
            enemy.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_23_delay', {
                duration: 3,
            });
        }
    }
}

@registerModifier()
export class modifier_creature_boss_23_delay extends BaseModifier {
    radius: number;

    RemoveOnDeath(): boolean {
        return false;
    }

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.radius = this.GetAbility().GetSpecialValueFor('radius');
        const warning_fx = GameRules.WarningMarker.Circular(this.radius, this.GetDuration(), Vector(0, 0, 0), false);
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

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        const cast_fx = ParticleManager.CreateParticle(
            'particles/econ/items/lina/lina_ti7/lina_spell_light_strike_array_ti7.vpcf',
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        ParticleManager.SetParticleControl(cast_fx, 0, this.GetParent().GetAbsOrigin());
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.radius, 1, 1));
        ParticleManager.ReleaseParticleIndex(cast_fx);
        // Aoe伤害
        const enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            this.GetParent().GetAbsOrigin(),
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        for (const enemy of enemies) {
            const damage = enemy.GetMaxHealth() * 0.3;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this.GetAbility(),
                miss_flag: 1,
            });
        }
        GameRules.CMsg.BossCastWarning(false);
    }
}
