import { modifier_motion_surround } from "../../../../modifier/modifier_motion";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 向空中射出10/12/14/17/20支箭，随机打击范围1000码以内敌人，每支箭制造成攻击力200%的伤害。
 */
@registerAbility()
export class drow_3b extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_3b"
    }

}

@registerModifier()
export class modifier_drow_3b extends BaseHeroModifier {

    radius: number;
    arrow_count: number;
    base_value: number;

    mdf_thinker = "modifier_drow_3b_thinker";

    UpdataAbilityValue(): void {
        let hAbility = this.GetAbility();
        this.radius = hAbility.GetSpecialValueFor("radius");
        this.arrow_count = hAbility.GetSpecialValueFor("arrow_count")
            + GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "38", 'bonus_arrow')
            ;
        this.base_value = hAbility.GetSpecialValueFor("base_value");


    }

    OnIntervalThink(): void {
        if (this.caster.IsAlive() && this.ability.IsCooldownReady() && this.caster.GetMana() >= this.ability.GetManaCost(-1)) {
            // print("this.r",this.radius)
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                this.radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            if (enemies.length == 0) { return }
            this.ability.UseResources(true, true, true, true)
            this.PlayEffect({})
        }
    }

    PlayEffect(params: PlayEffectProps): void {
        let vPos = this.caster.GetAbsOrigin();
        let cast_fx = ParticleManager.CreateParticle(
            "particles/econ/items/mirana/mirana_persona/mirana_starstorm_moonray_arrow.vpcf",
            ParticleAttachment.POINT,
            this.caster,
        )
        ParticleManager.ReleaseParticleIndex(cast_fx)
        let attack_damage = this.caster.GetAverageTrueAttackDamage(null)
        let bp_ingame = this.base_value - 100
        let bp_server = 0;
        CreateModifierThinker(
            this.caster,
            this.ability,
            this.mdf_thinker,
            {
                radius: this.radius,
                arrow_count: this.arrow_count,
                ability_damage: attack_damage,
                bp_ingame: bp_ingame,
                bp_server: bp_server,
            },
            vPos,
            this.team,
            false
        )
    }
}

@registerModifier()
export class modifier_drow_3b_thinker extends BaseModifier {

    caster: CDOTA_BaseNPC;
    arrow_count: number;
    parent: CDOTA_BaseNPC;
    ability_damage: number;
    radius: number;
    do_destroy: boolean;
    ability: CDOTABaseAbility;
    bp_ingame: number;
    bp_server: number;
    arrow_thinker = "modifier_drow_3b_thinker_arrow";
    
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.do_destroy = false;
        this.bp_ingame = params.bp_ingame;
        this.bp_server = params.bp_server;
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.arrow_count = params.arrow_count;
        this.radius = params.radius;
        this.ability_damage = params.ability_damage;
        this.element_type = ElementTypes.NONE;
        this.parent = this.GetParent();
        this.OnCreated_Extends();
        this.StartIntervalThink(0.5)
    }

    OnCreated_Extends() {

    }

    OnIntervalThink(): void {
        this.StartIntervalThink(-1);
        let enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            this.GetParent().GetAbsOrigin(),
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (enemies.length > 0) {
            let count = 0;
            let hCaster = this.GetCaster()
            let hAbility = this.GetAbility()
            let ability_damage = this.ability_damage

            this.parent.SetContextThink("drow_3b", () => {
                if (this.do_destroy) {
                    this.Destroy()
                    return null
                }
                let rand = RandomInt(0, enemies.length - 1);
                let target = enemies[rand]
                let target_vect = target.GetAbsOrigin()
                CreateModifierThinker(
                    hCaster,
                    hAbility,
                    this.arrow_thinker,
                    {
                        duration: 0.5
                    },
                    target_vect,
                    DotaTeam.GOODGUYS,
                    false
                )
                this.DoDamageTarget(target, ability_damage)
                count += 1;
                if (count >= this.arrow_count) {
                    this.do_destroy = true
                    return 0.5
                }
                return 0.1
            }, 0.1)

        }

    }

    DoDamageTarget(target: CDOTA_BaseNPC, ability_damage: number) {
        target.SetContextThink(DoUniqueString("drow3_b_delay"), () => {
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                element_type: this.element_type,
                ability: this.ability,
                is_primary: true,
                bp_ingame: this.bp_ingame,
                bp_server: this.bp_server,
            });
            return null
        }, 0.3)
    }
    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_drow_3b_thinker_arrow extends BaseModifier {

    cast_fx: ParticleID;
    arrow_name = "particles/dev/attack/attack_normal/attack_normal_1.vpcf";

    OnCreated(params: object): void {
        if (!IsServer()) return
        let target_vect = this.GetParent().GetAbsOrigin()
        let cast_fx = ParticleManager.CreateParticle(
            this.arrow_name,
            ParticleAttachment.CUSTOMORIGIN,
            null,
        )
        ParticleManager.SetParticleControl(cast_fx, 0, Vector(target_vect.x + RandomInt(-500, 500), target_vect.y + RandomInt(-500, 500), 1500))
        ParticleManager.SetParticleControl(cast_fx, 1, target_vect)
        ParticleManager.SetParticleControl(cast_fx, 2, Vector(3000, 0, 0))
        this.AddParticle(cast_fx, false, false, -1, false, false)
    }

    OnDestroy(): void {
        if (!IsServer()) return
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_drow_3b_thinker_arrow_ice extends modifier_drow_3b_thinker_arrow {

    arrow_name = "particles/dev/attack/attack_ice/attack_ice_1.vpcf";

}

@registerModifier()
export class modifier_drow_3b_thinker_arrow_fire extends modifier_drow_3b_thinker_arrow {

    arrow_name = "particles/dev/attack/attack_flame/attack_flame_1.vpcf";

}