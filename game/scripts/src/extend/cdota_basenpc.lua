function CDOTA_BaseNPC:GetTalentKv(index,key)
    return GameRules.HeroTalentSystem:GetTalentKvOfUnit(self, index, key);
end