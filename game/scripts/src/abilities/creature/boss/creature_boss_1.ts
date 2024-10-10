import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_1	虎咆哮	
 * 蓄力3秒，朝前方30°扇形释放咆哮，造成大量伤害并减速99%。技能长度1000码。
 * （伤害为玩家最大生命值60%）
 */
@registerAbility()
export class creature_boss_1 extends BaseCreatureAbility {

    sector_angle: number;
    sector_distance: number;

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster,this,"modifier_state_boss_invincible",{})
        this.sector_angle = this.GetSpecialValueFor("sector_angle");
        this.sector_distance = this.GetSpecialValueFor("sector_distance");
        this.vOrigin = this.hCaster.GetAbsOrigin()
        this.vPoint = this.GetCursorPosition()
        this.nPreviewFX = GameRules.WarningMarker.Sector(
            this.hCaster,
            this.vOrigin,
            this.vPoint,
            this.sector_angle,
            this.sector_distance,
            this._cast_point,
        )

        
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        // particles/econ/items/queen_of_pain/qop_arcana/qop_arcana_sonic_wave.vpcf;
        let vDirection = (this.vPoint - this.vOrigin as Vector).Normalized();
        ProjectileManager.CreateLinearProjectile({
            Ability: this,
            EffectName: "particles/econ/items/queen_of_pain/qop_arcana/qop_arcana_sonic_wave.vpcf",
            vSpawnOrigin: this.vOrigin,
            fDistance: this.sector_distance - 500,
            fStartRadius: this.sector_angle,
            fEndRadius: this.sector_angle,
            Source: this.hCaster,
            vVelocity: (vDirection * this.sector_distance ) as Vector,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            bVisibleToEnemies:true,
        });

        // let cast_fx = ParticleManager.CreateParticle(
        //     "particles/econ/items/queen_of_pain/qop_arcana/qop_arcana_sonic_wave.vpcf",
        //     ParticleAttachment.POINT,
        //     this.hCaster
        // )
        // ParticleManager.SetParticleControl(cast_fx,0,this.vOrigin)
        let enemies = Custom_FindUnitsInSector(
            this._team,
            this.vOrigin,
            this.vPoint,
            this.sector_angle,
            this.sector_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
        )

        for (let target of enemies) {
            let damage = target.GetMaxHealth() * 0.6;
            ApplyCustomDamage({
                victim: target,
                attacker: this.hCaster,
                ability: this,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })

            target.AddNewModifier(this.hCaster, this, "creature_boss_1_slow", {
                duration: 3
            })
        }
    }

    // OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean | void {
    //     if (target) {

    //     }
    // }
}

@registerModifier()
export class creature_boss_1_slow extends BaseModifier {

    buff_key = "boss_1_slow";
    movespeed_pct: number;

    OnCreated(params: object): void {
        this.movespeed_pct = this.GetAbility().GetSpecialValueFor("movespeed_pct");
        if (!IsServer()) { return }
        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            "MoveSpeed": {
                "BasePercent": this.movespeed_pct
            }
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key)
    }
}