
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_21	灵魂抽取	
 * "蓄力3秒，boss会随机抽取一名玩家的灵魂在玩家面前前，并对其造成持续高额伤害（每秒伤害为玩家最大生命值25%）。
 * 被抽取灵魂的玩家会减速25%，技能持续10秒。
灵魂与本体的连线拉断，技能不会终止但该玩家不再会受到伤害，灵魂与本体连线最大距离1000码。"
 */
@registerAbility()
export class creature_boss_21 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin)
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        let enemies = FindUnitsInRadius(
            this._team,
            this.vOrigin,
            null,
            9999,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            enemy.AddNewModifier(this.hCaster, this, "modifier_creature_boss_21", { duration: 10 })
            break
        }
    }

}

@registerModifier()
export class modifier_creature_boss_21 extends BaseModifier {

    buff_key = "boss_21"
    origin: Vector;
    image: CDOTA_BaseNPC;
    timer: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.timer = 0;
        this.parent = this.GetParent();
        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            "MoveSpeed": {
                "BasePercent": -25
            }
        })
        this.origin = this.GetParent().GetAbsOrigin();
        // 创建幻象
        this.image = CreateUnitByName(
            "npc_public_hide_creature",
            this.origin,
            false,
            null,
            null,
            DotaTeam.GOODGUYS
        )
        this.image.AddNewModifier(this.GetCaster(), this.GetAbility(), "modifier_creature_boss_21_image", {
            image: this.GetParent().GetEntityIndex(),
        })

        // 创建连线
        let line_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_muerta/muerta_parting_shot_tether.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            this.GetParent()
        )
        ParticleManager.SetParticleControlEnt(line_fx, 0, this.image,
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0), false
        )
        ParticleManager.SetParticleControlEnt(line_fx, 1, this.GetParent(),
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0), false
        )
        this.AddParticle(line_fx, false, false, -1, false, false)

        // 创建脱圈距离
        let range_fx = ParticleManager.CreateParticle(
            "particles/ui_mouseactions/range_display.vpcf",
            ParticleAttachment.ABSORIGIN,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(range_fx, 1, Vector(1000, 0, 0))
        ParticleManager.SetParticleControl(range_fx, 2, Vector(1, 0, 0))
        this.AddParticle(range_fx, false, false, -1, false, false)
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        this.timer += 0.1;
        if (this.timer >= 1) {
            this.timer = 0;
            let damage = this.parent.GetMaxHealth() * 0.25;
            ApplyCustomDamage({
                victim: this.GetParent(),
                attacker: this.GetCaster(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this.GetAbility(),
                miss_flag: 1
            })
        }
        let origin = this.GetParent().GetAbsOrigin();
        let distance = (origin - this.origin as Vector).Length2D();
        if (distance > 999) {
            this.Destroy()
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key)
        UTIL_Remove(this.image)
    }
}

@registerModifier()
export class modifier_creature_boss_21_image extends BaseModifier {

    model: string;
    hUnit: CDOTA_BaseNPC;
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.hUnit = EntIndexToHScript(params.image) as CDOTA_BaseNPC;
        this.model = this.hUnit.GetModelName()

        let model_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_muerta/muerta_parting_shot_soul.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        )
        this.AddParticle(model_fx, false, false, -1, false, false)
        this.StartIntervalThink(0)
    }

    OnIntervalThink(): void {
        this.CopyWearable(this.hUnit);
        this.StartIntervalThink(-1)
    }

    CopyWearable(hUnit: CDOTA_BaseNPC) {
        let hParent = this.GetParent();
        hParent.SetOriginalModel(this.model);
        hParent.SetModel(this.model)
        for (let v of hUnit.GetChildren()) {
            if (v && v.GetClassname() == "wearable_item") {
                let model_name = v.GetModelName()
                let hWearable = Entities.CreateByClassname("wearable_item") as CDOTA_BaseNPC;
                hWearable.SetModel(model_name)
                hWearable.SetTeam(hParent.GetTeam());
                hWearable.SetOwner(hParent)
                hWearable.FollowEntity(hParent, true)
            }
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MODEL_CHANGE,
            ModifierFunction.MODEL_SCALE,
            ModifierFunction.MODEL_SCALE_ANIMATE_TIME,
        ]
    }

    GetModifierModelScaleAnimateTime() {
        return 100
    }

    // GetModifierModelScale(): number {
    //     return 150
    // }

    GetModifierModelChange(): string {
        return this.model
    }
    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_muerta_parting_shot.vpcf"
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.UNSELECTABLE]: true,
        }
    }
}