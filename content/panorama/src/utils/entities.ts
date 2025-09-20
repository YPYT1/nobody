export const Entities_FindBuffID = (nEntityIndex: EntityIndex, sBuffName: string) => {
    for (let i = 0; i < Entities.GetNumBuffs(nEntityIndex); i++) {
        const buff_id = Entities.GetBuff(nEntityIndex, i);
        const buff_name = Buffs.GetName(nEntityIndex, buff_id);
        if (buff_name == sBuffName) {
            return buff_id;
        }
    }

    return null;
};
