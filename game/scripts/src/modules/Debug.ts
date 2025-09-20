import { reloadable } from '../utils/tstl-utils';

@reloadable
export class Debug {
    DebugEnabled = false;
    // 在线测试白名单
    OnlineDebugWhiteList = [188898517];

    debug_name: string[] = [];

    constructor() {
        // 工具模式下开启调试
        this.DebugEnabled = IsInToolsMode();
        ListenToGameEvent(`player_chat`, keys => this.OnPlayerChat(keys), this);
    }

    /** 该模块加入Debug命令 */
    RegisterDebug(name: string) {
        if (this.debug_name.indexOf(name) == -1) {
            this.debug_name.push(name);
        }
    }

    OnPlayerChat(keys: GameEventProvidedProperties & PlayerChatEvent): void {
        const strs = keys.text.split(' ');
        const cmd = strs[0];
        const args = strs.slice(1);
        const steamid = PlayerResource.GetSteamAccountID(keys.playerid);

        if (cmd === '-debug') {
            if (this.OnlineDebugWhiteList.includes(steamid)) {
                this.DebugEnabled = !this.DebugEnabled;
                // const hHero = PlayerResource.GetSelectedHeroEntity(keys.playerid);
                // hHero.AddNewModifier(hHero, null, "modifier_basic_debug", {})
            }
        }

        // 只在允许调试的时候才执行以下指令
        // commands that only work in debug mode below:
        if (!this.DebugEnabled) return;

        if (cmd == '-entity') {
            const all_entities = Entities.FindAllInSphere(Vector(0, 0, 0), 16288);
            for (const entity of all_entities) {
                print(entity.GetEntityIndex(), entity.GetName() ?? 'No Name', entity.GetClassname() ?? 'No Classmame');
                // if (entity.IsBaseNPC()) {
                //     print(entity.GetUnitName());
                // }
                if (entity.GetClassname() == 'npc_dota_thinker') {
                    DebugDrawCircle(entity.GetAbsOrigin(), Vector(255, 0, 0), 10, 64, true, 20);
                }
            }
            print('entity count', all_entities.length);
        }
        if (cmd == '-kvload') {
            print('Playtesting_UpdateAddOnKeyValues');
            GameRules.Playtesting_UpdateAddOnKeyValues();
        }

        // 其他的测试指令写在下面
        // if (cmd === 'get_key_v3') {
        //     const version = args[0];
        //     const key = GetDedicatedServerKeyV3(version);
        //     Say(HeroList.GetHero(0), `${version}: ${key}`, true);
        // }

        // if (cmd === 'get_key_v2') {
        //     const version = args[0];
        //     const key = GetDedicatedServerKeyV2(version);
        //     Say(HeroList.GetHero(0), `${version}: ${key}`, true);
        // }

        if (GameRules.Development) {
            GameRules.Development.DebugChat(cmd, args, keys.playerid);
        }

        for (const name of this.debug_name) {
            if (GameRules[name] && GameRules[name]['Debug']) {
                GameRules[name]['Debug'](cmd, args, keys.playerid);
            }
        }
        // GameRules.CustomAttribute.Debug(cmd, args, keys.playerid)
        // GameRules.MapChapter.Debug(cmd, args, keys.playerid)
        // GameRules.NewArmsEvolution.Debug(cmd, args, keys.playerid)
        // // GameRules.ArmsCombo.Debug(cmd, args, keys.playerid)
        // GameRules.Spawn.Debug(cmd, args, keys.playerid)
        // GameRules.RuneSystem.Debug(cmd, args, keys.playerid)
        // GameRules.MysticalShopSystem.Debug(cmd, args, keys.playerid)
        // GameRules.ArchiveService.Debug(cmd, args, keys.playerid)
        // GameRules.ResourceSystem.Debug(cmd, args, keys.playerid)
        // GameRules.ServiceEquipment.Debug(cmd, args, keys.playerid)
        // GameRules.CMsg.Debug(cmd, args, keys.playerid)
        // GameRules.HeroTalentSystem.Debug(cmd, args, keys.playerid)
        // GameRules.ServiceInterface.Debug(cmd, args, keys.playerid)
        // GameRules.NpcSystem.Debug(cmd, args, keys.playerid)
        // GameRules.CustomOverrideAbility.Debug(cmd, args, keys.playerid)
        // GameRules.MissionSystem.Debug(cmd, args, keys.playerid)
        // GameRules.Altar.Debug(cmd, args, keys.playerid)
    }
}
