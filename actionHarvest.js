/**
var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 2) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }
    
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }
    
     var tower = Game.getObjectById('2b1ccec7009a39716be7ad3d');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
*/
module.exports = {
    /**
     * мачете собирать!
     * @param {Creep} creep
     */
    run:function(creep){

        if(creep.carry.energy === 0 || !creep.memory.working){
            creep.memory.action = 'mine Energy';
            creep.memory.working = creep.mineEnergy();
        }

        if(creep.memory.working){
            creep.memory.action = 'transfer Energy';
            let structure;

            //все экстеншены ДОЛЖНЫ быть заполнены!
            structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) =>  s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
            });

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
        }
    }
};