let database = require(`../database/config`);

function buscarPorNomeOuEmail(nome, email) {
    let instrucao = `SELECT idUsuario, nome, email FROM usuario WHERE nome = '${nome}' OR email = '${email}';`;
    return database.executar(instrucao);
}

function cadastrar(nome, email, senha) {
    let instrucao = `INSERT INTO usuario (nome, email, senha) VALUES ('${nome}', '${email}', '${senha}');`;
    return database.executar(instrucao);
}

function autenticar(login, senha) {
    let instrucao = `SELECT usuario.idUsuario, usuario.nome, usuario.email, contaRoblox.robloxId
        FROM usuario LEFT JOIN contaRoblox ON contaRoblox.fkUsuario = usuario.idUsuario
        WHERE (usuario.nome = '${login}' OR usuario.email = '${login}') AND usuario.senha = '${senha}';`;
    return database.executar(instrucao);
}

function vincularRoblox(idUsuario, robloxId) {
    let instrucao = `INSERT INTO contaRoblox (robloxId, fkUsuario) VALUES ('${robloxId}', ${idUsuario});`;
    return database.executar(instrucao);
}

function trocarRoblox(idUsuario, robloxId) {
    let instrucao = `UPDATE contaRoblox SET robloxId = '${robloxId}', dtVinculo = CURRENT_TIMESTAMP WHERE fkUsuario = ${idUsuario};`;
    return database.executar(instrucao);
}

module.exports = {
    buscarPorNomeOuEmail,
    cadastrar,
    autenticar,
    vincularRoblox,
    trocarRoblox
};
