declare global {
    interface CustomGameEventDeclarations {
        ServiceInterface: {
            event_name: string;
            params: any;
        };
        ArchiveService?: {
            event_name: string;
            params: any;
        };
    }

    interface CustomNetTableDeclarations {
        hero_talent: Record<string, any>;
        custom_ability_types: Record<string, any>;
        unit_attribute: Record<string, any>;
    }

    interface CustomUIConfig {
        KvData: any;
    }
}

export {};
