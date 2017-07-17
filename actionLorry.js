module.exports = {
    /**
     * развозит энергию по спавнам и/или заполняет все контенеры из стораджа
     * @param {Creep} creep
     */
    run:function(creep){

        let startCpu = Game.cpu.getUsed();
        let elapsed;

        if(creep.carry.energy === creep.carryCapacity){
            creep.memory.working = true;
        }
        else if(creep.carry.energy === 0){
            creep.memory.working = false;
        }

        if(creep.carry.energy === 0 || !creep.memory.working){
            let target;
            creep.memory.action = 'looking for Energy';
            //если есть стораджи и в них есть что брать
            if (creep.room.controller.level > 3) {

                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_LINK && s.energy > 0
                });
                creep.memory.getFrom = STRUCTURE_LINK;

                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] < s.storeCapacity
                    });
                    creep.memory.getFrom = STRUCTURE_STORAGE;
                }
                //если нет стораджей, идем в линки, если есть, конечно

            }
            else{
                // если нет ничего выше перечисленного, идем в контенеры и берем оттуда энергию
                if(!target){
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) =>  s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY]  > 0
                    });
                    creep.memory.getFrom = STRUCTURE_CONTAINER;
                }
            }

            if(target !== undefined){
                let actRes = creep.withdraw(target, RESOURCE_ENERGY);
                if (actRes === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }

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

            //все экстеншены ДОЛЖНЫ быть заполнены!
            structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) =>  s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
            });

            if(!structure && creep.memory.getFrom !== STRUCTURE_CONTAINER){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_CONTAINER &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
            }

            //если позволяет развитие, то таскаем в контейнеры
            if(!structure && creep.room.controller.level > 3){

                //заполнили контейнеры, заполняем сторадж
                if(!structure && creep.memory.getFrom !== STRUCTURE_STORAGE){
                    structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => s.structureType === STRUCTURE_STORAGE &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                    });
                }
            }

            // ищем ближийший накопитель
            if(!structure){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_TOWER) && s.energy < s.energyCapacity
                });
            }

            if (structure !== undefined) {
                if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
                //creep.memory.targetID = structure.id;
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