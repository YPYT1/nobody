export const drow_range_wearable: HeroWearable = {
    "wearables": [
        // {
        //     "model": 'models/items/drow/drow_arcana/drow_arcana_arms.vmdl',
        //     "material": { group: "arcana", value: 1, name: "drow_arcana_arms_style1" },
        //     "particle": [],
        // },
        {
            "model": 'models/items/drow/drow_arcana/drow_arcana_back.vmdl',
            // "material": { group: "arcana", value: 2, name: "drow_arcana_cape_style1" },
            "particle": [],
        },
        {
            "model": 'models/items/drow/drow_arcana/drow_arcana_weapon.vmdl',
            "particle": [
                "particles/econ/items/drow/drow_arcana/drow_arcana_weapon_ambient.vpcf",
                // "particles/econ/items/drow/drow_arcana/drow_arcana_weapon_v2_ambient.vpcf",
            ],
            // "material": { group: "arcana", value: 2, name: "drow_arcana_weapon_style1" },
        },
        {
            "model": 'models/items/drow/drow_arcana/drow_arcana_legs.vmdl',
            // "material": { group: "arcana", value: 2, name: "drow_arcana_legs_style1" },
            "particle": [],
        },
        {
            "model": 'models/items/drow/drow_arcana/drow_arcana_quiver.vmdl',
            // "material": { group: "arcana", value: 2, name: "drow_arcana_quiver_style1" },
            "particle": [],
        },
        {
            "model": 'models/items/drow/drow_arcana/drow_arcana_shoulder.vmdl',
            // "material": { group: "arcana", value: 2, name: "drow_arcana_shoulder_style1" },
            "particle": [],
        },
        {
            "model": 'models/items/drow/drow_arcana/drow_arcana_head.vmdl',
            // "material": { group: "arcana", value: 2, name: "drow_arcana_hair_style1" },
            "particle": [],
        },
        {
            "model": 'models/items/drow/drow_arcana/drow_arcana_frost_weapon.vmdl',
            "particle": [],
        }
    ],

    "origin_model": {
        "skin": 0,
        "unit_model": "models/test/drow/drow_arcana.vmdl",
        "material_group": "1"
    },


    "particle_create": [
        "particles/econ/items/drow/drow_arcana/drow_arcana_ambient.vpcf",
        'particles/econ/items/drow/drow_arcana/drow_arcana_arm_aura.vpcf',
    ],

}



