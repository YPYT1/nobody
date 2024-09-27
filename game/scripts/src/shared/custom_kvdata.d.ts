interface HeroWearable {
    wearables: {
        model: string;
        particle: string[];
        material?: {
            group: string;
            value?: number;
            name?: string;
            index?: string;
        };
    }[];
    origin_model: {
        skin: number;
        unit_model: string;
        material_group?: string;
    }

    particle_create: string[];
}