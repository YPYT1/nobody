//change_02.ts
/**
 * name:赏金镖杀
 * Description:主动使用:对500码单体单位投掷出飞镖造成自身生命*2伤害，该效果如果杀死目标则会获得50金币,冷却3秒
 * hero:赏金猎人
 * damage_hp_factor 2 //造成自身生命*2伤害	bonus_gold 50 //获得50金币
 * damage_hp_factor 2	bonus_gold 50
 */
import { registerAbility} from '../../../utils/dota_ts_adapter';
import { reloadable } from '../../../utils/tstl-utils';
import { BaseCreatureAbility } from '../base_creature';


@registerAbility()
@reloadable
export class change_02 extends BaseCreatureAbility {

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/econ/items/drow/drow_ti9_immortal/drow_ti9_base_attack.vpcf', context);
    }    

    target : CDOTA_BaseNPC ;
    OnSpellStart(): void {
        print("--------开始技能")
        this.caster = this.GetCaster();
        this.target = this.GetCursorTarget();

        const p_info : CreateTrackingProjectileOptions = {
            EffectName: 'particles/econ/items/drow/drow_ti9_immortal/drow_ti9_base_attack.vpcf',
            Source: this.caster,
            Target: this.target,
            Ability: this,
            iSourceAttachment: ProjectileAttachment.ATTACK_1,
            // vSourceLoc: SourceLoc,
            iMoveSpeed: 700,
            ExtraData: {
            }
        }
        ProjectileManager.CreateTrackingProjectile(p_info)
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: object): boolean | void {
        
        
        const hpFactor = this.GetSpecialValueFor('damage_hp_factor');

        let damage = this.caster.GetHealth() * hpFactor;

        damage = damage * 1.2 * 1000;
         
        ApplyCustomDamage({
            victim: target,
            attacker: this.GetCaster(),
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            ability: this
        })
        this.GetCaster().GetPlayerOwnerID()

        print("--------结束伤害")
        const goldBounty = this.GetSpecialValueFor('bonus_gold');
        const pid = this.caster.GetPlayerOwnerID();
        print("pid",pid)
        const target_HP = this.target.GetHealth();
        if (target.IsAlive() && damage > target_HP) {
            print("--------计算金币")
            GameRules.ResourceSystem.ModifyResource(pid, {
                Soul : 100000,
            });
            this.StartCooldown(this.GetCooldown(1));
            print("--------结束计算金币")
        }
        this.CastAbility();
        print("--------结束技能")
    }
    
}