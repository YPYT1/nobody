import { BaseModifier, registerAbility, registerModifier } from '../../../../utils/dota_ts_adapter';
import { BaseHeroAbility, BaseHeroModifier } from '../../base_hero_ability';

/**
54	复仇【增益型】	引燃复仇之魂，获得40%伤害加成，持续15秒。cd：40秒,没有蓝耗。
 */
@registerAbility()
export class drow_5 extends BaseHeroAbility {
    GetIntrinsicModifierName(): string {
        return 'modifier_drow_5';
    }
}

export const branch_mdf_list = ['modifier_drow_5_buff', 'modifier_drow_5_branch_a', 'modifier_drow_5_branch_b', 'modifier_drow_5_branch_c'];

@registerModifier()
export class modifier_drow_5 extends BaseHeroModifier {
    duration: number;
    branch: number = 0;
    branch_mdf: string;

    UpdataAbilityValue(): void {
        this.duration = this.ability.GetSpecialValueFor('duration');
        if (this.caster.hero_talent['55']) {
            this.branch = 1;
        } else if (this.caster.hero_talent['56']) {
            this.branch = 2;
        } else if (this.caster.hero_talent['57']) {
            this.branch = 3;
        } else {
            this.branch = 0;
        }
        // this.branch = 3;
        this.branch_mdf = branch_mdf_list[this.branch];
    }

    OnIntervalThink(): void {
        if (this.CastingConditions()) {
            this.DoExecutedAbility();
            this.ability.ManaCostAndConverDmgBonus();
            this.caster.RemoveModifierByName('modifier_drow_5_buff');
            this.caster.RemoveModifierByName(this.branch_mdf);
            this.caster.AddNewModifier(this.caster, this.ability, this.branch_mdf, {
                duration: this.duration,
            });
            // rune_50	游侠#25	复仇持续期间，基础技能的伤害提高1倍
            if (this.caster.rune_level_index.hasOwnProperty('rune_50')) {
                this.caster.AddNewModifier(this.caster, this.ability, 'modifier_drow_5_buff_rune50', {
                    duration: this.duration,
                });
            }
        }
    }
}

@registerModifier()
export class modifier_drow_5_buff extends BaseModifier {
    buff_key = 'drow_5_buff';
    particleName = 'particles/dev/hero/drow/drow_4/vengeance.vpcf';

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        this.OnRefresh(params);
        this.PlayEffect();
    }

    OnRefresh(params: object): void {
        let dmg_bonus_pct = this.GetAbility().GetSpecialValueFor('dmg_bonus_pct');
        dmg_bonus_pct = this.GetAbility().GetTypesAffixValue(dmg_bonus_pct, 'Buff', 'skv_buff_increase');
        const hParent = this.GetParent();
        GameRules.CustomAttribute.SetAttributeInKey(hParent, this.buff_key, {
            DamageBonusMul: {
                Base: dmg_bonus_pct,
            },
        });
    }

    PlayEffect() {
        const cast_fx = ParticleManager.CreateParticle(this.particleName, ParticleAttachment.ABSORIGIN_FOLLOW, this.GetParent());
        this.AddParticle(cast_fx, false, false, -1, false, false);
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key);
    }
}

// 55	寒霜	"复仇获得冰元素之力，持续期间冰元素伤害提高50%，且免疫自身减速效果。"
@registerModifier()
export class modifier_drow_5_branch_a extends modifier_drow_5_buff {
    buff_key = 'drow_5_branch_a';
    particleName = 'particles/dev/hero/drow/drow_4/vengeance_ice.vpcf';

    OnRefresh(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        let dmg_bonus_pct = this.GetAbility().GetSpecialValueFor('dmg_bonus_pct');
        dmg_bonus_pct = this.GetAbility().GetTypesAffixValue(dmg_bonus_pct, 'Buff', 'skv_buff_increase');
        let bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '55', 'bonus_value');
        bonus_value = this.GetAbility().GetTypesAffixValue(bonus_value, 'Buff', 'skv_buff_increase');

        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            DamageBonusMul: {
                Base: dmg_bonus_pct,
            },
            IceDamageBonus: {
                Base: bonus_value,
            },
            MoveSpeed: {
                Last: 1,
            },
        });
    }
}

// 56	追风	复仇获得风元素之力，攻击力提高50%，攻击速度及移动速度提高20%。
@registerModifier()
export class modifier_drow_5_branch_b extends modifier_drow_5_buff {
    buff_key = 'drow_5_branch_a';
    particleName = 'particles/units/heroes/hero_brewmaster/brewmaster_drunken_stance_earth.vpcf';

    OnRefresh(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        let dmg_bonus_pct = this.GetAbility().GetSpecialValueFor('dmg_bonus_pct');
        dmg_bonus_pct = this.GetAbility().GetTypesAffixValue(dmg_bonus_pct, 'Buff', 'skv_buff_increase');
        let ad_bonus_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '56', 'ad_bonus_pct');
        ad_bonus_pct = this.GetAbility().GetTypesAffixValue(ad_bonus_pct, 'Buff', 'skv_buff_increase');
        let as_bonus_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '56', 'as_bonus_pct');
        as_bonus_pct = this.GetAbility().GetTypesAffixValue(as_bonus_pct, 'Buff', 'skv_buff_increase');
        // print("ad_bonus_pct",ad_bonus_pct,as_bonus_pct)
        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            AttackDamage: {
                BasePercent: ad_bonus_pct,
            },
            AttackSpeed: {
                Base: as_bonus_pct,
            },
            MoveSpeed: {
                BasePercent: as_bonus_pct,
            },
            DamageBonusMul: {
                Base: dmg_bonus_pct,
            },
        });
    }
}

// 57	热烈	"复仇获得火元素之力，持续期间火元素伤害提高50%，且所有技能蓝量消耗降低50%。"
@registerModifier()
export class modifier_drow_5_branch_c extends modifier_drow_5_buff {
    buff_key = 'drow_5_branch_c';
    particleName = 'particles/units/heroes/hero_brewmaster/brewmaster_drunken_stance_fire.vpcf';
    mana_pct: number = 100;

    OnRefresh(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        const hAbility = this.GetAbility();
        const mana_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '57', 'mana_pct');
        this.mana_pct = hAbility.GetTypesAffixValue(mana_pct, 'Buff', 'skv_buff_increase');
        let dmg_bonus_pct = hAbility.GetSpecialValueFor('dmg_bonus_pct');
        dmg_bonus_pct = hAbility.GetTypesAffixValue(dmg_bonus_pct, 'Buff', 'skv_buff_increase');
        const bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '57', 'bonus_value');
        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            FireDamageBonus: {
                Base: bonus_value,
            },
            DamageBonusMul: {
                Base: dmg_bonus_pct,
            },
            ManaCostRate: {
                MulRegion: -this.mana_pct,
            },
        });
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.MANACOST_PERCENTAGE_STACKING];
    }

    // GetModifierPercentageManacostStacking(): number {
    //     return this.mana_pct
    // }
}

@registerModifier()
export class modifier_drow_5_buff_rune50 extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }
}
