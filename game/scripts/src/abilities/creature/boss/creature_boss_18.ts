import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_boss_18	亡灵序曲	生命值10%以下自动开启，持续5秒。5秒内受到的任意伤害都转换为生命值。
 */
@registerAbility()
export class creature_boss_18 extends BaseCreatureAbility {
    GetIntrinsicModifierName(): string {
        return 'modifier_creature_boss_18';
    }
}

@registerModifier()
export class modifier_creature_boss_18 extends BaseModifier {
    parent: CDOTA_BaseNPC;
    state: boolean;
    min_health: number;
    duration: number;

    OnCreated(params: object): void {
        const hp_pct = 10 * 0.01;
        this.parent = this.GetParent();
        this.state = true;
        this.min_health = this.GetParent().GetMaxHealth() * hp_pct;
        this.duration = 5;
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.MIN_HEALTH, ModifierFunction.INCOMING_DAMAGE_PERCENTAGE];
    }

    GetMinHealth(): number {
        return this.min_health;
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        const last_health = this.parent.GetHealth() - event.damage;
        if (this.state == true && last_health <= this.min_health) {
            this.state = false;
            this.parent.AddNewModifier(this.parent, this.GetAbility(), 'modifier_creature_boss_18_buff', {
                duration: this.duration,
            });
            return -999;
        }
        return 0;
    }
}

@registerModifier()
export class modifier_creature_boss_18_buff extends BaseModifier {
    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        const effext_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_abaddon/abaddon_borrowed_time.vpcf',
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(effext_fx, false, false, -1, false, false);

        const hAbility = this.GetAbility() as BaseCreatureAbility;
        hAbility.OnKnockback(300);
    }

    GetStatusEffectName(): string {
        return 'particles/status_fx/status_effect_abaddon_borrowed_time.vpcf';
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE];
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        const health_count = event.damage;
        GameRules.BasicRules.Heal(this.GetParent(), health_count);
        return -999;
    }
}
