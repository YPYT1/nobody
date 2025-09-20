import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_elite_10	腐烂
 * 自身腐烂，对范围200码内的玩家每秒造成伤害（每秒10%最大生命值）并减速25%。
 */
@registerAbility()
export class creature_elite_10 extends BaseCreatureAbility {
    GetIntrinsicModifierName(): string {
        return 'modifier_creature_elite_10';
    }
}

@registerModifier()
export class modifier_creature_elite_10 extends BaseModifier {
    aura_radius: number;

    IsAura(): boolean {
        return true;
    }

    GetAuraRadius(): number {
        return this.aura_radius;
    }

    GetAuraSearchFlags() {
        return UnitTargetFlags.NONE;
    }

    GetAuraSearchTeam() {
        return UnitTargetTeam.ENEMY;
    }

    GetAuraSearchType() {
        return UnitTargetType.HERO + UnitTargetType.BASIC;
    }

    GetModifierAura() {
        return 'modifier_creature_elite_10_aura';
    }

    OnCreated(params: object): void {
        this.aura_radius = this.GetAbility().GetSpecialValueFor('aura_radius');
        if (!IsServer()) {
            return;
        }
        const nFXIndex = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_pudge/pudge_rot.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetCaster()
        );
        ParticleManager.SetParticleControl(nFXIndex, 1, Vector(this.aura_radius, 1, this.aura_radius));
        this.AddParticle(nFXIndex, false, false, -1, false, false);
    }
}

@registerModifier()
export class modifier_creature_elite_10_aura extends BaseModifier {
    buff_key = 'elite_10_aura';

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        const movespeed_pct = this.GetAbility().GetSpecialValueFor('movespeed_pct');
        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            MoveSpeed: {
                BasePercent: movespeed_pct,
            },
        });
        this.OnIntervalThink();
        this.StartIntervalThink(1);
    }

    OnIntervalThink(): void {
        const damage = this.GetParent().GetMaxHealth() * 0.1;
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.GetCaster(),
            ability: this.GetAbility(),
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        });
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key);
    }
}
