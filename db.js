const mongoose = require('mongoose')

//let url

const conectar = async () => {

    try {
        await mongoose.connect(url) 
        console.log("MongoDB Conectado")
    } catch (error) {
        console.log("Problema Detectado: ", error.message)
        throw error

    }
}

const desconectar = async () => {
    try {
        await mongoose.disconnect(url) 
        console.log("Desconectado do MongoDB")
    } catch (error) {
        console.log("Problema Detectado: ", error.message)
        throw error
    }
}

module.exports = {conectar,desconectar}