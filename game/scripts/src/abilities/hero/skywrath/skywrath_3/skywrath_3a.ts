import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 86	元素轰炸	"吟唱施法，吟唱3秒后在自身1000码范围内随机位置生成数个元素爆炸，对范围内敌人造成伤害。
蓝量消耗：35
cd：18秒
伤害系数：攻击力300%·对应元素技能基础伤害
生成元素数量：3/4/5/6/8
爆炸范围：半径200码"

 */
@registerAbility()
export class skywrath_3a extends BaseHeroAbility {

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_sandking/sandking_scorpion_strike_aoe.vpcf", context)
        precacheResString("particles/units/heroes/hero_sandking/sandking_epicenter.vpcf", context)
    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_3a"
    }

    UpdataAbilityValue(): void {
        this.SetCustomAbilityType("Aoe", true)
    }
}

@registerModifier()
export class modifier_skywrath_3a extends BaseHeroModifier {

    channel_time: number;

    UpdataAbilityValue(): void {
        this.SelfAbilityMul = this.GetAbility().GetSpecialValueFor("base_value")
        this.channel_time = this.GetAbility().GetSpecialValueFor("channel")
    }

    UpdataSpecialValue(): void {

    }

    OnIntervalThink(): void {
        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            // 开始蓄力
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_modifier_skywrath_3a_channel", {
                duration: 3,
                manacost_bonus: manacost_bonus,
                is_clone: 0,
            })
        }
    }
}

@registerModifier()
export class modifier_modifier_skywrath_3a_channel extends BaseModifier {

    least_time: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.manacost_bonus = params.manacost_bonus;
        this.least_time = GameRules.GetDOTATime(false, false) + this.GetDuration()
        GameRules.CMsg.AbilityChannel(this.caster, this, 1)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CMsg.AbilityChannel(this.caster, this, 0)
        if (this.least_time <= GameRules.GetDOTATime(false, false)) {
            // 成功吟唱
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_modifier_skywrath_3a_bombing", {
                manacost_bonus: this.manacost_bonus,
                is_clone: 0
            })

            if (this.caster.clone_unit != null && this.caster.clone_unit.HasModifier("modifier_skywrath_5_clone_show")) {
                this.caster.clone_unit.AddNewModifier(this.caster, this.GetAbility(), "modifier_modifier_skywrath_3a_bombing", {
                    manacost_bonus: this.manacost_bonus,
                    is_clone: 1
                })
            }
        }

    }
}

@registerModifier()
export class modifier_modifier_skywrath_3a_bombing extends BaseModifier {

    max_wave: number;
    wave: number;
    explosion_count: number;
    range: number;
    explosion_radius: number;
    attack_damage: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.manacost_bonus = params.manacost_bonus;
        this.caster = this.GetCaster()
        this.team = this.caster.GetTeam();
        this.wave = 0;
        this.max_wave = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "86", "max_wave")
        this.explosion_count = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "86", "explosion_count");
        this.range = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "86", "range");
        this.explosion_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "86", "explosion_radius");
        this.SelfAbilityMul = this.GetAbility().GetSpecialValueFor("base_value");
        // rune_69	法爷#18	元素轰炸系列的技能基础伤害提高100%
        this.SelfAbilityMul += this.caster.GetRuneKv("rune_69", "value");
        this.is_clone = params.is_clone;
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null)
        this.OnIntervalThink()
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        if (this.wave >= this.max_wave || this.GetAbility() == null) {
            this.StartIntervalThink(-1)
            this.Destroy();
            return
        }
        this.wave += 1;
        let origin = this.caster.GetAbsOrigin();
        let aoe_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_sandking/sandking_epicenter.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.caster
        )
        ParticleManager.SetParticleControl(aoe_fx, 1, Vector(this.range, this.range, this.range))
        ParticleManager.ReleaseParticleIndex(aoe_fx);

        for (let i = 0; i < this.explosion_count; i++) {
            let vPos = origin + RandomVector(RandomInt(100, this.range)) as Vector;
            this.PlayBombing(vPos)
        }
    }

    PlayBombing(vPos: Vector) {
        let aoe_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_sandking/sandking_scorpion_strike_aoe.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        ParticleManager.SetParticleControl(aoe_fx, 0, vPos)
        ParticleManager.SetParticleControl(aoe_fx, 1, Vector(this.explosion_radius, 1, 1))
        ParticleManager.ReleaseParticleIndex(aoe_fx);


        let element_type = RandomInt(1, 4)
        let enemies = FindUnitsInRadius(
            this.team,
            vPos,
            null,
            this.explosion_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: element_type,
                is_primary: true,
                // 增伤
                SelfAbilityMul: this.SelfAbilityMul,
                DamageBonusMul: this.manacost_bonus,
                is_clone: this.is_clone,
            })
        }

    }

}