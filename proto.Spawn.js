var actions = {
    harvester: require('actionHarvest'),
    upgrader: require('actionUpgrader'),
    builder: require('actionBuilder'),
    repair: require('actionRepaireler'),
    TowerSupply: require('creepTowerSupply'),
    harvesterLD: require('actionHarvestLD')
};

/**
 * удаление крипов по роли
 * @param role
 * @constructor
 */
StructureSpawn.prototype.DellCreeps = function (role) {
    let nums = 0;
    for(let name in Game.creeps){
        if(Game.creeps[name].memory.role === role){
            Game.creeps[name].suicide();
            nums++;
        }
    }
    console.log('[notice] -> deleting '+ nums +' creep(s)');
    return '';
};

/**
 * убить всех и вся, зачистить память. По сути, сделать ресет крипам. Хард ресет.
 * @returns {string}
 */
StructureSpawn.prototype.killEmAll = function () {

    let nums = 0;
    for(let name in Game.creeps){
        Game.creeps[name].suicide();
        nums++;
    }
    console.log('[notice] -> deleting '+ nums +' creep(s)');
    this.cleanMemoryPopulation();
    this.GetPopulation();
    return '';
};

/**
 * статистика крипов со спавна
 * @returns {string}
 * @constructor
 */
StructureSpawn.prototype.GetPopulation = function () {

    let total = 0;
    if(Memory.population !== undefined){
        for(let role in Memory.population[this.name]){
            let max;
            if(this.population !== undefined){
                if(this.population[role] !== undefined && this.population[role]['limit'] !== undefined){
                    max = this.population[role]['limit'];
                }
                else{
                    max = '?';
                }
            }
            console.log('[population]-> ', role, ': ', Memory.population[this.name][role] + '/' + max);
            total ++;
        }
    }

    if(total === 0){
        console.log('[notice]-> population is empty!');
    }
    return '';
};

/**
 * Расчистить память счетчиков созданных крипов
 */
StructureSpawn.prototype.cleanMemoryPopulation = function () {
    if(Memory.population !== undefined){
        delete Memory.population;
    }
    console.log('Done');
};

/**
 * контроль рождаемости крипов
 */
StructureSpawn.prototype.populationControl = function () {

    //region если совсем нет ничего

    if(Memory.population === undefined){
        Memory.population = {};
    }

    if(Memory.population[this.name] === undefined){
        Memory.population[this.name] = {};
        for(let role in this.population){
            Memory.population[this.name][role] = 0;
        }
    }
    //endregion

    for (let name in Memory.creeps) {

        if (Game.creeps[name] === undefined) {
            Memory.population[this.name][Memory.creeps[name].role]--;

            if(Memory.population[this.name][Memory.creeps[name].role] < 0){
                Memory.population[this.name][Memory.creeps[name].role] = 0;
            }

            if (Memory.creeps[name].resourceRoomID !== undefined) {
                Memory.resourceRooms[Memory.creeps[name].resourceRoomID] -- ;

                if(Memory.resourceRooms[Memory.creeps[name].resourceRoomID] < 0){
                    Memory.resourceRooms[Memory.creeps[name].resourceRoomID] = 0;
                }

                console.log('[memory] -> remove ' + name + ' from ' + Memory.creeps[name].resourceRoomID + ' limit: ' + Memory.resourceRooms[Memory.creeps[name].resourceRoomID]);
            }

            delete Memory.creeps[name];
        }
        else{
            //запуск action'ов
            actions[Memory.creeps[name].role].run(Game.creeps[name]);
        }
    }

    if(!this.spawning){
        for (let role in this.population) {
            if (Memory.population[this.name][role] < this.population[role]['limit']) {
                this.creepCreate(role);
                break;
            }
        }
    }
};

/**
 * конструирование тела крипа
 * @param role
 * @returns {Array}
 */
StructureSpawn.prototype.constructCreepBody = function (role) {
    let returnBody = [];
    if(this.population[role] && this.population[role]['body']){


        let totalEnergy = this.room.energyAvailable;

        for(;;){
            for(let bodyPart in this.population[role]['body']){
                totalEnergy -= BODYPART_COST[this.population[role]['body'][bodyPart]];

                if(totalEnergy >= 0){
                    returnBody[returnBody.length] = this.population[role]['body'][bodyPart];
                }
            }

            if(totalEnergy <= 0){
                if(totalEnergy < 0){
                    returnBody.pop();
                }
                break;
            }
        }

        if(returnBody.length < this.population[role]['body'].length){
            returnBody = this.population[role]['body'];
        }
    }
    else{
        console.log('[creepBody]-> role "'+role+'" is undefined, using defailt [MOVE,CARRY,WORK]');
        returnBody = [MOVE,CARRY,WORK];
    }

    return returnBody;
};

/**
 * создание крипа по роли
 * @param role
 */
StructureSpawn.prototype.creepCreate = function (role) {
    if(this.spawning){
       console.log(this.spawning);
        return;
    }
    if(this.population[role] && this.population[role]['body']){
        let creepBody = this.constructCreepBody(role);
        let pref = new Date();
        let tmp = this.canCreateCreep(creepBody, this.population[role]['pref'] + '_'+ pref.getTime());

        if( tmp === OK){
            let cName = this.createCreep(creepBody,this.population[role]['pref'] + '_'+pref.getTime(),{'role':role});

            if(cName !== undefined && _.isString(cName)){
                console.log('[create]-> new creep: '+ role);
                //Game.creeps[cName].memory.spawnID = this.name;
                Game.creeps[cName].memory.roomID = Game.creeps[cName].room.name;
                Memory.population[this.name][role] += 1;
            }
        }
    }
    else{
        console.log('[create]-> unknown role "' + role +'". Creation aborted');
    }
    return '';
};


