import { BaseModifier, registerAbility, registerModifier } from '../../../../utils/dota_ts_adapter';
import { drow_3a, modifier_drow_3a, modifier_drow_3a_summoned, modifier_drow_3a_summoned_collision } from './drow_3a';

/**
 * 30	疾风	风暴环绕伤害频率提高50%/100%
31	退散	风暴环绕技能赋予风元素效果，伤害变为风元素伤害。（2级触发风元素伤害增加15%）
 */
@registerAbility()
export class drow_3a_a extends drow_3a {
    GetIntrinsicModifierName(): string {
        return 'modifier_drow_3a_a';
    }
}

@registerModifier()
export class modifier_drow_3a_a extends modifier_drow_3a {
    surround_mdf = 'modifier_drow_3a_a_summoned';

    ExtraEffect(): void {
        // rune_41	游侠#16	风暴环绕【疾风】生效时，风元素伤害增加50%
        // print("rune 41", this.caster.rune_level_index.hasOwnProperty("rune_41"))
        // print("t31", this.caster.hero_talent["31"])
        if (this.caster.rune_level_index.hasOwnProperty('rune_41')) {
            this.caster.AddNewModifier(this.caster, this.ability, 'modifier_drow_3a_a_r41', {
                duration: this.surround_duration,
            });
        }
    }
}

@registerModifier()
export class modifier_drow_3a_a_summoned extends modifier_drow_3a_summoned {
    ModifierAura = 'modifier_drow_3a_a_summoned_collision';

    C_OnCreated(params: any): void {
        let tornado_name = 'particles/dev/tornado/tornado_1.vpcf';
        const talent_31 = this.caster.hero_talent['31'] ?? 0;
        if (talent_31 > 0) {
            tornado_name = 'particles/dev/tornado/tornado_3.vpcf';
        }
        const cast_fx = ParticleManager.CreateParticle(tornado_name, ParticleAttachment.POINT_FOLLOW, this.GetParent());
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.aura_radius, 1, 1));
        this.AddParticle(cast_fx, false, false, 1, false, false);
    }
}

@registerModifier()
export class modifier_drow_3a_a_summoned_collision extends modifier_drow_3a_summoned_collision {
    OnCreated_Extends(): void {
        const base_interval = this.ability.GetSpecialValueFor('interval');
        let interval_increase = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '30', 'interval_increase');
        interval_increase = this.ability.GetTypesAffixValue(interval_increase, 'Buff', 'skv_buff_increase');
        this.interval = base_interval / (1 + interval_increase * 0.01);
        const talent_31 = this.caster.hero_talent['31'] ?? 0;
        if (talent_31 > 0) {
            this.damage_type = DamageTypes.MAGICAL;
            this.element_type = ElementTypes.WIND;
            // this.ElementDmgMul =
        } else {
            this.damage_type = DamageTypes.PHYSICAL;
            this.element_type = ElementTypes.NONE;
        }
    }
}

@registerModifier()
export class modifier_drow_3a_a_r41 extends BaseModifier {
    buff_key = '3a_a_r41';

    // rune_41	游侠#16	风暴环绕【疾风】生效时，风元素伤害增加50%
    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        const wind_bonus = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_41', 'wind_bonus');
        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            WindDamageBonus: {
                Base: wind_bonus,
            },
        });
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        GameRules.CustomAttribute.DelAttributeInKey(this.caster, this.buff_key);
    }
}
