module.exports = {
    /**
     * мачете собирать!
     * @param {Creep} creep
     */
    run:function(creep){

        let startCpu = Game.cpu.getUsed();
        let elapsed;

        if(creep.carry.energy === 0 || !creep.memory.working){
            creep.memory.action = 'mine Energy';
            creep.memory.working = creep.mineEnergy();
            if( Memory.noticeSettings !== undefined &&  Memory.noticeSettings['noticeCPU'] === true && Memory.noticeSettings['noticeCPULevel']) {
                elapsed = Game.cpu.getUsed() - startCpu;
                if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                    creep.say(Math.round(elapsed,2)+'%');
                   // console.log('[CPU]-> creep.harvest action: mine energy, cpu usage:' + elapsed);
                }
            }
        }

        if(creep.memory.working){
            creep.memory.action = 'transfer Energy';
            let structure;

            /*if(Memory.population[creep.memory.spawn]['lorry'] === undefined || Memory.population[creep.memory.spawn]['lorry'] === 0 ){
                //все экстеншены ДОЛЖНЫ быть заполнены!
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) =>  s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
                });
            }*/



            // ищем ближийший накопитель
            if(!structure){
                structures = creep.pos.findInRange(FIND_STRUCTURES, 3,{
                    filter: (s) => ((s.structureType === STRUCTURE_SPAWN
                    || s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_TOWER)
                    && s.energy < s.energyCapacity)
                    || ((s.structureType === STRUCTURE_CONTAINER) && s.store[RESOURCE_ENERGY] < s.storeCapacity)
                });

                if(structures.length > 0){
                    structure = structures[0];
                }
            }

            //если уровень контроллера позволяет строить стораджи, то забиваем только их!
            if (!structure ){
                if(creep.room.controller.level>3){
                    structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => s.structureType === STRUCTURE_STORAGE &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                    });
                }
            }

            // если все забили, то забиваем все подряд, что еще не наполнено
            if (!structure){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => ((s.structureType === STRUCTURE_SPAWN
                    || s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_TOWER)
                    && s.energy < s.energyCapacity)
                    || ((s.structureType === STRUCTURE_CONTAINER) && s.store[RESOURCE_ENERGY] < s.storeCapacity)
                });
            }

            // совсем на худой конец, есть башни и спауны
            if (structure === undefined) {
                structure = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });

            }

            if (structure === undefined) {
                structure = creep.room.storage;
            }
            if (structure !== undefined) {
                if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
            else{
                console.log('[notice] -> '+creep.id+' not found empty container for energy');
            }
            if( Memory.noticeSettings  !== undefined &&  Memory.noticeSettings['noticeCPU']=== true && Memory.noticeSettings['noticeCPULevel']) {
                elapsed = Game.cpu.getUsed() - startCpu;
                if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                    creep.say(Math.round(elapsed,2)+'%');
                   // console.log('[CPU]-> creep.harvest action: transfer energy, cpu usage:' + elapsed);
                }
            }
        }
    }
};