var express = require("express");
var router = express.Router();
var models = require("../models");
const { encrypt, compare } = require("../handlers/handlerBcryptjs.js");
const { generateToken, verifyToken } = require("../handlers/handlerJWT.js");

router.get("/", (req, res) => {
    models.usuario
        .findAll({
            attributes: ["id", "email"],
        })
        .then((usuarios) => res.send(usuarios))
        .catch(() => res.sendStatus(500));
});

const findusuario = (id, { onSuccess, onNotFound, onError }) => {
    models.usuario
        .findOne({
            attributes: ["id", "email"],
            where: { id },
        })
        .then((usuario) => (usuario ? onSuccess(usuario) : onNotFound()))
        .catch(() => onError());
};

router.get("/:id", (req, res) => {
    findusuario(req.params.id, {
        onSuccess: (usuario) => res.send(usuario),
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500),
    });
});

const validateUser = async (
    email,
    password,
    { onSuccess, onIncorrectCredentials, onError }
) => {
    try {
        let user = await models.usuario.findOne({
            attributes: ["id", "email", "password"],
            where: { email },
        });

        if (!user) onIncorrectCredentials();

        let checkedPassword = await compare(password, user.password);

        if (checkedPassword) {
            let usuario = {
                id: user.id,
                email: user.email,
                token: generateToken(user.id),
            };
            onSuccess(usuario);
        } else {
            onIncorrectCredentials();
        }
    } catch (error) {
        onError();
    }
};

router.post("/login", (req, res) => {
    validateUser(req.body.email, req.body.password, {
        onSuccess: (usuario) => res.send(usuario),
        onIncorrectCredentials: () =>
            res.status(401).send("Credenciales invalidas"),
        onError: () => res.sendStatus(500),
    });
});

router.post("/", async (req, res) => {
    //JWT Implemented
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Token no encontrado" });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: "Token inválido" });
    }

    //Si el token es valido ->

    let { email, password } = req.body;

    password = await encrypt(password);

    models.usuario
        .create({ email: email, password: password })
        .then((usuario) => res.status(201).send({ id: usuario.id }))
        .catch((error) => {
            if (error == "SequelizeUniqueConstraintError: Validation error") {
                res.status(400).send(
                    "Bad request: existe otra usuario con el mismo nombre"
                );
            } else {
                console.log(
                    `Error al intentar insertar en la base de datos: ${error}`
                );
                res.sendStatus(500);
            }
        });
});

router.put("/:id", (req, res) => {
    const onSuccess = (usuario) =>
        usuario
            .update(
                { email: req.body.email, password: req.body.password },
                { fields: ["email", "password"] }
            ) //ToDo: Se puede updatear pass en PUT?
            .then(() => res.sendStatus(200))
            .catch((error) => {
                if (
                    error == "SequelizeUniqueConstraintError: Validation error"
                ) {
                    res.status(400).send(
                        "Bad request: existe otra usuario con el mismo email"
                    );
                } else {
                    console.log(
                        `Error al intentar actualizar la base de datos: ${error}`
                    );
                    res.sendStatus(500);
                }
            });
    findusuario(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500),
    });
});

router.delete("/:id", (req, res) => {
    const onSuccess = (usuario) =>
        usuario
            .destroy()
            .then(() => res.sendStatus(200))
            .catch(() => res.sendStatus(500));
    findusuario(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500),
    });
});

module.exports = router;
