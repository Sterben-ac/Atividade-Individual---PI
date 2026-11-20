let robloxModel = require(`../models/robloxModel`);

function idValido(id) {
    if (id == undefined || id == ``) {
        return false;
    }
    for (let i = 0; i < id.length; i++) {
        if (id[i] < `0` || id[i] > `9`) {
            return false;
        }
    }
    return true;
}

function responderErro(res, erro) {
    console.log(`  erro: ${erro.message}`);
    if (erro.status == 404) {
        res.status(404).json({ erro: `Jogador não encontrado`, detalhe: erro.message });
    } else {
        res.status(502).json({ erro: `Não foi possível falar com o Roblox agora`, detalhe: erro.message });
    }
}

function perfil(req, res) {
    let id = req.params.id;
    if (!idValido(id)) {
        res.status(400).json({ erro: `ID inválido` });
        return;
    }
    robloxModel.perfil(id)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            responderErro(res, erro);
        });
}

function amigos(req, res) {
    let id = req.params.id;
    if (!idValido(id)) {
        res.status(400).json({ erro: `ID inválido` });
        return;
    }
    robloxModel.amigos(id)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            responderErro(res, erro);
        });
}

function favoritos(req, res) {
    let id = req.params.id;
    if (!idValido(id)) {
        res.status(400).json({ erro: `ID inválido` });
        return;
    }
    robloxModel.favoritos(id)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            responderErro(res, erro);
        });
}

function emblemas(req, res) {
    let id = req.params.id;
    if (!idValido(id)) {
        res.status(400).json({ erro: `ID inválido` });
        return;
    }
    let inicio = Number(req.query.inicio) || 0;
    let quantidade = Number(req.query.quantidade) || 100;
    if (quantidade > 300) {
        quantidade = 300;
    }
    robloxModel.emblemas(id, inicio, quantidade)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            responderErro(res, erro);
        });
}

function buscar(req, res) {
    let texto = String(req.query.nome || ``).trim();
    if (texto == ``) {
        res.status(400).json({ erro: `Digite um nome ou ID` });
        return;
    }
    robloxModel.buscar(texto)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            responderErro(res, erro);
        });
}

module.exports = {
    perfil,
    amigos,
    favoritos,
    emblemas,
    buscar
};
