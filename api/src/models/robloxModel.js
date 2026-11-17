let cache = {};

let TEMPO_CACHE = 30 * 60 * 1000;

function esperar(milissegundos) {
    return new Promise(function (resolve) {
        setTimeout(resolve, milissegundos);
    });
}

async function pedirRoblox(url, corpo, cabecalhosExtras) {
    let chave = url;
    if (corpo) {
        chave += JSON.stringify(corpo);
    }
    let guardado = cache[chave];
    if (guardado && Date.now() - guardado.hora < TEMPO_CACHE) {
        return guardado.dados;
    }

    let opcoes = { headers: { 'Accept': `application/json` } };
    if (cabecalhosExtras) {
        for (let nome in cabecalhosExtras) {
            opcoes.headers[nome] = cabecalhosExtras[nome];
        }
    }
    if (corpo) {
        opcoes.method = `POST`;
        opcoes.headers['Content-Type'] = `application/json`;
        opcoes.body = JSON.stringify(corpo);
    }

    let resposta = await fetch(url, opcoes);
    for (let tentativa = 1; tentativa <= 3 && resposta.status == 429; tentativa++) {
        await esperar(1500 * tentativa);
        resposta = await fetch(url, opcoes);
    }
    if (!resposta.ok) {
        let erro = new Error(`Roblox respondeu ${resposta.status} em ${url}`);
        erro.status = resposta.status;
        throw erro;
    }
    let dados = await resposta.json();
    cache[chave] = { hora: Date.now(), dados: dados };
    return dados;
}

async function tentar(url, reserva, corpo) {
    try {
        return await pedirRoblox(url, corpo);
    } catch (erro) {
        console.log(`  aviso: ${erro.message}`);
        return reserva;
    }
}

function dividir(lista, tamanho) {
    let pedacos = [];
    for (let i = 0; i < lista.length; i += tamanho) {
        pedacos.push(lista.slice(i, i + tamanho));
    }
    return pedacos;
}

function semRepetidos(lista) {
    let resultado = [];
    for (let i = 0; i < lista.length; i++) {
        if (lista[i] && !resultado.includes(lista[i])) {
            resultado.push(lista[i]);
        }
    }
    return resultado;
}

async function buscarImagens(tipo, ids, tamanho, nomeParametro) {
    let mapa = {};
    let faltando = semRepetidos(ids);

    for (let tentativa = 1; tentativa <= 4 && faltando.length > 0; tentativa++) {
        if (tentativa > 1) {
            await esperar(1500);
        }
        let aindaFaltando = [];
        let pedacos = dividir(faltando, 100);
        for (let p = 0; p < pedacos.length; p++) {
            let url = `https://thumbnails.roblox.com/v1/${tipo}?${nomeParametro}=${pedacos[p].join(`,`)}&size=${tamanho}&format=Png&isCircular=false&t=${tentativa}`;
            let resposta = await tentar(url, { data: [] });
            for (let i = 0; i < resposta.data.length; i++) {
                let item = resposta.data[i];
                if (item.state == `Completed`) {
                    mapa[item.targetId] = item.imageUrl;
                } else if (item.state == `Pending`) {
                    aindaFaltando.push(item.targetId);
                }
            }
        }
        faltando = aindaFaltando;
    }
    return mapa;
}

async function perfil(id) {
    let usuario = await pedirRoblox(`https://users.roblox.com/v1/users/${id}`);

    let respostas = await Promise.all([
        buscarImagens(`users/avatar-headshot`, [id], `150x150`, `userIds`),
        buscarImagens(`users/avatar`, [id], `420x420`, `userIds`),
        tentar(`https://friends.roblox.com/v1/users/${id}/friends/count`, { count: null }),
        tentar(`https://friends.roblox.com/v1/users/${id}/followers/count`, { count: null }),
        tentar(`https://friends.roblox.com/v1/users/${id}/followings/count`, { count: null }),
        tentar(`https://accountinformation.roblox.com/v1/users/${id}/roblox-badges`, []),
        tentar(`https://users.roblox.com/v1/users/${id}/username-history?limit=50&sortOrder=Desc`, { data: [] }),
        tentar(`https://groups.roblox.com/v2/users/${id}/groups/roles`, { data: [] })
    ]);
    let rosto = respostas[0];
    let corpo = respostas[1];
    let insignias = respostas[5];
    let nomes = respostas[6];
    let grupos = respostas[7];

    let listaInsignias = [];
    for (let i = 0; i < insignias.length; i++) {
        listaInsignias.push({ nome: insignias[i].name, descricao: insignias[i].description, imagem: insignias[i].imageUrl });
    }
    let nomesAntigos = [];
    for (let i = 0; i < nomes.data.length; i++) {
        nomesAntigos.push(nomes.data[i].name);
    }
    let listaGrupos = [];
    for (let i = 0; i < grupos.data.length && i < 12; i++) {
        let g = grupos.data[i];
        listaGrupos.push({ id: g.group.id, nome: g.group.name, membros: g.group.memberCount, cargo: g.role.name });
    }

    return {
        id: usuario.id,
        nome: usuario.name,
        apelido: usuario.displayName,
        descricao: usuario.description,
        criado: usuario.created,
        banido: usuario.isBanned,
        verificado: usuario.hasVerifiedBadge,
        foto: rosto[id] || null,
        avatar: corpo[id] || null,
        amigos: respostas[2].count,
        seguidores: respostas[3].count,
        seguindo: respostas[4].count,
        insigniasRoblox: listaInsignias,
        nomesAntigos: nomesAntigos,
        grupos: listaGrupos
    };
}

module.exports = {
    perfil
};
