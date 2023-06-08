const jwt = require("jsonwebtoken");

const jwtConfig = {
    secretKey: 'EstrategiasDePersistenciaPrimerCuatrimestre2023Grupo6&Knuckles',
    expiresIn: '1h'
};

function generateToken(userId) {
    return jwt.sign({userId}, jwtConfig.secretKey, {
        expiresIn: jwtConfig.expiresIn
    });
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, jwtConfig.secretKey);
        return decoded;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { generateToken, verifyToken }
