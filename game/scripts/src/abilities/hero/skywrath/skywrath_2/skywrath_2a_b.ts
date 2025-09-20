import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../../../../utils/dota_ts_adapter';
import {
    element_orb,
    modifier_skywrath_2a,
    modifier_skywrath_2a_surround,
    modifier_skywrath_2a_surround_collision,
    skywrath_2a,
} from './skywrath_2a';

/**
 * 72	霜降	生成一枚常驻的冰块，缠绕周围，对触碰到的敌人造成冰元素伤害。提升30%/40%/50%基础技能伤害。
73	零度	"冰块数量增加至2/3枚
74	永冻	触碰到冰块的敌人强制冻结1秒。
 */
@registerAbility()
export class skywrath_2a_b extends skywrath_2a {
    GetIntrinsicModifierName(): string {
        return 'modifier_skywrath_2a_b';
    }

    Precache(context: CScriptPrecacheContext): void {
        precacheResString('particles/custom/hero/skywrath2a/surround_orb_ice_2.vpcf', context);
    }
}

@registerModifier()
export class modifier_skywrath_2a_b extends modifier_skywrath_2a {
    surround_mdf = 'modifier_skywrath_2a_b_surround';

    ice_cake: CDOTA_BaseNPC[] = [];

    UpdataSpecialValue(): void {
        this.surround_count += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '73', 'count');
        //rune_63	法爷#12	霜降生成的冰块数量翻倍
        const rune63 = this.caster.GetRuneKv('rune_63', 'value');
        if (rune63 > 0) {
            this.surround_count *= 2;
        }

        const surround_speed = 300; //this.ability.GetTypesAffixValue(300, "Surround", "skv_surround_speed");
        const surround_distance = 600; //this.surround_radius;//this.ability.GetTypesAffixValue(, "Surround", "skv_surround_distance")

        if (this.surround_count != this.ice_cake.length) {
            for (const hSpirit of this.ice_cake) {
                UTIL_Remove(hSpirit);
            }
            this.ice_cake = [];
            const pre_angle = 360 / this.surround_count;
            for (let i = 0; i < this.surround_count; i++) {
                const surround_qangle = i * pre_angle;
                const hSpirit = GameRules.SummonedSystem.CreatedUnit(
                    'npc_summoned_dummy',
                    (this.caster.GetAbsOrigin() + Vector(0, 300, 0)) as Vector,
                    this.caster,
                    -1,
                    true
                );
                this.ice_cake.push(hSpirit);
                hSpirit.AddNewModifier(this.caster, this.ability, this.surround_mdf, {
                    // duration: this.surround_duration,
                    surround_distance: surround_distance,
                    surround_qangle: surround_qangle,
                    surround_speed: surround_speed,
                    surround_entity: this.caster.entindex(),
                    manacost_bonus: 0,
                    is_clone: 0,
                });
            }
        }
    }

    OnIntervalThink(): void {}
}

@registerModifier()
export class modifier_skywrath_2a_b_surround extends modifier_skywrath_2a_surround {
    ModifierAura = 'modifier_skywrath_2a_b_surround_collision';

    C_OnCreated(params: any): void {
        this.GetParent().summoned_damage = GameRules.GetDOTATime(false, false) + 1;
        const effect_name = 'particles/custom/hero/skywrath2a/surround_orb_ice_2.vpcf';
        const cast_fx = ParticleManager.CreateParticle(effect_name, ParticleAttachment.POINT_FOLLOW, this.GetParent());
        this.AddParticle(cast_fx, false, false, 1, false, false);
    }

    _OnIntervalThink() {}

    // OnDestroy(): void {
    //     if (!IsServer()) { return }
    //     UTIL_Remove(this.GetParent())
    // }
}

@registerModifier()
export class modifier_skywrath_2a_b_surround_collision extends modifier_skywrath_2a_surround_collision {
    OnCreated_Extends() {
        this.damage_type = DamageTypes.MAGICAL;
        this.element_type = ElementTypes.ICE;
        this.manacost_bonus = this.GetAuraOwner().manacost_bonus;
        const is_clone = this.GetAuraOwner().is_clone;
        const hParent = this.GetParent();

        // rune_62	法爷#11	霜降对被冻结的单位提高200%的最终伤害
        let FinalDamageMul = 0;
        const rune62value = this.caster.GetRuneKv('rune_62', 'value');
        if (rune62value > 0 && this.GetParent().State_Frozen()) {
            FinalDamageMul += rune62value;
        }

        const surround_d_final = this.ability.GetTypesAffixValue(0, 'Surround', 'skv_surround_d_final');

        // print("this.ability_damage",this.ability_damage)
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.GetCaster(),
            damage: this.ability_damage,
            damage_type: this.damage_type,
            ability: this.ability,
            element_type: this.element_type,
            is_primary: true,
            // damage_vect: this.GetParent().GetAbsOrigin(),
            SelfAbilityMul: this.SelfAbilityMul,
            DamageBonusMul: this.manacost_bonus,
            FinalDamageMul: FinalDamageMul + surround_d_final,
            is_clone: is_clone,
        });

        // 74 永东
        const talent74 = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '74', 'frozen_duration');
        if (talent74 > 0) {
            if (this.GetParent().CustomVariables == null || this.GetParent().CustomVariables['talent74'] == null) {
                this.GetParent().CustomVariables = {};
                this.GetParent().CustomVariables['talent74'] = 1;
                GameRules.BuffManager.AddGeneralDebuff(this.caster, this.GetParent(), DebuffTypes.frozen, 1);
            }
        }

        //
    }
}
