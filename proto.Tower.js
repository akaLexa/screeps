/**
 * найден вражеский крип, атака
 * @returns {boolean}
 */
StructureTower.prototype.defend = function () {
    let startCpu = Game.cpu.getUsed();
    let elapsed;
    let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        //this.pos.findClosestByRange(FIND_CREEPS, {filter: creep => creep.owner.username !== this.owner.username});

    if (target){
        this.attack(target);
        if( Memory.noticeSettings && Memory.noticeSettings['noticeTowerAttack'] === true) {
            console.log('[tower]-> room [' + this.room.name + '], found enemy');
        }
        elapsed = Game.cpu.getUsed() - startCpu;
        if(elapsed > 1.9){
            console.log('[CPU]-> tower.attack cpu usage:'+elapsed);
        }

        return true;
    }

    if( Memory.noticeSettings &&  Memory.noticeSettings['noticeCPU'] && Memory.noticeSettings['noticeCPULevel']) {
        elapsed = Game.cpu.getUsed() - startCpu;
        if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
            console.log('[CPU]-> tower.attack cpu usage:' + elapsed);
        }
    }
    return false;
};

/**
 * найдено здание, требующее починки (меньше половины hits)
 * @returns {boolean}
 */
StructureTower.prototype.doRepair = function () {
    let startCpu = Game.cpu.getUsed();
    let elapsed;

    let closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) =>
        structure.structureType !== STRUCTURE_WALL
        && structure.structureType !== STRUCTURE_RAMPART
        && structure.structureType !== STRUCTURE_ROAD
        && structure.hits < (structure.hitsMax / 2)
    });

    if (closestDamagedStructure) {
        this.repair(closestDamagedStructure);
        elapsed = Game.cpu.getUsed() - startCpu;
        if( Memory.noticeSettings &&  Memory.noticeSettings['noticeCPU'] && Memory.noticeSettings['noticeCPULevel']) {
            if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                console.log('[CPU]-> tower.repair cpu usage:' + elapsed);
            }
        }
        return true;
    }

    elapsed = Game.cpu.getUsed() - startCpu;
    if( Memory.noticeSettings &&  Memory.noticeSettings['noticeCPU'] && Memory.noticeSettings['noticeCPULevel']){
        if(elapsed > Memory.noticeSettings['noticeCPULevel']){
            console.log('[CPU]-> tower.repair cpu usage:'+elapsed);
        }
    }

    return false;
};
