import { StackModifier } from "../../../../modifier/extends/modifier_stack";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_1, skywrath_1 } from "./skywrath_1";

/**
 * 65	炎龙	"技能赋予火元素效果，变为火元素伤害。
向前方发出一条炎龙，对一条路径上（宽100码，长500码）的敌人造成伤害，提高20%/30%/40%技能基础伤害"
66	龙啸	蓄力4/3秒（可用移动打断蓄力即可释放），向同一个方向发出4/6条炎龙。
67	龙印	单位受到炎龙伤害，下次收到炎龙伤害提高25%,,可叠加,最多持续5秒

 */
@registerAbility()
export class skywrath_1c extends skywrath_1 {

    ylong_stack_dmg: number;
    ylong_max_stack: number;
    ylong_stack_duration: number;

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_lina/lina_spell_dragon_slave.vpcf", context)
    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_1c"
    }

    UpdataSpecialValue(): void {
        this.ylong_stack_dmg = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "67", "ylong_stack_dmg");
        this.ylong_max_stack = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "67", "ylong_max_stack");
        this.ylong_stack_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "67", "ylong_stack_duration");
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let attack_damage = extraData.a;
            if (this.ylong_max_stack > 0 && target.HasModifier("modifier_skywrath_1c_lystack")) {
                let stack = target.GetModifierStackCount("modifier_skywrath_1c_lystack", this.caster);
                attack_damage = attack_damage * (1 + this.ylong_stack_dmg * stack * 0.01)
            }
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.FIRE,
                is_primary: true,
                // 增伤
                SelfAbilityMul: extraData.SelfAbilityMul + this.BasicAbilityDmg,
            })

            if (this.ylong_max_stack) {
                target.AddNewModifier(this.caster, this, "modifier_skywrath_1c_lystack", {
                    duration: this.ylong_stack_duration,
                    max_stack: this.ylong_max_stack,
                })
            }
        }
    }
}

@registerModifier()
export class modifier_skywrath_1c extends modifier_skywrath_1 {

    line_distance: number;
    line_width: number;
    line_speed: number;
    lx_channel: number;

    UpdataSpecialValue(): void {
        this.tracking_proj_name = "particles/units/heroes/hero_lich/lich_chain_frost.vpcf";
        this.SelfAbilityMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "62", 'base_bonus');
        this.line_speed = 700;
        this.line_width = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "65", "line_width");
        this.line_distance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "65", "line_distance");

        this.lx_channel = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "66", "channel");
        // if (this.lx_channel > 0) {
        //     this.fakeAttack = true;
        // }
    }

    OnIntervalThink(): void {
        if (this.caster.IsAlive()
            && this.ability.IsActivated()
            && this.ability.IsMeetCastCondition()
            && !this.caster.IsHexed()
            && !this.caster.IsSilenced()
        ) {
            let attackrange = this.caster.Script_GetAttackRange() + 64;
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                attackrange,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.FOW_VISIBLE,
                FindOrder.CLOSEST,
                false
            )
            if (enemies.length <= 0) {
                this.caster.FadeGesture(GameActivity.DOTA_ATTACK);
                this.caster.FadeGesture(GameActivity.DOTA_CAST_ABILITY_1);
                return
            }
            let hTarget = enemies[0];
            let attack_damage = this.caster.GetAverageTrueAttackDamage(null)

            // 清空动作
            if (this.caster.move_state) {
                this.caster.FadeGesture(GameActivity.DOTA_CAST_ABILITY_1);
                this.caster.StartGesture(GameActivity.DOTA_CAST_ABILITY_1);
            } else {
                this.caster.FadeGesture(GameActivity.DOTA_ATTACK);
                this.caster.StartGesture(GameActivity.DOTA_ATTACK);
            }
            this.caster.GiveMana(this.give_mana);
            // 龙啸
            if (this.lx_channel > 0) {
                // 开始蓄力
                this.StartIntervalThink(-1)
                this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_1c_lx_channel", {
                    duration: this.lx_channel + 0.1
                })

            } else {
                this.PlayPerformAttack2(this.caster, hTarget.GetAbsOrigin(), attack_damage, this.SelfAbilityMul, 0);
                let attack_rate = 1 / this.caster.GetAttacksPerSecond(true);
                this.StartIntervalThink(attack_rate)
            }


        }
    }

    PlayPerformAttack2(
        hCaster: CDOTA_BaseNPC,
        vPos: Vector,
        attack_damage: number,
        SelfAbilityMul: number,
        DamageBonusMul: number,
    ) {
        let origin = this.caster.GetAbsOrigin();
        let vDirection = (vPos - origin as Vector).Normalized()
        vDirection.z = 0
        if (this.fakeAttack) { return }

        ProjectileManager.CreateLinearProjectile({
            Ability: this.GetAbility(),
            EffectName: "particles/units/heroes/hero_lina/lina_spell_dragon_slave.vpcf",
            fDistance: this.line_distance,
            fStartRadius: this.line_width,
            fEndRadius: this.line_width,
            vSpawnOrigin: origin,
            Source: this.caster,
            vVelocity: (vDirection * this.line_speed) as Vector,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            ExtraData: {
                a: attack_damage,
                et: this.element_type,
                dt: this.damage_type,
                SelfAbilityMul: SelfAbilityMul,
                DamageBonusMul: DamageBonusMul,
                c: 0,
            } as ProjectileExtraData
        })
    }

    /** 龙啸 */
    PlayLongXiao(max_count: number) {
        let enemies = FindUnitsInRadius(
            this.team,
            this.caster.GetAbsOrigin(),
            null,
            this.caster.Script_GetAttackRange() + 64,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.FOW_VISIBLE,
            FindOrder.CLOSEST,
            false
        )
        let vPos: Vector;
        if (enemies.length <= 0) {
            vPos = this.caster.GetAbsOrigin() + this.caster.GetForwardVector() * 10 as Vector;
        } else {
            vPos = enemies[0].GetAbsOrigin();
        }
        let count = 0
        let attack_damage = this.caster.GetAverageTrueAttackDamage(null)
        this.caster.SetContextThink("skywrath_lx", () => {
            count += 1;
            if (count < max_count) {
                this.PlayPerformAttack2(this.caster, vPos, attack_damage, this.SelfAbilityMul, 0);
                return 0.15
            }
            let attack_rate = 1 / this.caster.GetAttacksPerSecond(true);
            this.StartIntervalThink(attack_rate)
            return null
        }, 0)
    }


}

/** 66	龙啸	蓄力4/3秒（可用移动打断蓄力即可释放），向同一个方向发出4/6条炎龙。 */
@registerModifier()
export class modifier_skywrath_1c_lx_channel extends BaseModifier {

    channel: number;
    ylong_count_bonus: number;
    count: number;
    pre_count: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.count = 0;
        this.caster = this.GetCaster();
        GameRules.CMsg.AbilityChannel(this.caster, this, 1)
        this.channel = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "66", "channel");
        this.ylong_count_bonus = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "66", "ylong_count_bonus");
        this.caster.AddNewModifier(this.caster, null, "modifier_basic_move", {
            "UP": 0,
            "DOWN": 0,
            "LEFT": 0,
            "RIGHT": 0
        })
        ExecuteOrderFromTable({
            UnitIndex: this.caster.entindex(),
            OrderType: UnitOrder.STOP,
            Queue: false,
        })


        this.pre_count = this.ylong_count_bonus / this.channel * 0.5;

        const effect_fx = GameRules.WarningMarker.CreateExclamation(this.caster)
        this.AddParticle(effect_fx, false, false, -1, false, false)
        this.StartIntervalThink(0.5)
    }

    OnIntervalThink(): void {
        this.count += this.pre_count;
        this.SetStackCount(math.floor(this.count))
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CMsg.AbilityChannel(this.caster, this, 0)
        let skywrath_1c = this.caster.FindModifierByName("modifier_skywrath_1c") as modifier_skywrath_1c;
        let count = this.GetStackCount()
        if (count > 0 && this.caster.IsAlive()) {
            skywrath_1c.PlayLongXiao(count)
        }
        let attack_rate = 1 / this.caster.GetAttacksPerSecond(true);
        skywrath_1c.StartIntervalThink(attack_rate)

    }
}


@registerModifier()
export class modifier_skywrath_1c_lystack extends StackModifier {

}