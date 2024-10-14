function CDOTA_BaseNPC:GetTalentKv(hCaster,index,key)
    return GameRules.HeroTalentSystem:GetTalentKvOfUnit(hCaster, index, key);
end