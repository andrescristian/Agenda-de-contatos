const {ipcRenderer} = require('electron')

ipcRenderer.send('send-message', "Status do Banco de Dados:")
ipcRenderer.on('db-status', (event, status) => {
    console.log(status)
    if (status === "Banco de Dados conectado"){
        document.getElementById("status").src = "../public/img/dbon.png"
    } else {
        document.getElementById("status").src = "../public/img/dboff.png"
    }
})

let formulario, nomeTarefa, descricaoTarefa, lista, emailAgenda
formulario = document.querySelector("#frmTarefas")
nomeTarefa = document.querySelector("#txtTarefa")
descricaoTarefa = document.querySelector("#txtDescricao")
emailAgenda = document.querySelector("#txtEmail")

lista = document.querySelector("#agendaTarefas") 
let arrayTarefas = []  
let updateStatus = false 
let idTarefa 

formulario.addEventListener("submit", async (event) =>{
    event.preventDefault() 
    const tarefa = {
        nome: nomeTarefa.value,
        fone: descricaoTarefa.value,
        email: emailAgenda.value 
    }
    if (updateStatus === false){

        ipcRenderer.send('new-task', tarefa)
        } else {
            ipcRenderer.send('update-task', {...tarefa, idTarefa})
        }
    formulario.reset() 
})

ipcRenderer.on('new-task-created', (event, args) =>{
    
    const novaTarefa = JSON.parse(args)
    arrayTarefas.push(novaTarefa)
    renderizarTarefas(arrayTarefas)
})

function editarTarefa(id){
    const ordenacao = {nome: 1}
    updateStatus = true 
    idTarefa = id       
    const tarefaEditada = arrayTarefas.find(arrayTarefas => arrayTarefas._id === id)
    nomeTarefa.value = tarefaEditada.nome
    descricaoTarefa.value = tarefaEditada.fone
    emailAgenda.value =  tarefaEditada.email
}

ipcRenderer.on('update-task-success', (event, args) => {
    const tarefaEditada = JSON.parse(args)
    arrayTarefasEditadas = arrayTarefas.map(t => {      
        if (t._id === tarefaEditada._id) {
            t.nome = tarefaEditada.nome,
            t.fone = tarefaEditada.fone,
            t.email = tarefaEditada.email
        }
        return t
    })
    renderizarTarefas(arrayTarefasEditadas)
    updateStatus = false   
})

function excluirTarefa(id){
    ipcRenderer.send('delete-task', id)
}

ipcRenderer.on('delete-task-success', (event, args) => {
    const tarefaEliminada = JSON.parse(args)
    const listaAtualizada = arrayTarefas.filter((t) => {
        return t._id !== tarefaEliminada._id
    })
    arrayTarefas = listaAtualizada
    renderizarTarefas(arrayTarefas)
})

ipcRenderer.send('get-tasks')

ipcRenderer.on('pending-tasks', (event, args) =>{
    const tarefasPendentes = JSON.parse(args)
    arrayTarefas = tarefasPendentes
    renderizarTarefas(arrayTarefas)
})

function renderizarTarefas(tasks){
    tasks.sort((a, b) => {
        if (a.nome < b.nome) return -1;
        if (a.nome > b.nome) return 1;
        return 0;
    });
    
    lista.innerHTML = "" 
    tasks.forEach((t) => {
        lista.innerHTML += `
        <tr>
            <td id="id"> ${t._id}</td>
            <td> ${t.nome}</td>
            <td> ${t.fone}</td>
            <td> ${t.email} </td>
            <td> <button id="botao" onclick="editarTarefa('${t._id}')">Editar</button></td>
            <td> <button onclick="excluirTarefa('${t._id}')">Excluir</button></td>        
        </tr>
          `     
    });
}
