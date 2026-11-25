let database = require(`../database/config`);

function salvarTentativa(idUsuario, acertos, total) {
    let instrucao = `INSERT INTO tentativa (acertos, total, fkUsuario) VALUES (${acertos}, ${total}, ${idUsuario});`;
    return database.executar(instrucao);
}

function salvarRespostas(idTentativa, respostas) {
    let valores = ``;
    for (let i = 0; i < respostas.length; i++) {
        let acertou = 0;
        if (respostas[i] == true) {
            acertou = 1;
        }
        if (i > 0) {
            valores += `, `;
        }
        valores += `(${idTentativa}, ${i + 1}, ${acertou})`;
    }
    let instrucao = `INSERT INTO resposta (fkTentativa, fkPergunta, acertou) VALUES ${valores};`;
    return database.executar(instrucao);
}

function listarTentativas(idUsuario) {
    let instrucao = `SELECT idTentativa, acertos, total, dtTentativa FROM tentativa
        WHERE fkUsuario = ${idUsuario} ORDER BY idTentativa;`;
    return database.executar(instrucao);
}

function listarRespostas(idUsuario) {
    let instrucao = `SELECT resposta.fkTentativa, resposta.fkPergunta, resposta.acertou FROM resposta
        JOIN tentativa ON resposta.fkTentativa = tentativa.idTentativa
        WHERE tentativa.fkUsuario = ${idUsuario}
        ORDER BY resposta.fkTentativa, resposta.fkPergunta;`;
    return database.executar(instrucao);
}

module.exports = {
    salvarTentativa,
    salvarRespostas,
    listarTentativas,
    listarRespostas
};
