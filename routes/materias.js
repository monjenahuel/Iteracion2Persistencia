var express = require("express");
var router = express.Router();
var models = require("../models");
const logger = require('../logs/logger')

router.get("/", (req, res,next) => {


  models.materia.findAll({attributes: ["id","nombre","id_carrera", "id_profesor"],
      
      include:[
        {as:'Carrera-Relacionada', model:models.carrera, attributes: ["id","nombre"]},
        {as:'Profesor-Relacionado', model:models.profesor, attributes: ["id","nombre"]}
      ]

    }).then(materias => res.send(materias)).catch(error => { 
      logger.error(`Error al acceder a las materias`)
      return next(error)
    });
});


router.post("/", (req, res) => {
  models.materia
    .create({ nombre: req.body.nombre,id_carrera:req.body.id_carrera,id_profesor:req.body.id_profesor })
    .then(materia => {
      logger.info(`Materia creada con exito ID: ${materia.id}`)
      res.status(201).send({ id: materia.id })
    })
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        let msg = 'Bad request: existe otra materia con el mismo nombre'
        res.status(400).send(msg)
        logger.error(msg)
      }
      else {
        let msg = `Error al intentar insertar en la base de datos: ${error}`
        logger.error(msg)
        logger.error(msg)
        res.sendStatus(500)
      }
    });
});

const findmateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne({
      attributes: ["id","nombre","id_carrera", "id_profesor"],
      where: { id },
      include:[
        {as:'Carrera-Relacionada', model:models.carrera, attributes: ["id","nombre"]},
        {as:'Profesor-Relacionado', model:models.profesor, attributes: ["id","nombre"]}
      ]
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findmateria(req.params.id, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => {
      logger.error("Materia no encontrada")
      res.sendStatus(404)
    },
    onError: () => {
      logger.error("Error al acceder a la materia")
      res.sendStatus(500)
    }
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .update({nombre: req.body.nombre,id_carrera:req.body.id_carrera,id_profesor:req.body.id_profesor}, { fields: ["nombre", "id_carrera", "id_profesor"] })
      .then(() => {
        logger.info(`Materia ID:${materia.id} actualizada`)
        res.sendStatus(200)
      })
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          let msg = 'Bad request: existe otra materia con el mismo nombre'
          logger.error(msg)
          res.status(400).send(msg)
        }
      });
    
      findmateria(req.params.id, {
    onSuccess,
    onNotFound: () => {
      logger.error("Materia no encontrada")
      res.sendStatus(404)
    },
    onError: () => {
      let msg = `Error al intentar actualizar la base de datos`
      logger.error(msg)
      res.sendStatus(500)
    }
  });
});

// router.delete("/:id", (req, res) => {
//   const onSuccess = materia =>
//     materia
//       .destroy()
//       .then(() => {
//         logger.info(`Materia ID: ${materia.id} eliminada`)
//         res.sendStatus(200)
//       });
//   findmateria(req.params.id, {
//     onSuccess,
//     onNotFound: () => {
//       logger.error("Materia no encontrada")
//       res.sendStatus(404)
//     },
//     onError: () => {
//       logger.error(`Error al eliminar materia`)
//       res.sendStatus(500)
//     }
//   });
// });

// router.delete("/:id", (req, res) => {
//   const onSuccess = materia =>
//     materia
//       .destroy()
//       .then(() => res.sendStatus(200))
//       .catch(() => res.sendStatus(500));
//   findmateria(req.params.id, {
//     onSuccess,
//     onNotFound: () => res.sendStatus(404),
//     onError: () => res.sendStatus(500)
//   });
// });

module.exports = router;
