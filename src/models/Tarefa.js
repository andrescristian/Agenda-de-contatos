const {model, Schema} = require('mongoose')

const tarefaSchema = new Schema({
    nome: {
        type: String
    },
    fone: {
        type: Number
    },
    email:{
        type: String
    }
})

module.exports = model('Contatos', tarefaSchema)
