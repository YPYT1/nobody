//change_04.ts
/**
 * name:爆裂毒液    
 * Description:主动使用：抛出装满药剂的魔瓶攻击敌人造成20点伤害，会造成1秒眩晕，
 * 并且允许来回弹射10次,冷却10秒,射程400码,弹射距离300码
 * hero:炼金
 * stun_duration 1(眩晕时间)	bounce_count 10	（弹射次数） cast_range 400（射程）	bounce_radius 300（弹射距离）
 * damage 20 （20点伤害） 这5个内容都是写在xlsx中的内容
 * DOTA_ABILITY_BEHAVIOR_NO_TARGET | DOTA_ABILITY_BEHAVIOR_AOE  这个是我的技能类型
 */

import { reloadable } from '../../../utils/tstl-utils';
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from "../base_creature";

@registerAbility()
@reloadable
export class change_04 extends BaseCreatureAbility{
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/units/heroes/hero_beastmaster/beastmaster_primal_target_flash.vpcf', context);
    }
    OnSpellStart(): void {
        print("开始技能-爆裂毒液");
        const caster = this.GetCaster();
        const target = this.GetCursorTarget();
        const readValue = this.ReadValue();
       
        
    }
   private ReadValue(): void {
        const stun_duration = this.GetSpecialValueFor('stun_duration');
        const bounce_count = this.GetSpecialValueFor('bounce_count');
        const cast_range = this.GetSpecialValueFor('cast_range');
        const bounce_radius = this.GetSpecialValueFor('bounce_radius');
        const damage = this.GetSpecialValueFor('damage');
    }
     
}
@registerModifier()
export class change_04_modifier extends BaseModifier{
    IsHidden(): boolean {
        return false;
    }
    OnCreated(params: any): void {
        const ability = this.GetAbility();
        const stun_duration = ability.GetSpecialValueFor('stun_duration');
        const bounce_count = ability.GetSpecialValueFor('bounce_count');
        const cast_range = ability.GetSpecialValueFor('cast_range');
        const bounce_radius = ability.GetSpecialValueFor('bounce_radius');
        const damage = ability.GetSpecialValueFor('damage');
    }
    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.STATUS_STUN,
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
        ];
    }
    GetModifierStunImmunity(): number {
        return 1;
    }
}