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

let TIPOS_ITEM = {
    HAT: `Chapéus`, HAIR_ACCESSORY: `Cabelos`, FACE_ACCESSORY: `Acessórios de rosto`, NECK_ACCESSORY: `Pescoço`,
    SHOULDER_ACCESSORY: `Ombros`, FRONT_ACCESSORY: `Frente`, BACK_ACCESSORY: `Costas`, WAIST_ACCESSORY: `Cintura`,
    CLASSIC_SHIRT: `Camisas clássicas`, CLASSIC_PANTS: `Calças clássicas`, CLASSIC_TSHIRT: `Camisetas (T-shirts)`,
    TSHIRT_ACCESSORY: `Camisetas 3D`, SHIRT_ACCESSORY: `Camisas 3D`, PANTS_ACCESSORY: `Calças 3D`, JACKET_ACCESSORY: `Jaquetas`,
    SWEATER_ACCESSORY: `Blusas`, SHORTS_ACCESSORY: `Shorts`, DRESS_SKIRT_ACCESSORY: `Vestidos e saias`,
    LEFT_SHOE_ACCESSORY: `Sapatos`, RIGHT_SHOE_ACCESSORY: `Sapatos`,
    FACE: `Rostos`, HEAD: `Cabeças`, DYNAMIC_HEAD: `Cabeças animadas`, TORSO: `Partes do corpo`, LEFT_ARM: `Partes do corpo`,
    RIGHT_ARM: `Partes do corpo`, LEFT_LEG: `Partes do corpo`, RIGHT_LEG: `Partes do corpo`,
    GEAR: `Equipamentos (gears)`, EMOTE_ANIMATION: `Emotes`, CLIMB_ANIMATION: `Animações`, DEATH_ANIMATION: `Animações`,
    FALL_ANIMATION: `Animações`, IDLE_ANIMATION: `Animações`, JUMP_ANIMATION: `Animações`, RUN_ANIMATION: `Animações`,
    SWIM_ANIMATION: `Animações`, WALK_ANIMATION: `Animações`, POSE_ANIMATION: `Animações`, MOOD_ANIMATION: `Animações`,
    PLACE: `Lugares`, DECAL: `Decalques`, AUDIO: `Áudios`, MODEL: `Modelos`, MESH_PART: `Modelos`, VIDEO: `Vídeos`,
    PLUGIN: `Plugins`, ANIMATION: `Animações`, EYEBROW_ACCESSORY: `Rosto`, EYELASH_ACCESSORY: `Rosto`
};

function nomeDoTipo(tipo) {
    if (TIPOS_ITEM[tipo]) {
        return TIPOS_ITEM[tipo];
    }
    let texto = String(tipo || `Outros`).toLowerCase().split(`_`).join(` `);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function pedirDetalhesItem(assetId) {
    return tentar(`https://economy.roblox.com/v2/assets/${assetId}/details`, null);
}

async function inventario(id) {
    let itens = [];
    let temMaisItens = false;
    let motivoBloqueio = ``;
    try {
        let r = await inventarioOpenCloud(id, `inventoryItemAssetTypes=*`, 60);
        for (let i = 0; i < r.itens.length; i++) {
            if (r.itens[i].assetDetails) {
                itens.push(r.itens[i]);
            }
        }
        temMaisItens = r.temMais;
    } catch (erro) {
        motivoBloqueio = erro.message;
    }

    let porTipo = {};
    let porAno = {};
    let comData = [];
    for (let i = 0; i < itens.length; i++) {
        let tipo = nomeDoTipo(itens[i].assetDetails.inventoryItemAssetType);
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;
        if (itens[i].addTime) {
            let ano = new Date(itens[i].addTime).getFullYear();
            porAno[ano] = (porAno[ano] || 0) + 1;
            comData.push(itens[i]);
        }
    }

    comData.sort(function (a, b) {
        return new Date(b.addTime) - new Date(a.addTime);
    });
    let ultimos = comData.slice(0, 12);
    let maisAntigo = null;
    if (comData.length > 0) {
        maisAntigo = comData[comData.length - 1];
    }
    let paraDetalhar = ultimos.slice();
    if (maisAntigo) {
        paraDetalhar.push(maisAntigo);
    }
    let detalhesUltimos = await emLotes(paraDetalhar, function (item) {
        return pedirDetalhesItem(item.assetDetails.assetId);
    });

    let passes = null;
    try {
        passes = await inventarioOpenCloud(id, `gamePasses=true`, 20);
    } catch (erro) {
        console.log(`  aviso: ${erro.message}`);
    }

    let limitados = [];
    let bloqueado = false;
    let cursor = ``;
    for (let p = 0; p < 10; p++) {
        let url = `https://inventory.roblox.com/v1/users/${id}/assets/collectibles?limit=100&sortOrder=Desc`;
        if (cursor) {
            url += `&cursor=${cursor}`;
        }
        let pagina = await tentar(url, null);
        if (pagina == null) {
            bloqueado = true;
            break;
        }
        limitados = limitados.concat(pagina.data);
        cursor = pagina.nextPageCursor;
        if (!cursor) {
            break;
        }
    }
    if (bloqueado && itens.length > 0) {
        bloqueado = false;
        let colecionaveis = [];
        for (let i = 0; i < itens.length && colecionaveis.length < 150; i++) {
            if (itens[i].assetDetails.collectibleDetails) {
                colecionaveis.push(itens[i]);
            }
        }
        let precos = await emLotes(colecionaveis, function (item) {
            return tentar(`https://economy.roblox.com/v1/assets/${item.assetDetails.assetId}/resale-data`, null);
        });
        let nomes = await emLotes(colecionaveis, function (item) {
            return pedirDetalhesItem(item.assetDetails.assetId);
        });
        limitados = [];
        for (let i = 0; i < colecionaveis.length; i++) {
            let assetId = Number(colecionaveis[i].assetDetails.assetId);
            limitados.push({
                assetId: assetId,
                name: nomes[i] ? nomes[i].Name : `Item ${assetId}`,
                serialNumber: colecionaveis[i].assetDetails.collectibleDetails.serialNumber || null,
                recentAveragePrice: precos[i] ? precos[i].recentAveragePrice : 0,
                originalPrice: null
            });
        }
    }

    let avatar = await tentar(`https://avatar.roblox.com/v2/avatar/users/${id}/avatar`, null);
    let vestindo = await tentar(`https://avatar.roblox.com/v1/users/${id}/currently-wearing`, { assetIds: [] });
    let idsVisual = vestindo.assetIds.slice(0, 30);
    let detalhesVisual = await emLotes(idsVisual, pedirDetalhesItem);
    let roupas = await tentar(`https://avatar.roblox.com/v2/avatar/users/${id}/outfits?page=1&itemsPerPage=24&isEditable=true`, { data: [] });
    let listaRoupas = roupas.data || [];
    let idsRoupas = [];
    for (let i = 0; i < listaRoupas.length; i++) {
        idsRoupas.push(listaRoupas[i].id);
    }
    let imagensRoupas = await buscarImagens(`users/outfits`, idsRoupas, `150x150`, `userOutfitIds`);
    let corpo = await buscarImagens(`users/avatar`, [id], `420x420`, `userIds`);

    let idsImagens = [];
    for (let i = 0; i < limitados.length; i++) {
        idsImagens.push(limitados[i].assetId);
    }
    for (let i = 0; i < idsVisual.length; i++) {
        idsImagens.push(idsVisual[i]);
    }
    for (let i = 0; i < ultimos.length; i++) {
        idsImagens.push(Number(ultimos[i].assetDetails.assetId));
    }
    if (maisAntigo) {
        idsImagens.push(Number(maisAntigo.assetDetails.assetId));
    }
    let imagens = await buscarImagens(`assets`, idsImagens, `150x150`, `assetIds`);

    let rolimons = await tentar(`https://api.rolimons.com/players/v1/playerinfo/${id}`, null);

    function itemSimples(item, detalhe) {
        let assetId = Number(item.assetDetails.assetId);
        let criador = ``;
        if (detalhe && detalhe.Creator) {
            criador = detalhe.Creator.Name;
        }
        return {
            id: assetId,
            nome: detalhe ? detalhe.Name : `Item ${assetId}`,
            criador: criador,
            tipo: nomeDoTipo(item.assetDetails.inventoryItemAssetType),
            data: item.addTime,
            imagem: imagens[assetId] || null
        };
    }

    let listaUltimos = [];
    for (let i = 0; i < ultimos.length; i++) {
        listaUltimos.push(itemSimples(ultimos[i], detalhesUltimos[i]));
    }
    let listaLimitados = [];
    for (let i = 0; i < limitados.length; i++) {
        let item = limitados[i];
        listaLimitados.push({
            id: item.assetId,
            nome: item.name,
            serial: item.serialNumber,
            rap: item.recentAveragePrice || 0,
            precoOriginal: item.originalPrice,
            imagem: imagens[item.assetId] || null
        });
    }
    let listaVisual = [];
    for (let i = 0; i < idsVisual.length; i++) {
        let d = detalhesVisual[i];
        let criador = ``;
        if (d && d.Creator) {
            criador = d.Creator.Name;
        }
        listaVisual.push({
            id: idsVisual[i],
            nome: d ? d.Name : `Item ${idsVisual[i]}`,
            preco: d ? d.PriceInRobux : null,
            aVenda: d ? d.IsForSale : false,
            limitado: d ? Boolean(d.IsLimited || d.IsLimitedUnique) : false,
            criador: criador,
            imagem: imagens[idsVisual[i]] || null
        });
    }
    let emotes = [];
    if (avatar && avatar.emotes) {
        for (let i = 0; i < avatar.emotes.length; i++) {
            emotes.push({ nome: avatar.emotes[i].assetName, posicao: avatar.emotes[i].position });
        }
    }
    let listaRoupasFinal = [];
    for (let i = 0; i < listaRoupas.length; i++) {
        listaRoupasFinal.push({ id: listaRoupas[i].id, nome: listaRoupas[i].name, imagem: imagensRoupas[listaRoupas[i].id] || null });
    }
    let valorRolimons = null;
    if (rolimons && rolimons.success !== false) {
        valorRolimons = { valor: rolimons.value, rap: rolimons.rap };
    }

    return {
        podeVer: itens.length > 0 || !motivoBloqueio,
        motivoBloqueio: motivoBloqueio,
        bloqueado: bloqueado,
        totalItens: itens.length,
        temMaisItens: temMaisItens,
        totalPasses: passes ? passes.itens.length : null,
        porTipo: porTipo,
        porAno: porAno,
        ultimos: listaUltimos,
        maisAntigo: maisAntigo ? itemSimples(maisAntigo, detalhesUltimos[ultimos.length]) : null,
        limitados: listaLimitados,
        visual: listaVisual,
        avatar: {
            imagem: corpo[id] || null,
            tipo: avatar ? avatar.playerAvatarType : null,
            cores: avatar && avatar.bodyColor3s ? avatar.bodyColor3s : null,
            escala: avatar ? avatar.scales : null,
            emotes: emotes
        },
        roupas: listaRoupasFinal,
        rolimons: valorRolimons
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
    inventario,
    buscar
};
