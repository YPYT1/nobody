
interface MessageObjectDataProps {
    [key: string]: string | number
}

interface MissionDataProps {
    dire: {
        name: string,
        end_time: number,
        max_time: number,
    },
    radiant: {
        name: string,
        end_time: number,
        max_time: number,
    }
}
declare interface CustomGameEventDeclarations {

    custom_client_popups: {
        popup_id: string;
        state: number;
    };

    CMsg_SendCommonMsgToPlayer: {
        data: {
            message: string;
            data?: MessageObjectDataProps;
        };
    };

    CMsg_SendErrorMsgToPlayer: {
        data: {
            message: string;
            data?: MessageObjectDataProps;
        };
    };

    CMsg_GetEntityListHealthBar: {
        data: {
            boss_list: EntityIndex[], // boss
        };
    };

    CMsg_PopupNumbersToClients: {
        data: {
            // 值
            value: number,
            // 类型[伤害,治疗]
            // type: CGDamagePopups,
            // 单位实体
            entity: number,
            // 暴击
            is_crit: number,
            // 元素
            element_type?: CElementType;
            // 攻击/承伤
            IsAttack: 0 | 1;
        };
    }

    CMsg_PopupResourceNumber: {
        data: {
            resource_type: PlayerResourceTyps;
            amount: number;
        };
    };

    CMsg_PopupUnitState: {
        data: {
            unit: EntityIndex,
            popup_type: PopupsType,
            amount: number,
        }
    }

    CMsg_TopCountdown: {
        data: {
            end_timer: number
        }
    }

    CMsg_GetDamageRecord: {
        data: {
            dmg_record: number[]
        }
    }

    CMsg_BossCastWarning: {
        data: {
            show: number;
            message?: string;
            data?: MessageObjectDataProps;
        }
    }

    CMsg_AbilityChannel: {
        data: {
            state: number;
            ability_name: string;
            channel_time: number;
        }
    }
    ResourceSystem_SendPlayerResources: {
        data: { [key in PlayerResourceTyps]: number }
    }

    CustomOverrideAbility_UpdateSpecialValue: {
        data: OverrideSpecialValueProps
    }

    /**
     * 伤害显示回调
     */
    Popup_DamageNumberToClients: {
        data: {
            // 值
            value: number,
            // 伤害类型[物理/元素/纯粹]
            type: DamageTypes,
            // 单位实体
            entity: number,
            // 暴击
            is_crit: number,
            // 元素
            element_type: ElementTypes;
            // 攻击/承伤
            is_attack: 0 | 1;
        };
    };

    MissionSystem_GetCurrentMission: {
        data: MissionDataProps
    }

    MissionSystem_SendMissionTips: {
        data: {
            mission_type: number;
            mission_name: string;
        }
    }

    MissionSystem_MissionComplete: {
        data: {
            mission_type: number
        }
    }
}


