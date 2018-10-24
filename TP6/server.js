var http = require('http')
var url = require('url')
var pug = require('pug')
var fs = require('fs')
var jsonfile = require('jsonfile')

var {parse} = require('querystring')

var myBD = "tarefas.json"

var myServer = http.createServer((req,res)=>{
    var purl = url.parse(req.url, true)
    var query = purl.query

    console.log('Recebi o pedido: ' + purl.pathname)
    console.log('Com o metodo: ' + req.method)

    if(req.method == 'GET'){
        if(purl.pathname == '/'||purl.pathname == '/index'){
            jsonfile.readFile(myBD, (erro, tarefas) => {
                if(!erro){ 
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(pug.renderFile('lista-tarefas.pug', {lista: tarefas}))
            res.end()
                }else{
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(pug.renderFile('erro.pug', {e: "Erro na leitura da BD"}))
                    res.end()
                }
            })
        }
        if(purl.pathname == '/registo'){
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(pug.renderFile('form-tarefa.pug'))
            res.end()
        }

        else if (purl.pathname.includes('/remover')){   
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
           var index = purl.pathname.split('/')[2]
           var newTasks = []
           recuperaInfo(req, resultado =>{
            jsonfile.readFile(myBD, (erro, tarefas)=>{
                if(!erro){
                    tarefas.forEach(function(entry, i) {
                        if(i==index){
                            entry.estado = 0;
                            
                        }
                        newTasks.push(entry)
                        console.log(i);
                    });
                    jsonfile.writeFile(myBD, newTasks, erro =>{
                        if(erro){
                            console.log("Erro na escrita da BD "+ erro)
                        }else{
                            console.log("Registo gravado com sucesso")
                        }
                    })
                    
                res.end(pug.renderFile('lista-tarefas.pug', {lista:newTasks}))
                    /*
                    tarefas.push(resultado)
                    //console.div(alunos)
                    jsonfile.writeFile(myBD, tarefas, erro =>{
                        if(erro){
                            console.log("Erro na escrita da BD "+ erro)
                        }else{
                            console.log("Registo gravado com sucesso")
                        }
                    })*/
                }
            }) 
        })
           console.log("Remover a tarefa do indice "+ index)

        }
        else if (purl.pathname == '/processaForm'){
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(pug.renderFile('tarefa-recebido.pug', {aluno: query}))
            res.end()
        }
        else if (purl.pathname == '/lista'){ 
            jsonfile.readFile(myBD, (erro, tarefas) => {
                if(!erro){ 
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(pug.renderFile('lista-tarefas.pug', {lista: tarefas}))
            res.end()
                }else{
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(pug.renderFile('erro.pug', {e: "Erro na leitura da BD"}))
                    res.end()
                }
            }) 
        }
        
        else if (purl.pathname == '/w3.css'){
            res.writeHead(200, {'Content-Type': 'text/css'})
            fs.readFile('stylesheets/w3.css', (erro, dados)=>{
                if(!erro) res.write(dados)
                else res.write(pug.renderFile('erro.pug', {e: erro}))
                res.end()
            })
        }
        else{
           /* res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(pug.renderFile('erro.pug', {e: "Erro: "+purl.pathname+" não está implementado"}))
            res.end()*/
        }

    }else if(req.method == 'POST'){
        if(purl.pathname == '/processaForm'){
            recuperaInfo(req, resultado =>{
                jsonfile.readFile(myBD, (erro, tarefas)=>{
                    if(!erro){
                        tarefas.push(resultado)
                        //console.div(alunos)
                        jsonfile.writeFile(myBD, tarefas, erro =>{
                            if(erro){
                                console.log("Erro na escrita da BD "+ erro)
                            }else{
                                console.log("Registo gravado com sucesso")
                            }
                        })
                    }
                })
                res.end(pug.renderFile('tarefa-recebido.pug', {aluno:resultado}))
            })
        }else{ 
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(pug.renderFile('erro.pug', {e: "Erro: "+purl.pathname+" não está implementado"}))
            res.end()
        }

    }else{
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(pug.renderFile('erro.pug', {e: "Metodo nao suportado: "+purl.pathname+" não está implementado"}))
        res.end()
    }

})
myServer.listen(4006, ()=>{
    console.log('servidor à escuta na porta 4006...')
})
function recuperaInfo(request, callback){
    if(request.headers['content-type'] === 'application/x-www-form-urlencoded'){
        let body = ''
        request.on('data', bloco =>{
            body = bloco.toString()
        })
        request.on('end', ()=>{
            callback(parse(body))
        })
    }else{
        callback(null)
    }
}