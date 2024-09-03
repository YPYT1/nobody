import { BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_3a, modifier_drow_3a, modifier_drow_3a_summoned, modifier_drow_3a_summoned_collision } from "./drow_3a";


/**
 * 32	冰雹	"风暴环绕技能赋予冰元素效果，伤害变为冰元素伤害。
风暴数量增加%bonus_count%个"
33	暴雪	"使用风暴环绕技能之后，会记录造成的实际伤害值，并在风暴持续结束时释放一阵暴雪，暴雪的伤害为记录的伤害值的100%。
记录上限为英雄攻击力3000%/4500%/6000%。
爆炸范围：自身直径750码。"
 */
@registerAbility()
export class drow_3a_b extends drow_3a {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_3a_b"
    }

}

@registerModifier()
export class modifier_drow_3a_b extends modifier_drow_3a {

    surround_mdf = "modifier_drow_3a_b_summoned";

    UpdataSpecialValue(): void {
        this.bonus_count = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster,  "32", 'bonus_count')

    }

    ExtraEffect(): void {
        let bx_state = (this.caster.hero_talent["33"] ?? 0) > 0;
        if (bx_state) {
            // this.caster.RemoveModifierByName("modifier_drow_3a_b_storage")
            this.caster.AddNewModifier(this.caster, this.ability, "modifier_drow_3a_b_storage", {
                duration: this.surround_duration + 0.1,
            })
        }
    }
}

@registerModifier()
export class modifier_drow_3a_b_summoned extends modifier_drow_3a_summoned {

    ModifierAura = "modifier_drow_3a_b_summoned_collision";

    xifu: boolean = false;

    C_OnCreated(params: any): void {
        let cast_fx = ParticleManager.CreateParticle(
            "particles/dev/tornado/tornado_4.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.aura_radius, 1, 1))
        this.AddParticle(cast_fx, false, false, 1, false, false);
        // rune_42	游侠#17	风暴环绕【冰雹】会吸附敌人
        this.xifu = this.caster.rune_level_index.hasOwnProperty("rune_42");
        // DeepPrintTable(this.caster.rune_level_index)
        print("xifu",this.xifu)
        this.StartIntervalThink(0.03)
    }

    _OnIntervalThink(): void {
        if (this.xifu) {
            let origin = this.parent.GetAbsOrigin();
            let enemies = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                origin,
                null,
                this.aura_radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            )
            // 黑洞吸附效果
            for (let enemy of enemies) {
                if (enemy.IsBossCreature()) {
                    continue
                }
                let target_vect = enemy.GetAbsOrigin();
                let direction = target_vect - origin as Vector;
                let distance = direction.Length2D();
                direction = direction.Normalized();
                if (distance >= 40) {
                    // 速度跟龙
                    FindClearSpaceForUnit(enemy, target_vect - direction * 15 as Vector, false)
                    // enemy.SetAbsOrigin()
                } 
            }
        }

    }
}

@registerModifier()
export class modifier_drow_3a_b_summoned_collision extends modifier_drow_3a_summoned_collision {

    storage_buff: modifier_drow_3a_b_storage;

    aura_unit: CDOTA_BaseNPC;

    OnCreated_Extends(): void {
        this.damage_type = DamageTypes.MAGICAL;
        this.element_type = ElementTypes.ICE
        this.storage_buff = this.caster.FindModifierByName("modifier_drow_3a_b_storage") as modifier_drow_3a_b_storage;
    }

    OnIntervalThink(): void {
        let real_damage = ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.GetCaster(),
            damage: this.ability_damage,
            damage_type: this.damage_type,
            ability: this.ability,
            element_type: this.element_type,
            is_primary: true,
            SelfAbilityMul: this.SelfAbilityMul,
            DamageBonusMul: this.DamageBonusMul,
            ElementDmgMul: this.ElementDmgMul,
        })

        if (this.storage_buff) {
            this.storage_buff.DoAction({ value: real_damage })
        }
    }
}

@registerModifier()
export class modifier_drow_3a_b_storage extends BaseModifier {

    bx_record_dmg: number;
    bx_record_pct: number;
    bx_limit_pct: number;
    bx_radius: number;

    IsHidden(): boolean {
        return true
    }

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.MULTIPLE
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let hCaster = this.GetCaster()
        this.caster = this.GetCaster();
        this.bx_record_dmg = 0;
        this.bx_record_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(hCaster, '33', "record_pct");
        this.bx_limit_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(hCaster, '33', 'limit_pct');
        // rune_43	游侠#18	风暴环绕 【暴雪】记录值翻倍
        if (this.caster.rune_level_index.hasOwnProperty("rune_43")) {
            this.bx_limit_pct *= 2;
        }
        let bx_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(hCaster, '33', 'radius')
        let hAbility = this.GetAbility()
        this.bx_radius = hAbility.GetTypesAffixValue(bx_radius, "Aoe", "skv_aoe_radius")
    }


    DoAction(params: PlayEffectProps) {
        this.bx_record_dmg += params.value * this.bx_record_pct * 0.01;
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let hCaster = this.GetCaster();
        let hAbility = this.GetAbility();
        if (hCaster == null || hAbility == null) { return }
        let vPos = hCaster.GetAbsOrigin();
        this.PlayEffectAoe(vPos);

        let aoe_multiple = hAbility.GetTypesAffixValue(1, "Aoe", "skv_aoe_chance") - 1;
        if (RollPercentage(aoe_multiple)) {
            let vPos2 = Vector(
                vPos.x + RandomInt(-this.bx_radius, this.bx_radius),
                vPos.y + RandomInt(-this.bx_radius, this.bx_radius),
                vPos.z
            );
            this.PlayEffectAoe(vPos2);
        }

    }

    PlayEffectAoe(vPos: Vector) {
        let hCaster = this.GetCaster();
        let hAbility = this.GetAbility();
        let ability_damage = math.min(hCaster.GetAverageTrueAttackDamage(null) * this.bx_limit_pct * 0.01, this.bx_record_dmg);
        CreateModifierThinker(
            hCaster,
            hAbility,
            "modifier_drow_3a_b_cowlofice",
            {
                duration: 2,
                bx_radius: this.bx_radius,
            },
            vPos,
            hCaster.GetTeamNumber(),
            false
        )

        let enemies = FindUnitsInRadius(
            hCaster.GetTeam(),
            vPos,
            null,
            this.bx_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: hCaster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: hAbility,
                element_type: ElementTypes.ICE,
            })

        }
    }
}

@registerModifier()
export class modifier_drow_3a_b_cowlofice extends BaseModifier {

    cast_fx: ParticleID;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        let bx_radius = params.bx_radius
        let cast_fx = ParticleManager.CreateParticle(
            "particles/econ/items/crystal_maiden/crystal_maiden_cowl_of_ice/maiden_crystal_nova_cowlofice.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(bx_radius, bx_radius, bx_radius))
        this.cast_fx = cast_fx;
        // ParticleManager.ReleaseParticleIndex(cast_fx);

    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        ParticleManager.DestroyParticle(this.cast_fx, true);
        UTIL_Remove(this.GetParent())
    }
}