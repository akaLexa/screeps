/**
 * найден вражеский крип, атака
 * @returns {boolean}
 */
StructureTower.prototype.defend = function () {

    let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        //this.pos.findClosestByRange(FIND_CREEPS, {filter: creep => creep.owner.username !== this.owner.username});

    if (target){
        this.attack(target);
        console.log('[tower]-> room [' + this.room.name + '], found enemy');
        return true;
    }

    return false;
};

/**
 * найдено здание, требующее починки (меньше половины hits)
 * @returns {boolean}
 */
StructureTower.prototype.doRepair = function () {
    let closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) =>
        structure.structureType !== STRUCTURE_WALL
        && structure.structureType !== STRUCTURE_RAMPART
        && structure.hits < (structure.hitsMax / 2)
    });

    if (closestDamagedStructure) {
        this.repair(closestDamagedStructure);
        return true;
    }
    return false;
};
