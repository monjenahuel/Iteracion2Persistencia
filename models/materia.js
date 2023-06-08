'use strict';
module.exports = (sequelize, DataTypes) => {
  const materia = sequelize.define('materia', {
    nombre: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER
  }, {});
  materia.associate = function(models) {
    
    materia.belongsTo(models.profesor// modelo al que pertenece
    ,{
      as : 'Profesor-Relacionado',  // nombre de mi relacion
      foreignKey: 'id_profesor',
      targetKey: 'id',     // campo con el que voy a igualar
    })
    
    //asociacion a carrera (pertenece a:)
  	materia.belongsTo(models.carrera// modelo al que pertenece
    ,{
      as : 'Carrera-Relacionada',  // nombre de mi relacion
      foreignKey: 'id_carrera',
      targetKey: 'id',     // campo con el que voy a igualar
    })
  	/////////////////////



  };
  return materia;
};