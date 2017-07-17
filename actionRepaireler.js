
module.exports = {
    run:function(creep){
        let startCpu = Game.cpu.getUsed();
        let elapsed;

        if(creep.room.name !== creep.memory.roomID){
            let actRes = creep.moveTo(new RoomPosition(25,25,creep.memory.roomID));
            if (actRes === OK) {
                creep.memory.action= 'traveling back ';
            }
            if( Memory.noticeSettings !== undefined &&  Memory.noticeSettings['noticeCPU'] === true && Memory.noticeSettings['noticeCPULevel']) {
                elapsed = Game.cpu.getUsed() - startCpu;
                if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                    creep.say(Math.round(elapsed,2)+'%');
                }
            }
            return;
        }

        if(creep.carry.energy === creep.carryCapacity){
            creep.memory.working = true;
        }

        if(creep.carry.energy === 0 || !creep.memory.working){

            delete creep.memory.wallID;

            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ) &&  s.store[RESOURCE_ENERGY] > 0
            });

            if (container !== undefined) {
                let actRes = creep.withdraw(container, RESOURCE_ENERGY);

                if ( actRes === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
                else if(actRes === ERR_NOT_ENOUGH_RESOURCES || actRes === ERR_INVALID_TARGET){
                    creep.memory.working = creep.mineEnergy();
                }
            }
            else{

                creep.memory.working = creep.mineEnergy();
            }
        }
        else{
            if(!creep.doRepair()){
                if(!creep.doBuild()){
                    if(!creep.doWallsRampartsRepair()){
                        creep.memory.working = creep.doUpgrade();
                        if( Memory.noticeSettings !== undefined &&  Memory.noticeSettings['noticeCPU'] === true && Memory.noticeSettings['noticeCPULevel']) {
                            elapsed = Game.cpu.getUsed() - startCpu;
                            if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                                creep.say(Math.round(elapsed,2)+'%');
                            }
                        }
                    }
                    else{
                        creep.memory.working = true;
                        if( Memory.noticeSettings !== undefined &&  Memory.noticeSettings['noticeCPU'] === true && Memory.noticeSettings['noticeCPULevel']) {
                            elapsed = Game.cpu.getUsed() - startCpu;
                            if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                                creep.say(Math.round(elapsed,2)+'%');
                            }
                        }
                    }
                }
                else{
                    creep.memory.working = true;
                    if( Memory.noticeSettings !== undefined &&  Memory.noticeSettings['noticeCPU'] === true && Memory.noticeSettings['noticeCPULevel']) {
                        elapsed = Game.cpu.getUsed() - startCpu;
                        if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                            creep.say(Math.round(elapsed,2)+'%');
                        }
                    }
                }
            }
            else{
                if( Memory.noticeSettings !== undefined &&  Memory.noticeSettings['noticeCPU'] === true && Memory.noticeSettings['noticeCPULevel']) {
                    elapsed = Game.cpu.getUsed() - startCpu;
                    if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                        creep.say(Math.round(elapsed,2)+'%');
                    }
                }
                creep.memory.working = true;
            }
        }
    }
};