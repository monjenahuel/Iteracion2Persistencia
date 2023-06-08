const bcrypt = require('bcryptjs')

//Encripta
const encrypt = async (textPlain) => { 
    const hash = await bcrypt.hash(textPlain, 10)
    return hash
}

//Compara
const compare = async (passwordPlain, hashPassword) => {
    return await bcrypt.compare(passwordPlain, hashPassword)
}

module.exports = { encrypt, compare }