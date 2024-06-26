import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 弧形闪电I	"释放一道会跳跃穿越附近敌人的闪电，造成雷元素伤害，跳跃5次。
特效：宙斯1技能
cd：4秒
伤害系数：攻击力150%·雷元素伤害
作用范围：直径700码以内随机目标"

 */
@registerAbility()
export class arms_17 extends BaseArmsAbility {

    mdf_tinker: string = "modifier_arms_17_thinker";

    Precache(context: CScriptPrecacheContext): void {
        print("arms_17 Precache", IsServer())
        PrecacheResource("particle", "particles/units/heroes/hero_zuus/zuus_arc_lightning_.vpcf", context)
    }

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsInterval"])
    }

    OnArmsInterval(): void {
        let hTarget = this.FindRandomEnemyTarget();
        if (hTarget == null) { return };
        CreateModifierThinker(
            this.caster,
            this,
            this.mdf_tinker,
            {
                target: hTarget.entindex(),
            },
            this.caster.GetOrigin(),
            this.team,
            false
        );
    }
}

@registerModifier()
export class modifier_arms_17 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_17_thinker extends BaseModifier {

    effect_name: string = "particles/units/heroes/hero_zuus/zuus_arc_lightning_.vpcf";

    last_target: CDOTA_BaseNPC;
    serach_radius: number;
    skv_bounce_count: number;
    skv_bounce_increase: number;
    team: DotaTeam;
    caster: CDOTA_BaseNPC;
    ability_damage: number;

    unit_list: CDOTA_BaseNPC[];

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.unit_list = []
        this.caster = this.GetCaster();
        this.team = this.GetCaster().GetTeamNumber();
        this.ability_damage = this.GetAbility().GetAbilityDamage();
        this.skv_bounce_increase = this.GetAbility().GetSpecialValueFor("skv_bounce_increase");
        this.skv_bounce_count = this.GetAbility().GetSpecialValueFor("skv_bounce_count")
        this.serach_radius = this.GetAbility().GetSpecialValueFor("serach_radius")
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
            UnitTargetFlags.NONE,
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
        this.skv_bounce_count -= 1;

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

        ParticleManager.SetParticleControl(nFxIndex, 62, Vector(1, 1, this.skv_bounce_count * 10));
        ParticleManager.ReleaseParticleIndex(nFxIndex);

        ApplyCustomDamage({
            victim: hTarget,
            attacker: this.caster,
            damage: this.ability_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: ElementTypeEnum.thunder
        });

        if (this.skv_bounce_count == 0) {
            this.StartIntervalThink(-1);
            this.Destroy();
        }

    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}