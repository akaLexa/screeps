var harvester = require('actionHarvest');
module.exports = {
    /**
     * мачете собирать!
     * @param {Creep} creep
     */
    run:function(creep){

        if(creep.resourseRooms.length === 0){
            console.log('[notice]-> no resource rooms, change action to simple harvester');
            harvester.run(creep);
        }
        else {

            if(Memory.resourceRooms === undefined){
                Memory.resourceRooms = [];
                for(let id in creep.resourseRooms){
                    Memory.resourceRooms[id] = 0;
                }
            }

            if (creep.memory.resourceRoomID === undefined) {

                for (let id in creep.resourseRooms) {
                    if (Memory.resourceRooms[id] < creep.resourseRooms[id]['limit']) {
                        creep.memory.resourceRoomID = id;
                        Memory.resourceRooms[id] += 1;
                        console.log('[longHarvest]-> Add ' + creep.memory.role + ' to room [' + creep.resourseRooms[id]['room'] + '], limit: ' + Memory.resourceRooms[id] + '/' + creep.resourseRooms[id]['limit']);
                        break;
                    }
                }
            }

            if(creep.carry.energy === 0 || !creep.memory.working){
                creep.memory.action = 'mine Energy';

                //если в домашней комнате, топаем до места назначения
                if(creep.room.name === creep.memory.roomID){
                    creep.memory.working = false;
                    let exit = creep.room.findExitTo(creep.resourseRooms[creep.memory.resourceRoomID]['room']);
                    let actRes = creep.moveTo(creep.pos.findClosestByRange(exit));

                    if (actRes === OK) {
                        creep.memory.action= 'traveling to ' + creep.resourseRooms[creep.memory.resourceRoomID]['room'];
                        return;
                    }
                }
                else{
                    //пока не набился битком, майнит энергию в комнате назначения
                    creep.memory.working = creep.mineEnergy();
                }
            }

            if(creep.memory.working){
                if(creep.room.name !== creep.memory.roomID){

                    let exit = creep.room.findExitTo(creep.memory.roomID);
                    let actRes = creep.moveTo(creep.pos.findClosestByRange(exit));
                    if (actRes === OK) {
                        creep.memory.action= 'go back to ' + creep.room.name;
                    }
                    return;
                }

                creep.memory.action = 'transfer Energy';

                let structure;
                //все экстеншены ДОЛЖНЫ быть заполнены!
                /*structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) =>  s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
                });*/
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

                if (structure === undefined) {
                    structure = creep.room.storage;
                }
                if (structure !== undefined) {
                    if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(structure);
                    }
                }
                else{
                    console.log('[harvest]-> '+creep.id+' not found empty container for energy');
                }
            }
        }
    }
};