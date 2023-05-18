'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesor = sequelize.define('profesor', {
    nombre: DataTypes.STRING,
  }, {});

  //codigo de asociacion  (tiene muchos:)
  profesor.associate = function(models) {
  	profesor.hasMany(models.materia,  // Modelo al que pertenece
    {
      as: 'materias',                 // nombre de mi relacion
      foreignKey: 'id_profesor'       // campo con el que voy a igualar 
    })
  };

  return profesor;
};