'use strict';
module.exports = (sequelize, DataTypes) => {
  const usuario = sequelize.define('usuario', {
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});

  return usuario;
};