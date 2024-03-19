const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron')
const path = require('node:path')
const { conectar, desconectar } = require('./db')
const { error } = require('node:console')
const Tarefa = require(`${__dirname}/src/models/Tarefa`)

let win
const createWindow = () => {

    win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        title: "Tutorial Electron",

        icon: `${__dirname}/src/public/img/pc.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile(`${__dirname}/src/views/index.html`)

    const menuPersonalizado = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menuPersonalizado)
}

let about

const aboutWindow = () => {

    if (!about) {

        about = new BrowserWindow({
            width: 360,
            height: 320,
            resizable: false,
            title: "Sobre",
            autoHideMenuBar: true,
            icon: `${__dirname}/src/public/img/pc.png`
        })

        about.loadFile(`${__dirname}/src/views/sobre.html`)

        about.on('closed', () => {
            about = null
        })
    }
}


app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})


const menuTemplate = [

    {
        label: 'Arquivo',
        submenu: [
            {
                label: 'Sair',
                click: () => app.quit(),
                accelerator: 'Alt+F4'
            }
        ]
    },

    {
        label: 'Exibir',
        submenu: [
            {
                label: 'Recarregar',
                role: 'Reload'
            },
            {
                label: 'Ferramentas do Desenvolvedor',
                role: 'toggleDevTools'
            },
            {
                type: 'separator'
            },
            {
                label: 'Aplicar Zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir Zoom',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar o Zoom padrão',
                role: 'resetZoom'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Documentos',
                click: () => shell.openExternal("https://www.electronjs.org/pt/docs/latest/")
            },
            {
                type: 'separator'
            },
            {
                label: 'Sobre',
                click: aboutWindow
            }
        ]
    }
]

ipcMain.on('send-message', (event, message) => {
    console.log("Processo Principal recebeu uma mensagem: ", message)

    event.sender.send('receive-message', "Olá! Renderizador!")
})

app.on('before-quit', async () => {
    await desconectar()
})

ipcMain.on('send-message', (event, message) => {
    console.log("<<<", message)
    statusConexao()
})


const statusConexao = async () => {
    try {
        await conectar()
        win.webContents.send('db-status', "Banco de Dados conectado")
    } catch (error) {
        win.webContents.send('db-status', `Erro de conexão: ${error.message}`)
    }
}

ipcMain.on('new-task', async (event, args) => {
    console.log(args)


    if (args.nome === "") {
        dialog.showMessageBox(win, {
            type: "info",
            message: 'Preencha o nome da tarefa',
            buttons: ['OK']
        })
    } else {
        dialog.showMessageBox(win, {
            type: "info",
            message: 'Preencha o Telefone',
            buttons: ['OK']
        })
        const novaTarefa = new Tarefa(args)
        await novaTarefa.save()

        event.reply('new-task-created', JSON.stringify(novaTarefa))
    }
})

ipcMain.on('get-tasks', async (event, args) => {
    const tarefasPendentes = await Tarefa.find()
    console.log(tarefasPendentes)


    event.reply('pending-tasks', JSON.stringify(tarefasPendentes))
})


ipcMain.on('update-task', async (event, args) => {
    console.log(args)


    if (args.nome === "") {
        dialog.showMessageBox(win, {
            type: "info",
            message: 'Preencha o Nome da Pessoa',
            buttons: ['OK']
        })
    } else if (args.fone === "") {
        dialog.showMessageBox(win, {
            type: "info",
            message: 'Preencha o Telefone',
            buttons: ['OK']
        })
    } else {
        const tarefaEditada = await Tarefa.findByIdAndUpdate(
            args.idTarefa, {
            nome: args.nome,
            fone: args.fone,
            email: args.email
        },
            {
                new: true
            }
        )

        event.reply('update-task-success', JSON.stringify(tarefaEditada))
    }
})


ipcMain.on('delete-task', async (event, args) => {
    console.log(args)

    const { response } = await dialog.showMessageBox(win, {
        type: 'warning',
        buttons: ['Cancelar', 'Excluir'],
        title: 'Confirmação de exclusão',
        message: 'Tem certeza de que deseja excluir esta Tarefa?'
    })

    console.log(response)
    if (response === 1) {
        const tarefaExcluida = await Tarefa.findByIdAndDelete(args)
        event.reply('delete-task-success', JSON.stringify(tarefaExcluida))

    }
})