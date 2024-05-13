import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 尖刺外壳1	"尖刺外壳可以反弹并无效化自身受到的伤害(每个攻击者最多作用一次)，同时眩晕攻击者。
"
 */
@registerAbility()
export class arms_60 extends BaseArmsAbility {

}

@registerModifier()
export class modifier_arms_60 extends BaseArmsModifier {

    stun_duration: number;

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ]
    }

    C_OnCreatedBefore(params: any): void {
        this.stun_duration = this.GetAbility().GetSpecialValueFor("stun_duration")
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        if (event.attacker.FindModifierByNameAndCaster("modifier_arms_60_marker", event.target) == null) {
            event.attacker.AddNewModifier(this.caster, this.ability, "modifier_arms_60_marker", {});
            GameRules.BuffManager.AddGeneralDebuff(this.caster, event.attacker, DebuffTypes.stunned, this.stun_duration);
            let damage = event.original_damage;
            ApplyCustomDamage({
                victim: event.attacker,
                attacker: this.caster,
                damage: damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypeEnum.wind
            });
            return -99999
        }
        return 0
    }

    GetEffectName(): string {
        return "particles/units/heroes/hero_nyx_assassin/nyx_assassin_spiked_carapace.vpcf"
    }

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.POINT_FOLLOW
    }
}

@registerModifier()
export class modifier_arms_60_marker extends BaseModifier {

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE
    }

    IsHidden(): boolean {
        return true
    }
}


