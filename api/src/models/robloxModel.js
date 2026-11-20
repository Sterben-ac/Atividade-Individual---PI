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

async function buscarJogos(idsJogos) {
    let mapa = {};
    let unicos = semRepetidos(idsJogos);
    let pedacos = dividir(unicos, 50);
    for (let p = 0; p < pedacos.length; p++) {
        let resposta = await tentar(`https://games.roblox.com/v1/games?universeIds=${pedacos[p].join(`,`)}`, { data: [] });
        for (let i = 0; i < resposta.data.length; i++) {
            let jogo = resposta.data[i];
            mapa[jogo.id] = {
                id: jogo.id,
                nome: jogo.name,
                placeId: jogo.rootPlaceId,
                jogando: jogo.playing,
                visitas: jogo.visits,
                criado: jogo.created,
                genero: jogo.genre
            };
        }
    }
    let icones = await buscarImagens(`games/icons`, unicos, `150x150`, `universeIds`);
    for (let id in mapa) {
        mapa[id].icone = icones[id] || null;
    }
    return mapa;
}

async function emLotes(lista, funcao) {
    let resultados = [];
    let pedacos = dividir(lista, 10);
    for (let p = 0; p < pedacos.length; p++) {
        let pedidos = [];
        for (let i = 0; i < pedacos[p].length; i++) {
            pedidos.push(funcao(pedacos[p][i]));
        }
        let respostas = await Promise.all(pedidos);
        for (let i = 0; i < respostas.length; i++) {
            resultados.push(respostas[i]);
        }
    }
    return resultados;
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

async function amigos(id) {
    let ids = [];
    let achados = await tentar(`https://friends.roblox.com/v1/users/${id}/friends/find?userSort=FriendScore&limit=50`, null);
    if (achados && achados.PageItems) {
        for (let i = 0; i < achados.PageItems.length; i++) {
            ids.push(achados.PageItems[i].id);
        }
    } else {
        let antigo = await pedirRoblox(`https://friends.roblox.com/v1/users/${id}/friends`);
        for (let i = 0; i < antigo.data.length; i++) {
            ids.push(antigo.data[i].id);
        }
    }
    let total = await tentar(`https://friends.roblox.com/v1/users/${id}/friends/count`, { count: ids.length });
    ids = ids.slice(0, 18);

    let nomes = await tentar(`https://users.roblox.com/v1/users`, { data: [] }, { userIds: ids, excludeBannedUsers: false });
    let fotos = await buscarImagens(`users/avatar-headshot`, ids, `150x150`, `userIds`);

    let lista = [];
    for (let i = 0; i < ids.length; i++) {
        let info = {};
        for (let j = 0; j < nomes.data.length; j++) {
            if (nomes.data[j].id == ids[i]) {
                info = nomes.data[j];
            }
        }
        lista.push({
            id: ids[i],
            nome: info.name || `ID ${ids[i]}`,
            apelido: info.displayName || info.name || ``,
            foto: fotos[ids[i]] || null
        });
    }
    return { total: total.count, amigos: lista };
}

async function favoritos(id) {
    let resposta = await pedirRoblox(`https://games.roblox.com/v2/users/${id}/favorite/games?limit=10&sortOrder=Desc`);
    let ids = [];
    for (let i = 0; i < resposta.data.length; i++) {
        ids.push(resposta.data[i].id);
    }
    let detalhes = await buscarJogos(ids);
    let jogos = [];
    for (let i = 0; i < ids.length; i++) {
        if (detalhes[ids[i]]) {
            jogos.push(detalhes[ids[i]]);
        }
    }
    return { jogos: jogos };
}

async function inventarioOpenCloud(id, filtro, paginas) {
    let chaveApi = process.env.ROBLOX_API_KEY;
    if (!chaveApi) {
        throw new Error(`falta a chave da API do Roblox (ROBLOX_API_KEY no arquivo api/.env). Veja o README.`);
    }
    let itens = [];
    let token = ``;
    for (let p = 0; p < paginas; p++) {
        let url = `https://apis.roblox.com/cloud/v2/users/${id}/inventory-items?maxPageSize=100&filter=${encodeURIComponent(filtro)}`;
        if (token) {
            url += `&pageToken=${encodeURIComponent(token)}`;
        }
        let pagina;
        try {
            pagina = await pedirRoblox(url, null, { 'x-api-key': chaveApi });
        } catch (erro) {
            if (erro.status == 401) {
                erro.message = `a chave da API foi recusada (confira se ela está certa, ativa e com permissão de Inventário)`;
            }
            if (erro.status == 403) {
                erro.message = `o inventário desta pessoa é privado (Configurações > Privacidade > Quem pode ver meu inventário)`;
            }
            throw erro;
        }
        itens = itens.concat(pagina.inventoryItems || []);
        token = pagina.nextPageToken;
        if (!token) {
            break;
        }
    }
    return { itens: itens, temMais: Boolean(token) };
}

async function listarEmblemasDoJogador(id) {
    let resultado = await inventarioOpenCloud(id, `badges=true`, 200);
    let lista = [];
    for (let i = 0; i < resultado.itens.length; i++) {
        let item = resultado.itens[i];
        if (item.badgeDetails) {
            lista.push({ id: Number(item.badgeDetails.badgeId), data: item.addTime });
        }
    }
    lista.sort(function (a, b) {
        return new Date(b.data) - new Date(a.data);
    });
    return lista;
}

async function emblemas(id, inicio, quantidade) {
    let lista = await listarEmblemasDoJogador(id);
    let pedaco = lista.slice(inicio, inicio + quantidade);
    let ids = [];
    for (let i = 0; i < pedaco.length; i++) {
        ids.push(pedaco[i].id);
    }

    let detalhes = await emLotes(ids, function (idEmblema) {
        return tentar(`https://badges.roblox.com/v1/badges/${idEmblema}`, null);
    });
    let icones = await buscarImagens(`badges/icons`, ids, `150x150`, `badgeIds`);

    let listaEmblemas = [];
    let idsJogos = [];
    for (let i = 0; i < pedaco.length; i++) {
        let d = detalhes[i] || {};
        let estatisticas = d.statistics || {};
        let jogo = d.awardingUniverse || null;

        let raridade = null;
        if (estatisticas.winRatePercentage != null) {
            raridade = Number((estatisticas.winRatePercentage * 100).toFixed(2));
        }
        let jogoId = null;
        let jogoNome = null;
        if (jogo) {
            jogoId = jogo.id;
            jogoNome = jogo.name;
        }
        listaEmblemas.push({
            id: pedaco[i].id,
            nome: d.displayName || d.name || `Emblema ${pedaco[i].id}`,
            descricao: d.displayDescription || d.description || ``,
            data: pedaco[i].data,
            raridade: raridade,
            conquistados: estatisticas.awardedCount,
            jogoId: jogoId,
            jogoNome: jogoNome,
            icone: icones[pedaco[i].id] || null
        });
        idsJogos.push(jogoId);
    }

    let jogos = await buscarJogos(idsJogos);
    let primeiraData = null;
    let ultimaData = null;
    if (lista.length > 0) {
        primeiraData = lista[lista.length - 1].data;
        ultimaData = lista[0].data;
    }
    return {
        total: lista.length,
        inicio: inicio,
        temMais: inicio + quantidade < lista.length,
        primeiraData: primeiraData,
        ultimaData: ultimaData,
        emblemas: listaEmblemas,
        jogos: jogos
    };
}

async function buscar(texto) {
    let encontrados = [];

    if (texto != `` && !isNaN(texto)) {
        let u = await tentar(`https://users.roblox.com/v1/users/${texto}`, null);
        if (u) {
            encontrados.push({ id: u.id, nome: u.name, apelido: u.displayName });
        }
    } else {
        let exato = await tentar(`https://users.roblox.com/v1/usernames/users`, { data: [] }, { usernames: [texto], excludeBannedUsers: false });
        for (let i = 0; i < exato.data.length; i++) {
            let u = exato.data[i];
            encontrados.push({ id: u.id, nome: u.name, apelido: u.displayName, exato: true });
        }
        let parecidos = await tentar(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(texto)}&limit=10`, { data: [] });
        for (let i = 0; i < parecidos.data.length; i++) {
            let u = parecidos.data[i];
            let jaTem = false;
            for (let j = 0; j < encontrados.length; j++) {
                if (encontrados[j].id == u.id) {
                    jaTem = true;
                }
            }
            if (!jaTem) {
                encontrados.push({ id: u.id, nome: u.name, apelido: u.displayName });
            }
        }
    }

    let ids = [];
    for (let i = 0; i < encontrados.length; i++) {
        ids.push(encontrados[i].id);
    }
    let fotos = await buscarImagens(`users/avatar-headshot`, ids, `150x150`, `userIds`);
    for (let i = 0; i < encontrados.length; i++) {
        encontrados[i].foto = fotos[encontrados[i].id] || null;
    }
    return { resultados: encontrados.slice(0, 10) };
}

module.exports = {
    perfil,
    amigos,
    favoritos,
    emblemas,
    buscar
};
