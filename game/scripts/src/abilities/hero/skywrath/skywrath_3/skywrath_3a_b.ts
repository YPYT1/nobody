import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_3a, skywrath_3a } from "./skywrath_3a";

/**
 * 91	奔雷领域	"吟唱8秒，吟唱期间自身750码范围内开启电闪雷鸣，对范围内的所有敌人造成持续的雷元素打击，每秒造成攻击力320%/330%/350%的雷元素伤害的技能基础伤害。
cd：15秒
蓝量消耗：35"
92	雷云	"吟唱期间生成1/2朵雷云，雷云会随机打击1名敌人每次造成攻击力125%的雷元素技能基础伤害。
雷云攻击间隔：1.5秒
雷云攻击范围：等于奔雷领域范围。"
93	低压	对引雷区域的敌人造成的伤害翻倍。

 */
@registerAbility()
export class skywrath_3a_b extends skywrath_3a {

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_leshrac/leshrac_lightning_bolt.vpcf", context)
        precacheResString("particles/units/heroes/hero_zeus/zeus_cloud_strike.vpcf", context)
    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_3a_b"
    }


}
@registerModifier()
export class modifier_skywrath_3a_b extends modifier_skywrath_3a {

    channel: number;

    UpdataSpecialValue(): void {
        this.channel = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "91", "channel")
    }

    OnIntervalThink(): void {
        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            // 开始蓄力
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3a_b_channel", {
                duration: this.channel,
                manacost_bonus: manacost_bonus,
                is_clone: 0,
            })

            if (this.CheckClone()) {
                this.caster.clone_unit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3a_b_channel", {
                    duration: this.channel,
                    manacost_bonus: manacost_bonus,
                    is_clone: 1,
                })

            }
        }
    }
}

@registerModifier()
export class modifier_skywrath_3a_b_channel extends BaseModifier {

    least_time: number;
    radius: number;

    cloud_list: CDOTA_BaseNPC[];

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.parent = this.GetParent();
        this.team = this.caster.GetTeamNumber();
        this.manacost_bonus = params.manacost_bonus;
        this.is_clone = params.is_clone;
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null);
        this.SelfAbilityMul = this.caster.GetTalentKv("86", "base_value");
        this.SelfAbilityMul += this.caster.GetTalentKv("91", "bonus_base");
        // rune_69	法爷#18	元素轰炸系列的技能基础伤害提高100%
        this.SelfAbilityMul += this.caster.GetRuneKv("rune_69", "value");
        this.radius = this.caster.GetTalentKv("91", "radius")
        this.cloud_list = [];

        GameRules.CMsg.AbilityChannel(this.caster, this, 1)


        // 雷云	"吟唱期间生成1/2朵雷云，雷云会随机打击1名敌人每次造成攻击力125%的雷元素技能基础伤害。
        let cloud_count = this.caster.GetTalentKv("92", "thundercloud_count");
        if (cloud_count > 0) {
            let interval = 1.5;
            // rune_73	法爷#22	雷云数量翻倍，雷云攻击间隔降低至0.75
            let rune73 = this.caster.GetRuneKv("rune_73", "value");
            if (rune73 > 0) {
                cloud_count *= 2;
                interval = 0.75
            }
            let origin = this.GetParent().GetAbsOrigin()
            for (let i = 0; i < cloud_count; i++) {
                let cloud = CreateModifierThinker(
                    this.caster,
                    this.GetAbility(),
                    "modifier_skywrath_3a_b_thundercloud",
                    {
                        is_clone: this.is_clone,
                        interval: interval
                    },
                    origin,
                    this.team,
                    false
                )
                this.cloud_list.push(cloud)
            }
        }
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        const origin = this.parent.GetAbsOrigin()
        let enemies = FindUnitsInRadius(
            this.team,
            origin,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.FOW_VISIBLE,
            FindOrder.ANY,
            false
        )
        const caster_origin = origin + Vector(0, 0, 600) as Vector;

        for (let enemy of enemies) {
            let cast_fx = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_leshrac/leshrac_lightning_bolt.vpcf",
                ParticleAttachment.CUSTOMORIGIN,
                null
            )
            ParticleManager.SetParticleControl(cast_fx, 0, caster_origin)
            ParticleManager.SetParticleControl(cast_fx, 1, enemy.GetAbsOrigin())
            ParticleManager.ReleaseParticleIndex(cast_fx);

            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypes.THUNDER,
                is_primary: true,
                // 增伤
                SelfAbilityMul: this.SelfAbilityMul,
                DamageBonusMul: this.manacost_bonus,
                is_clone: this.is_clone,
            })
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CMsg.AbilityChannel(this.caster, this, 0)
        for (let hUnit of this.cloud_list) {
            UTIL_Remove(hUnit)
        }
    }
}

@registerModifier()
export class modifier_skywrath_3a_b_thundercloud extends BaseModifier {

    radius: number;
    parent_origin: Vector;

    attack_count: number;
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.origin = this.GetParent().GetAbsOrigin()
        this.caster = this.GetCaster()
        this.team = this.caster.GetTeam();
        this.radius = this.caster.GetTalentKv("91", "radius")
        this.is_clone = params.is_clone
        this.SelfAbilityMul = this.caster.GetTalentKv("92", "thundercloud_dmg")
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null);
        this.parent_origin = this.origin + RandomVector(RandomInt(300, 600)) as Vector;
        this.attack_count = 1;
        // rune_74	法爷#23	雷云可攻击目标额外增加2名敌人
        this.attack_count += this.caster.GetRuneKv("rune_74", "value");

        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_zeus/zeus_cloud.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        ParticleManager.SetParticleControl(effect_fx, 0, this.parent_origin);
        ParticleManager.SetParticleControl(effect_fx, 2, this.parent_origin + Vector(0, 0, 600) as Vector)
        this.AddParticle(effect_fx, false, false, -1, false, false)
        this.OnIntervalThink()
        let interval = params.interval as number;
        this.StartIntervalThink(interval)
    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRadius(
            this.team,
            this.origin,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.FOW_VISIBLE,
            FindOrder.ANY,
            false
        )
        let count = 0;
        for (let enemy of enemies) {
            count += 1;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypes.THUNDER,
                is_primary: true,
                // 增伤
                SelfAbilityMul: this.SelfAbilityMul,
                is_clone: this.is_clone,
            })
            let effect_fx = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_zeus/zeus_cloud_strike.vpcf",
                ParticleAttachment.CUSTOMORIGIN,
                null
            )
            ParticleManager.SetParticleControl(effect_fx, 0, this.parent_origin + Vector(0, 0, 600) as Vector)
            ParticleManager.SetParticleControl(effect_fx, 1, enemy.GetAbsOrigin())
            ParticleManager.ReleaseParticleIndex(effect_fx)
            if (count >= this.attack_count) {
                return
            }
        }
    }
}