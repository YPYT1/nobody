import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 连环闪电	"攻击时有25%概率释放一道连环闪电，
在直径650范围内的敌方单位之间跳跃，每跳跃一次伤害递减5%。
特效：电锤被动
伤害系数：初始跳跃攻击力50%·雷元素伤害"

 */
@registerAbility()
export class arms_18 extends BaseArmsAbility {

    base_chance: number;

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_zuus/zuus_arc_lightning_.vpcf", context)
    }

    UpdataCustomKeyValue(): void {
        this.base_chance = this.GetSpecialValueFor("skv_orb_chance");
    }

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnAttackStart"])
    }

    OnAttackStart(hTarget: CDOTA_BaseNPC): void {
        // let dotaTime = GameRules.GetDOTATime(false, false);
        this.base_chance = this.GetSpecialValueFor("skv_orb_chance");
        if (RollPercentage(this.base_chance) ) {
            // this.ArmsActTime = dotaTime + this.arms_cd;
            CreateModifierThinker(
                this.caster,
                this,
                "modifier_arms_18_thinker",
                {
                    target: hTarget.entindex(),
                },
                this.caster.GetOrigin(),
                this.team,
                false
            );
        }


    }
}

@registerModifier()
export class modifier_arms_18 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_18_thinker extends BaseModifier {

    effect_name: string = "particles/units/heroes/hero_zuus/zuus_arc_lightning_.vpcf";

    last_target: CDOTA_BaseNPC;
    serach_radius: number;
    extra_count: number;
    team: DotaTeam;
    caster: CDOTA_BaseNPC;
    ability_damage: number;
    dmg_reduction: number;

    unit_list: CDOTA_BaseNPC[];

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.unit_list = []
        this.caster = this.GetCaster();
        this.team = this.GetCaster().GetTeamNumber();
        this.dmg_reduction = (100 + this.GetAbility().GetSpecialValueFor("skv_bounce_increase")) * 0.01;
        this.ability_damage = this.GetAbility().GetAbilityDamage();
        this.extra_count = this.GetAbility().GetSpecialValueFor("skv_bounce_count")
        this.serach_radius = 500;
        this.last_target = this.GetCaster();
        let target = EntIndexToHScript(params.target) as CDOTA_BaseNPC;
        this.ArcLightning(target, this.GetCaster());
        this.StartIntervalThink(0.15)
    }

    OnIntervalThink(): void {
        if (this.GetAbility() == null || this.last_target.IsNull()) {
            this.Destroy();
            return
        }
        let enemies = FindUnitsInRadius(
            this.team,
            this.last_target.GetAbsOrigin(),
            null,
            this.serach_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.FOW_VISIBLE,
            FindOrder.CLOSEST,
            false
        );
        for (let enemy of enemies) {
            if (enemy != this.last_target && this.unit_list.indexOf(enemy) == -1) {
                this.ArcLightning(enemy, this.last_target)
                return
            }
        }
        this.Destroy();
    }

    ArcLightning(hTarget: CDOTA_BaseNPC, hOrigin: CDOTA_BaseNPC) {
        this.last_target = hTarget;
        this.extra_count -= 1;

        this.unit_list.push(hTarget);
        let nFxIndex = ParticleManager.CreateParticle(
            this.effect_name,
            ParticleAttachment.POINT_FOLLOW,
            hOrigin
        )
        ParticleManager.SetParticleControlEnt(nFxIndex, 1,
            hTarget,
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0),
            true
        );
        ParticleManager.SetParticleControl(nFxIndex, 62, Vector(1, 1, this.extra_count * 10));
        ParticleManager.ReleaseParticleIndex(nFxIndex);

        ApplyCustomDamage({
            victim: hTarget,
            attacker: this.caster,
            damage: this.ability_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: ElementTypeEnum.thunder
        });

        if (this.extra_count == 0) {
            this.StartIntervalThink(-1);
            this.Destroy();
            return
        }

        this.ability_damage = this.ability_damage * this.dmg_reduction;
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}