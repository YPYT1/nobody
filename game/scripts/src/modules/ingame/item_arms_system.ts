import { reloadable } from '../../utils/tstl-utils';
import * as ItemArmsTable from '../../json/npc_items_custom.json';

/** 兵器系统 */
@reloadable
export class ItemArmsSystem {
    /** 物品效果 */
    ItemEffect(hItem: CDOTA_Item, hParent: CDOTA_BaseNPC) {
        print('ItemEffect');
        const item_name = hItem.GetAbilityName();
        const item_data = ItemArmsTable[item_name as keyof typeof ItemArmsTable];
        if (item_data == null) {
            return;
        }
        // if (item_data.ProjectilesType == 1) {
        //     // 目标型
        //     this._TriggerItemOnTracking(hItem, hParent, item_data)
        // } else if (item_data.ProjectilesType == 2) {
        //     // 线型
        //     this._TriggerItemOnLinear(hItem, hParent, item_data)
        // } else {
        //     // 无弹道
        //     this._TriggerItemOnSelf(hItem, hParent, item_data)
        // }
        // // DeepPrintTable(item_kv)
        // let interval = hItem.GetSpecialValueFor("interval");
        // hItem.ArmsEffectTime = GameRules.GetDOTATime(false, false) + interval;
    }

    _TriggerItemOnSelf(hItem: CDOTA_Item, hParent: CDOTA_BaseNPC, KvData: any) {
        const EffectName = KvData.EffectName as string;
        const search_radius = hItem.GetSpecialValueFor('search_radius');

        const effect_fx = ParticleManager.CreateParticle(EffectName, ParticleAttachment.POINT_FOLLOW, hParent);
        ParticleManager.ReleaseParticleIndex(effect_fx);

        // print("search_radius", search_radius)
        const enemies = FindUnitsInRadius(
            hParent.GetTeam(),
            hParent.GetAbsOrigin(),
            null,
            search_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        print('enemies', enemies.length);
        for (const enemy of enemies) {
            ApplyDamage({
                victim: enemy,
                attacker: hParent,
                damage: 100,
                damage_type: DamageTypes.PHYSICAL,
                ability: hItem,
            });
        }
    }

    _TriggerItemOnTracking(hItem: CDOTA_Item, hParent: CDOTA_BaseNPC, KvData: any) {
        const EffectName = KvData.EffectName as string;
        const ProjectilesSpeed = KvData.ProjectilesSpeed as number;
        const search_radius = hItem.GetSpecialValueFor('search_radius');
        const enemies = FindUnitsInRadius(
            hParent.GetTeam(),
            hParent.GetAbsOrigin(),
            null,
            search_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (enemies.length > 0) {
            ProjectileManager.CreateTrackingProjectile({
                Source: hParent,
                Target: enemies[0],
                Ability: hItem,
                EffectName: EffectName,
                iSourceAttachment: ProjectileAttachment.HITLOCATION,
                vSourceLoc: hParent.GetAbsOrigin(),
                iMoveSpeed: ProjectilesSpeed,
            });
        }
    }

    _TriggerItemOnLinear(hItem: CDOTA_Item, hParent: CDOTA_BaseNPC, KvData: any) {
        print('_TriggerItemOnLinear');
        const EffectName = KvData.EffectName as string;
        const ProjectilesSpeed = KvData.ProjectilesSpeed as number;
        const search_radius = hItem.GetSpecialValueFor('search_radius');
        const enemies = FindUnitsInRadius(
            hParent.GetTeam(),
            hParent.GetAbsOrigin(),
            null,
            search_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (enemies.length > 0) {
            const vCaster = hParent.GetAbsOrigin();
            const vTarget = enemies[0].GetAbsOrigin();
            const wave_width = 128;
            const vDirection = ((vTarget - vCaster) as Vector).Normalized();
            vDirection.z = 0;

            ProjectileManager.CreateLinearProjectile({
                EffectName: EffectName,
                Ability: hItem,
                vSpawnOrigin: vCaster,
                vVelocity: (vDirection * ProjectilesSpeed) as Vector,
                fDistance: 1200,
                fStartRadius: wave_width,
                fEndRadius: wave_width,
                Source: hParent,
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
                iUnitTargetFlags: UnitTargetFlags.NONE,
            });
        }
    }
}
