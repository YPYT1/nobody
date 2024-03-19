function Spawn()
    if not IsServer() then
        return
    end
    ---@type CDOTA_BaseNPC
    local thisEntity = thisEntity
    if thisEntity == nil or thisEntity:IsNull() then
        return
    end
    thisEntity:RemoveAbility("twin_gate_portal_warp")
    if thisEntity:GetTeamNumber() == DOTA_TEAM_GOODGUYS then
        return
    end
    if not thisEntity:HasMovementCapability() then
        return
    end
    if _G.CloseAI then
        return
    end
    -- 空中视野
    ---thisEntity:SetAcquisitionRange(9999)
    thisEntity:SetShouldDoFlyHeightVisual(true)
    --判断是否有可以释放的技能
    for index = 0, thisEntity:GetAbilityCount() - 1 do
        local ability = thisEntity:GetAbilityByIndex(index)
        if ability and ability:GetLevel() > 0 and not ability:IsPassive() then
            thisEntity._HasAbilityToCast = true
            thisEntity._castAbilityStartTime = 0
            break
        end
    end
    thisEntity:SetContextThink(DoUniqueString("AiThink"), AiThink, 0)
end

function AiThink()
    ---@type CDOTA_BaseNPC
    local thisEntity = thisEntity
    if not AIAssistant.IsTargetAlive(thisEntity) then
        return
    end
    if thisEntity:IsLock() then
        return 0.1
    end
    if thisEntity:IsAttacking() then
        local timeUntilNextAttack  = thisEntity:TimeUntilNextAttack()
        if timeUntilNextAttack > 0.1 then
            return timeUntilNextAttack
        end
    end
    if thisEntity._HasAbilityToCast then
        local ability = thisEntity:GetCurrentActiveAbility() 
        if ability ~= nil then
            --print("-------channel", thisEntity:IsChanneling(), ability:GetChannelStartTime(), GameRules:GetGameTime(), ability:GetChannelTime(), ability:GetCastPoint())
            if thisEntity:IsChanneling() then
                return 1
            end
            return ability:GetCastPoint()
        end
        if CheckAbilityToCast(thisEntity) then
            --print("-------CheckAbilityToCast", thisEntity:GetCurrentActiveAbility(), GameRules:GetGameTime(), thisEntity:IsAttacking())
            return 1
        end
    end
    local attackTarget = thisEntity:GetAttackTarget()
    if not AIAssistant.IsTargetAlive(attackTarget) then
        local closestTarget = AIAssistant.ClosestHeroInRange(thisEntity, 9900, nil)
        --print("------closestTarget-------", closestTarget, AIAssistant.IsTargetAlive(closestTarget))
        if closestTarget then
            thisEntity._chase_target = closestTarget
            AIAssistant.AttackTargetOrder(thisEntity, closestTarget)
        end
        return 1
    else
        thisEntity._chase_target = attackTarget
    end
    return 1
end

function CheckAbilityToCast(unit)
    local curtime = GameRules:GetGameTime()
    local jiange = 1
    if unit:GetUnitName() ~= "npc_6081" then
        jiange = 3
    end
    if curtime - unit._castAbilityStartTime <= jiange then
        return false
    end
    if not AIAssistant.IsCanCastAbility(unit) then
        return false
    end
    local ability = AbilityAssistant.GetFirstCooldownAndCanCastAbility(unit)
    if ability == nil then
        return false
    end
    --技能属性
    local targetTeam = ability:GetAbilityTargetTeam()
    local targetType = ability:GetAbilityTargetType()
    local targetFlag = ability:GetAbilityTargetFlags()

    --默认对敌军释放
    if targetTeam == DOTA_UNIT_TARGET_TEAM_NONE then
        targetTeam = DOTA_UNIT_TARGET_TEAM_ENEMY
    end
    --默认英雄+普通单位
    if targetType == DOTA_UNIT_TARGET_NONE then
        targetType = DOTA_UNIT_TARGET_HERO + DOTA_UNIT_TARGET_BASIC
    end
    if targetFlag == DOTA_UNIT_TARGET_FLAG_NONE then
        targetFlag = DOTA_UNIT_TARGET_FLAG_MAGIC_IMMUNE_ENEMIES
    end
    local unitLoc = unit:GetAbsOrigin()
    local unitTeam = unit:GetTeamNumber()
    --根据技能类型决定施法方式，只应用一个
    local behavior = ability:GetBehavior()
    local attackRange = ability:GetCastRange(unitLoc, nil)
    if attackRange == nil then
        attackRange = unit:Script_GetAttackRange() + 100
    end
    local order
    local data = KVUtil.AbilityKV[ability:GetAbilityName()]
    if data ~= nil and data['FindOrder'] ~= nil then
        order = _G[data['FindOrder']]
    end
    local enemies = AIAssistant.FindEnemiesInRadius(unitTeam, unitLoc, attackRange, targetFlag, order, targetType, targetTeam)
    if targetTeam == DOTA_UNIT_TARGET_TEAM_FRIENDLY then
        if not ViMask.HasAnyAbilityBehavior(DOTA_ABILITY_BEHAVIOR_CAN_SELF_CAST, behavior) then
            for idx, enemy in ipairs(enemies) do
                if enemy == unit then
                    table.remove(enemies, idx)
                    break
                end
            end
        end
    end
    local target = nil
    if #enemies > 0 then
        target = enemies[1]
    end
    if not AIAssistant.IsTargetAlive(target) then
        return false
    end
    unit._castAbilityStartTime = curtime
    local cur_time = GameRules:GetGameTime()
    if AIAssistant.IsTargetAlive(target) then
        if ViMask.HasAnyAbilityBehavior(DOTA_ABILITY_BEHAVIOR_NO_TARGET, behavior) then
            unit:CastAbilityNoTarget(ability, -1)
            ability._cooldown_end_time = cur_time + ability:GetCooldownTime()
            return true
        elseif ViMask.HasAnyAbilityBehavior(DOTA_ABILITY_BEHAVIOR_UNIT_TARGET, behavior) then
            unit:CastAbilityOnTarget(target, ability, -1)
            ability._cooldown_end_time = cur_time + ability:GetCooldownTime()
            return true
        elseif ViMask.HasAnyAbilityBehavior(DOTA_ABILITY_BEHAVIOR_POINT, behavior) then
            unit:CastAbilityOnPosition(target:GetAbsOrigin(), ability, -1)
            ability._cooldown_end_time = cur_time + ability:GetCooldownTime()
            return true
        end
    end
    unit._castAbilityStartTime = 0
    return false
end