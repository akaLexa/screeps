module.exports = {
    start: function () {

        let towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER);
        if (towers) {
            for (let tower of towers) {

                let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

                if (!closestHostile) {
                    closestHostile = tower.pos.findClosestByRange(FIND_CREEPS, {filter: creep => creep.owner.username !== tower.owner.username});
                }

                if (closestHostile) {
                    tower.attack(closestHostile);
                    return;
                }

                let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType !== STRUCTURE_WALL && structure.structureType !== STRUCTURE_RAMPART && structure.hits < (structure.hitsMax / 2)
                });
                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
        }
    }
};