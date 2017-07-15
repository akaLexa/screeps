require('proto.Creep');
require('proto.Spawn');
require('proto.Tower');

require('populationSettings'); // настройки популяции
require('harvesterLDSettings');//настройки харвестеров на длинные дистанции

module.exports.loop = function () {

    //region башни
    let towersCount = 0;
    let towers = _.filter(Game.structures, function (s) {
        towersCount++;
        return s.structureType === STRUCTURE_TOWER
    });

    if (towers) {
        let i = 1;
        for (let tower of towers) {

            if(towersCount>1){

                if(i % 2 === 1){
                    tower.defend();
                }
                else{
                    tower.doRepair();
                }
            }
            else{
                if(!tower.defend()){
                    tower.doRepair();
                }
            }
            i++;
        }
    }
    //endregion

    for (let spawn in Game.spawns) {
        Game.spawns[spawn].populationControl();
    }
};
