/**
 * добыча энергии
 * @returns {boolean}
 */
Creep.prototype.mineEnergy = function () {
        let source;
        this.memory.action='mine Energy';

        if(this.memory.resID){
            source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE,{filter: s => s.id === this.memory.resID});
        }

        if(!source){
            if(this.memory.badResID){
                source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE,{filter: s => s.id !== this.memory.badResID});
            }

            if(!source){
                source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            }
        }

        /*if(!source && this.memFlags.length>0){
            if(this.moveTo(Game.flags[this.memFlags[0]]) === OK){
                this.say('traveling');
                source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            }
            return false;
        }*/

        let actResult = this.harvest(source);
        if ( actResult === ERR_NOT_IN_RANGE) {
            this.moveTo(source);
        }
        else if(actResult === OK){
            delete this.memory.badResID;
            this.memory.resID = source.id;
        }
        else if (actResult === ERR_NOT_ENOUGH_RESOURCES
            //|| actResult === ERR_INVALID_TARGET
            || actResult === ERR_NOT_OWNER){
            this.memory.badResID = this.memory.resID;
            delete this.memory.resID;
        }

        return this.carry.energy === this.carryCapacity;
    };

/**
 * абгрейд контроллера
 * @returns {boolean}
 */
Creep.prototype.doUpgrade = function () {

    if(this.carry.energy === 0){
        return false;
    }
    this.memory.action='upgrading...';

    if(this.upgradeController(this.room.controller) === ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller);
    }
    return true;
};
/**
 * Починка
 * @returns {boolean}
 */
Creep.prototype.doRepair = function(){

    let targets = [];

    if(this.memory.repObj !== undefined && Game.getObjectById(this.memory.repObj).hits <= (Game.getObjectById(this.memory.repObj).hitsMax/1.5)){
        targets[0] = Game.getObjectById(this.memory.repObj);
        delete this.memory.repObj;
    }

    if(targets.length<1){
        targets = this.room.find(FIND_STRUCTURES, {
            filter: object =>
            object.structureType !== STRUCTURE_WALL
            && object.structureType !== STRUCTURE_RAMPART
            && object.hits < (object.hitsMax/2)
        });
        targets.sort((a,b) => a.hits - b.hits);
    }

    if (targets.length > 0) {
        this.memory.action = 'repair';
        this.memory.repObj = targets[0].id;
        if (this.repair(targets[0]) === ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        if (targets[0].hits > (targets[0].hitsMax / 2)) {
            delete this.memory.repObj;
        }
        return true;
    }
    this.memory.action = '?';
    return false;

};
/**
 * Чинить стены и рампарты
 * @returns {boolean}
 */
Creep.prototype.doWallsRampartsRepair = function(){
    let targets = [];

    if(this.memory.wallID && Game.getObjectById(this.memory.wallID).hits < Game.getObjectById(this.memory.wallID).hitsMax/2){
        targets[0] = Game.getObjectById(this.memory.wallID);
    }
    else{
        targets = this.room.find(FIND_STRUCTURES, {
            filter: object => (object.structureType === STRUCTURE_RAMPART || object.structureType === STRUCTURE_WALL) && object.hits < (object.hitsMax/2)
        });

        targets.sort((a,b) => a.hits - b.hits);
    }

    if(targets.length>0) {
        let actResult = this.repair(targets[0]);
        if (actResult === ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        else if(actResult === OK){
            this.memory.wallID = targets[0].id;
        }
        this.memory.action = 'Wall repair';
        return true;
    }

    return false;
};
/**
 * Строительство
 * @returns {boolean}
 */
Creep.prototype.doBuild = function () {

    const target = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    if (target) {
        if (this.build(target) === ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }
        this.memory.action = 'build';
        return true;
    }
    return false;
};

/**
 * Массив с комнатами для добычи ресов и лимитами
 * @type {Array}
 */
Creep.prototype.resourseRooms = [];