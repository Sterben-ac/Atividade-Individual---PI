let usuarioModel = require(`../models/usuarioModel`);

function soNumeros(texto) {
    for (let i = 0; i < texto.length; i++) {
        if (texto[i] < `0` || texto[i] > `9`) {
            return false;
        }
    }
    return true;
}

function cadastrar(req, res) {
    let nome = String(req.body.usuario || ``).trim();
    let email = String(req.body.email || ``).trim();
    let senha = String(req.body.senha || ``);
    let robloxId = String(req.body.robloxId || ``).trim();

    if (nome.length < 3 || nome.length > 20 || nome.includes(` `) || nome.includes(`'`)) {
        res.status(400).json({ campo: `usuario`, mensagem: `Nome de usuário inválido.` });
    } else if (!email.includes(`@`) || !email.includes(`.`) || email.includes(`'`)) {
        res.status(400).json({ campo: `email`, mensagem: `E-mail inválido.` });
    } else if (senha.length < 8 || senha.includes(`'`)) {
        res.status(400).json({ campo: `senha`, mensagem: `A senha precisa ter pelo menos 8 caracteres (e não pode ter aspas simples).` });
    } else if (!soNumeros(robloxId)) {
        res.status(400).json({ campo: `roblox`, mensagem: `O ID do Roblox tem só números.` });
    } else {
        usuarioModel.buscarPorNomeOuEmail(nome, email)
            .then(function (encontrados) {
                for (let i = 0; i < encontrados.length; i++) {
                    if (encontrados[i].nome.toLowerCase() == nome.toLowerCase()) {
                        res.status(409).json({ campo: `usuario`, mensagem: `Esse nome já está em uso.` });
                        return;
                    }
                    if (encontrados[i].email == email) {
                        res.status(409).json({ campo: `email`, mensagem: `Esse e-mail já foi cadastrado.` });
                        return;
                    }
                }
                return usuarioModel.cadastrar(nome, email, senha)
                    .then(function (resultado) {
                        let idUsuario = resultado.insertId;
                        if (robloxId == ``) {
                            res.status(201).json({ idUsuario: idUsuario, usuario: nome, email: email, robloxId: `` });
                            return;
                        }
                        return usuarioModel.vincularRoblox(idUsuario, robloxId)
                            .then(function () {
                                res.status(201).json({ idUsuario: idUsuario, usuario: nome, email: email, robloxId: robloxId });
                            });
                    });
            })
            .catch(function (erro) {
                console.log(`Erro ao cadastrar: ${erro.message}`);
                res.status(500).json({ mensagem: `Erro no banco de dados. Confira se o MySQL está ligado.` });
            });
    }
}

function autenticar(req, res) {
    let login = String(req.body.login || ``).trim();
    let senha = String(req.body.senha || ``);

    if (login == `` || senha == ``) {
        res.status(400).json({ mensagem: `Preencha usuário e senha.` });
        return;
    }
    if (login.includes(`'`) || senha.includes(`'`)) {
        res.status(403).json({ mensagem: `Usuário ou senha incorretos.` });
        return;
    }
    usuarioModel.autenticar(login, senha)
        .then(function (encontrados) {
            if (encontrados.length == 1) {
                let u = encontrados[0];
                res.json({ idUsuario: u.idUsuario, usuario: u.nome, email: u.email, robloxId: u.robloxId || `` });
            } else {
                res.status(403).json({ mensagem: `Usuário ou senha incorretos.` });
            }
        })
        .catch(function (erro) {
            console.log(`Erro ao autenticar: ${erro.message}`);
            res.status(500).json({ mensagem: `Erro no banco de dados. Confira se o MySQL está ligado.` });
        });
}

function vincularRoblox(req, res) {
    let idUsuario = String(req.params.idUsuario);
    let robloxId = String(req.body.robloxId || ``).trim();

    if (robloxId == `` || !soNumeros(robloxId) || !soNumeros(idUsuario)) {
        res.status(400).json({ mensagem: `O ID tem que ter só números.` });
        return;
    }
    usuarioModel.trocarRoblox(idUsuario, robloxId)
        .then(function (resultado) {
            if (resultado.affectedRows == 0) {
                return usuarioModel.vincularRoblox(idUsuario, robloxId);
            }
        })
        .then(function () {
            res.json({ robloxId: robloxId });
        })
        .catch(function (erro) {
            console.log(`Erro ao vincular: ${erro.message}`);
            res.status(500).json({ mensagem: `Erro no banco de dados.` });
        });
}

module.exports = {
    cadastrar,
    autenticar,
    vincularRoblox
};
