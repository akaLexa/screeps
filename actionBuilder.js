var harvester = require('actionHarvest');
var upgrader = require('actionUpgrader');

module.exports = {
    run:function(creep){

        if(creep.room.name !== creep.memory.roomID){
            let actRes = creep.moveTo(new RoomPosition(25,25,creep.memory.roomID));
            if (actRes === OK) {
                creep.memory.action= 'traveling back ';
            }
            return;
        }

        var carry = _.sum(creep.carry);
        if(carry < creep.carryCapacity && (creep.memory.working == false || creep.memory.working == undefined)){
            
            var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE ) &&  s.store[RESOURCE_ENERGY] > 0 
            });
            
            if (container != undefined) {
               
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                   
                    creep.moveTo(container);
                }
            }
            else{
                 harvester.run(creep);
            }
        }
        else{
            
            if(carry == 0){
                creep.memory.working = false;
            }
            else{
                creep.memory.working = true;
                const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if(target) {
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else{
                   upgrader.run(creep);
                }
            }
        }
    }
};