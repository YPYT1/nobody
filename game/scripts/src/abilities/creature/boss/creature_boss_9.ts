import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_9	垃圾分类	"蓄力1秒，召唤两个垃圾区域（范围直径300码）在自身周围直径1000码内的任意位置，
 * 同时玩家上会出现可回收垃圾和不可回收垃圾随机一个图标。
倒计时10秒，玩家需要在10秒内跑到指定分类区域里去等计时结束。
如果10秒后有玩家没有进指定区域，或者进错区域，则造成高额伤害。（伤害为玩家最大生命值75%）"	
"该技能机制过程中，boss无敌。无敌结束时间节点：倒计时结束后
1.可回收垃圾区域=绿色圈圈
2.不可回收垃圾区域=红色圈圈
3.玩家头上会出现随机可回收垃圾或不可回收垃圾的图标"

 */
@registerAbility()
export class creature_boss_9 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible", {})
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin)
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        // 自身1000范围内随机两个点
        let recovery_vect1 = this.vOrigin + RandomVector(this._cast_range) as Vector
        let recovery_vect2 = RotatePosition(this.vOrigin, QAngle(0, 180, 0), recovery_vect1);
        this.CreateRecoveryZone(recovery_vect1, 0);
        this.CreateRecoveryZone(recovery_vect2, 1);

        let enemies = FindUnitsInRadius(
            this._team,
            this.vOrigin,
            null,
            9999,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )

        for (let enemy of enemies) {
            const state = RandomInt(0, 1);
            enemy.AddNewModifier(this.hCaster, this, "modifier_creature_boss_9_debuff_" + state, {
                duration: this.channel_timer,
            })
        }

        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_creature_boss_9", {
            duration: this.channel_timer
        })
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible_channel", {})
    }

    CreateRecoveryZone(pos: Vector, type: number) {
        CreateModifierThinker(
            this.hCaster,
            this,
            "modifier_creature_boss_9_thinker_" + type,
            {
                duration: this.channel_timer + 0.1,
            },
            pos,
            this._team,
            false
        )
    }

    
}

@registerModifier()
export class modifier_creature_boss_9 extends BaseModifier {

    IsHidden(): boolean {
        return true
    }
    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSELECTABLE]: true,
        }
    }

}
@registerModifier()
export class modifier_creature_boss_9_thinker_0 extends BaseModifier {

    radius: number;

    icon_index = 13;
    color = Vector(0, 255, 0);
    mdf = "modifier_creature_boss_9_debuff_0";

    OnCreated(params: object): void {
        if (!IsServer()) { return }

        this.origin = this.GetParent().GetAbsOrigin()
        let effect_fx = ParticleManager.CreateParticle(
            "particles/title_fx/title00028/title00028.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.icon_index, 0, 0))
        this.AddParticle(effect_fx, false, false, -1, false, false)

        // 范围
        this.radius = this.GetAbility().GetSpecialValueFor("radius")
        const origin_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/event_ring_anim/event_ring_anim_origin.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(origin_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
        ParticleManager.SetParticleControl(origin_fx, 2, Vector(this.radius - 32, 0, 0))
        ParticleManager.SetParticleControl(origin_fx, 3, this.color)
        this.AddParticle(effect_fx, false, false, -1, false, false);
        this.StartIntervalThink(0.2)
    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            this.origin,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            if (enemy.HasModifier(this.mdf)) {
                enemy.AddNewModifier(this.GetCaster(), this.GetAbility(), "modifier_creature_boss_9_correct", { duration: 0.5 })
            } else {
                enemy.RemoveModifierByName("modifier_creature_boss_9_correct")
            }
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_creature_boss_9_thinker_1 extends modifier_creature_boss_9_thinker_0 {

    icon_index = 14;
    color = Vector(255, 0, 0);
    mdf = "modifier_creature_boss_9_debuff_1";

}

@registerModifier()
export class modifier_creature_boss_9_debuff_0 extends BaseModifier {

    icon = 13;
    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.origin = this.GetParent().GetAbsOrigin()
        let effect_fx = ParticleManager.CreateParticle(
            "particles/title_fx/title00028/title00028.vpcf",
            ParticleAttachment.OVERHEAD_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.icon, 0, 0))
        this.AddParticle(effect_fx, false, false, -1, false, false)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let hParent = this.GetParent();
        if (!hParent.HasModifier("modifier_creature_boss_9_correct")) {
            const damage = hParent.GetMaxHealth() * 0.75;
            ApplyCustomDamage({
                victim: hParent,
                attacker: this.GetCaster(),
                ability: this.GetAbility(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
        }
    }
}

@registerModifier()
export class modifier_creature_boss_9_debuff_1 extends modifier_creature_boss_9_debuff_0 {

    icon = 14;
}

@registerModifier()
export class modifier_creature_boss_9_correct extends BaseModifier {

}