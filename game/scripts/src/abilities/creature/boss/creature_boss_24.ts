import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_boss_24	最强之盾	
 * "蓄力3秒，会在boss自身范围500码以内随机位置出现道具【圣盾】，5秒之后会对全屏造成高额伤害（伤害为玩家最大生命值100%）。
该伤害对拾取（触碰）盾的玩家减少70%，但是在拾取盾的玩家身后60° 500码以内的玩家不会造成伤害。"

 */
@registerAbility()
export class creature_boss_24 extends BaseCreatureAbility {
    shield_list: CDOTA_BaseNPC[];
    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible', {});
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin);
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning', {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        });
        return true;
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible_channel', {});
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_basic_countdown', {
            duration: this.channel_timer,
        });

        this.shield_list = [];
        for (let i = 0; i < 1; i++) {
            const place_vect = (this.vOrigin + RandomVector(RandomInt(300, 700))) as Vector;
            this.PlaceShield(place_vect);
        }
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_17', {});
    }

    /** 布置圣盾 */
    PlaceShield(pos: Vector) {
        const shield_unit = CreateUnitByName('npc_public_hide_creature', pos, false, null, null, this._team);
        shield_unit.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_24_shield', {
            end_time: GameRules.GetDOTATime(false, false) + this.channel_timer,
        });
        this.shield_list.push(shield_unit);
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName('modifier_basic_countdown');
        this.hCaster.RemoveModifierByName('modifier_state_boss_invincible_channel');
        const cast_fx = ParticleManager.CreateParticle(
            'particles/custom/creature/boss/boss_24_explode.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.hCaster
        );
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(0, 0, 5000));
        ParticleManager.ReleaseParticleIndex(cast_fx);

        for (const hHero of HeroList.GetAllHeroes()) {
            if (!hHero.HasModifier('modifier_creature_boss_24_safe')) {
                const damage = hHero.GetMaxHealth() * 1;
                ApplyCustomDamage({
                    victim: hHero,
                    attacker: this.hCaster,
                    damage: damage,
                    damage_type: DamageTypes.PHYSICAL,
                    ability: this,
                    miss_flag: 1,
                });
            }
        }

        for (const shield of this.shield_list) {
            UTIL_Remove(shield);
        }
        GameRules.CMsg.BossCastWarning(false);
    }
}

@registerModifier()
export class modifier_creature_boss_24_shield extends BaseModifier {
    vCaster: Vector;
    vOring: Vector;
    safe_fx: ParticleID;
    end_vect: Vector;
    end_time: number;
    sector_angle: number;
    sector_distance: number;

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.end_time = params.end_time;
        this.sector_angle = this.GetAbility().GetSpecialValueFor('sector_angle');
        this.sector_distance = 1000; //this.GetAbility().GetSpecialValueFor("sector_distance")
        const hCaster = this.GetCaster();
        this.vCaster = hCaster.GetAbsOrigin();
        const origin = this.GetParent().GetAbsOrigin();
        this.origin = this.GetParent().GetAbsOrigin();

        // origin.z += 50;
        this.GetParent().SetAbsOrigin(origin);
        this.GetParent().SetAbsAngles(270, RandomInt(0, 359), 0);

        this.end_vect = (this.origin + this.GetParent().GetForwardVector() * -this.sector_distance) as Vector;
        this.SetStackCount(1);
        this.StartIntervalThink(0.1);
    }

    OnIntervalThink(): void {
        if (this.GetStackCount() == 1) {
            const enemies = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                this.origin,
                null,
                200,
                UnitTargetTeam.FRIENDLY,
                UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            if (enemies.length > 0) {
                this.SetStackCount(2);
                const direction = (this.vCaster - this.origin) as Vector;
                const angleX = GetAngleByPosOfX(direction);
                this.GetParent().SetAbsAngles(0, angleX, 0);
                this.end_vect = (this.origin + this.GetParent().GetForwardVector() * -this.sector_distance) as Vector;
                this.safe_fx = GameRules.WarningMarker.Sector(
                    this.GetParent(),
                    this.origin,
                    this.end_vect,
                    this.sector_angle,
                    this.sector_distance - 50,
                    -1,
                    Vector(0, 255, 0)
                );
                this.AddParticle(this.safe_fx, false, false, -1, false, false);
                // 移动单位到盾后面,禁止移动
                const move_pos = (this.origin + this.GetParent().GetForwardVector() * -100) as Vector;
                const unit = enemies[0];
                unit.SetAbsOrigin(move_pos);
                const last_time = this.end_time - GameRules.GetDOTATime(false, false);
                GameRules.BuffManager.AddGeneralDebuff(this.GetCaster(), unit, DebuffTypes.rooted, last_time);

                GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_18', {});
            }
        }
        if (this.GetStackCount() == 2) {
            const untis = Custom_FindUnitsInSector(
                DotaTeam.GOODGUYS,
                this.origin,
                this.end_vect,
                this.sector_angle,
                this.sector_distance,
                UnitTargetTeam.FRIENDLY,
                UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY
            );
            for (const unit of untis) {
                unit.AddNewModifier(unit, this.GetAbility(), 'modifier_creature_boss_24_safe', { duration: 0.25 });
            }
        }
    }

    OnStackCountChanged(stackCount: number): void {
        if (!IsServer()) {
            return;
        }
        this.GetParent().SetModelScale(2);
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.UNSELECTABLE]: true,
        };
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MODEL_CHANGE,
            // ModifierFunction.MODEL_SCALE,
        ];
    }

    GetModifierModelScale(): number {
        if (this.GetStackCount() == 1) {
            return 100;
        } else {
            return 200;
        }
    }

    GetModifierModelChange(): string {
        return 'models/items/mars/mars_fall20_immortal_shield/mars_fall20_immortal_shield.vmdl';
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        UTIL_Remove(this.GetParent());
    }
}

@registerModifier()
export class modifier_creature_boss_24_safe extends BaseModifier {}
