require('proto.Creep');
require('populationSettings'); // настройки популяции
require('proto.Spawn'); // основные движухи.

var towersWatch = require('towerControl');

module.exports.loop = function () {

    towersWatch.start();

    for (let spawn in Game.spawns) {
        Game.spawns[spawn].populationControl();
    }
};
