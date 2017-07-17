StructureLink.prototype.sendEnergy = function (toLink) {
  if(this.energy > (this.energyCapacity/2)
      && toLink.energy < this.energyCapacity){
      let result = this.transferEnergy(toLink);
      if(result === OK){
          console.log('[notice]-> energy was linked');
      }
  }
};
