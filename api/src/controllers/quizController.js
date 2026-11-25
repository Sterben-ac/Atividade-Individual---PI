let quizModel = require(`../models/quizModel`);

function salvar(req, res) {
    let idUsuario = Number(req.body.idUsuario);
    let acertos = Number(req.body.acertos);
    let total = Number(req.body.total);
    let respostas = req.body.respostas;

    if (!idUsuario || isNaN(acertos) || !total || !Array.isArray(respostas)) {
        res.status(400).json({ mensagem: `Dados da tentativa incompletos.` });
        return;
    }
    if (acertos < 0 || acertos > total || respostas.length != total) {
        res.status(400).json({ mensagem: `Dados da tentativa inválidos.` });
        return;
    }
    quizModel.salvarTentativa(idUsuario, acertos, total)
        .then(function (resultado) {
            let idTentativa = resultado.insertId;
            return quizModel.salvarRespostas(idTentativa, respostas)
                .then(function () {
                    res.status(201).json({ idTentativa: idTentativa });
                });
        })
        .catch(function (erro) {
            console.log(`Erro ao salvar o quiz: ${erro.message}`);
            res.status(500).json({ mensagem: `Erro no banco de dados.` });
        });
}

function listar(req, res) {
    let idUsuario = Number(req.params.idUsuario);
    if (!idUsuario) {
        res.status(400).json({ mensagem: `Usuário inválido.` });
        return;
    }
    quizModel.listarTentativas(idUsuario)
        .then(function (tentativas) {
            return quizModel.listarRespostas(idUsuario)
                .then(function (respostas) {
                    let lista = [];
                    for (let i = 0; i < tentativas.length; i++) {
                        let respostasTentativa = [];
                        for (let j = 0; j < respostas.length; j++) {
                            if (respostas[j].fkTentativa == tentativas[i].idTentativa) {
                                respostasTentativa[respostas[j].fkPergunta - 1] = respostas[j].acertou == 1;
                            }
                        }
                        lista.push({
                            idTentativa: tentativas[i].idTentativa,
                            acertos: tentativas[i].acertos,
                            total: tentativas[i].total,
                            dtTentativa: tentativas[i].dtTentativa,
                            respostas: respostasTentativa
                        });
                    }
                    res.json({ tentativas: lista });
                });
        })
        .catch(function (erro) {
            console.log(`Erro ao listar o quiz: ${erro.message}`);
            res.status(500).json({ mensagem: `Erro no banco de dados.` });
        });
}

module.exports = {
    salvar,
    listar
};
