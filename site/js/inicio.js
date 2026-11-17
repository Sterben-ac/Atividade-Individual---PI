let idRoblox = sessao.robloxId;

div_saudacao.innerHTML = `Olá, ${escapar(sessao.usuario)}!`;

function mostrarDestaque() {
    let diaDoAno = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    let posicao = diaDoAno % MEUS_JOGOS.length;
    let jogo = MEUS_JOGOS[posicao];
    let card = link_destaque_jogo;
    card.href = `jogos.html?jogo=${posicao}`;
    card.innerHTML =
        `<img src="${imagem(jogo.imagem, `img/jogo-padrao.svg`)}" alt="${jogo.nome}">` +
        `<div><strong>${jogo.nome}</strong>` +
        `<p>${jogo.resumo}</p>` +
        `<span class="btn">Ler sobre o jogo</span></div>`;
}
mostrarDestaque();

function htmlCardJogo(jogo, linhaExtra) {
    return `<a class="card" href="https://www.roblox.com/games/${jogo.placeId}" target="_blank">` +
        `<img src="${imagem(jogo.icone, `img/jogo-padrao.svg`)}" alt="${escapar(jogo.nome)}">` +
        `<p class="nome-jogo">${escapar(jogo.nome)}</p>` +
        `<p class="jogando">${linhaExtra}</p>` +
        `</a>`;
}

function carregarAmigos() {
    let caixa = div_lista_amigos;

    roblox.amigos(idRoblox)
        .then(function (dados) {
            div_titulo_amigos.innerHTML = `Amigos (${formatarNumero(dados.total)})`;
            link_ver_amigos.href = `https://www.roblox.com/users/${idRoblox}/friends`;

            if (dados.amigos.length == 0) {
                caixa.innerHTML = `<p class="texto-cinza" style="padding: 10px;">Nenhum amigo para mostrar (a lista pode estar privada).</p>`;
                return;
            }
            let html = ``;
            let quantidade = Math.min(dados.amigos.length, 9);
            for (let i = 0; i < quantidade; i++) {
                let amigo = dados.amigos[i];
                let nomeMostrado = amigo.nome;
                if (amigo.apelido) {
                    nomeMostrado = amigo.apelido;
                }
                html += `<a class="amigo" href="perfil.html?id=${amigo.id}" title="Ver perfil de ${escapar(amigo.nome)}">` +
                    `<img src="${imagem(amigo.foto, `img/baconpfp.jpg`)}" alt="${escapar(amigo.nome)}">` +
                    `<p>${escapar(nomeMostrado)}</p>` +
                    `</a>`;
            }
            caixa.innerHTML = html;
        })
        .catch(function (erro) {
            caixa.innerHTML = `<p class="texto-cinza" style="padding: 10px;">Não foi possível carregar os amigos.</p>`;
        });
}

function jaTemJogo(lista, id) {
    for (let i = 0; i < lista.length; i++) {
        if (lista[i].id == id) {
            return true;
        }
    }
    return false;
}

function carregarEmblemas() {
    roblox.emblemas(idRoblox, 60)
        .then(function (dados) {
            let emblemas = dados.emblemas;

            let jogosVistos = [];
            for (let i = 0; i < emblemas.length && jogosVistos.length < 6; i++) {
                let e = emblemas[i];
                if (e.jogoId && !jaTemJogo(jogosVistos, e.jogoId) && dados.jogos[e.jogoId]) {
                    let jogo = dados.jogos[e.jogoId];
                    jogo.ultimoEmblema = e.data;
                    jogosVistos.push(jogo);
                }
            }
            let html = ``;
            for (let i = 0; i < jogosVistos.length; i++) {
                html += htmlCardJogo(jogosVistos[i], `Último emblema: ${formatarData(jogosVistos[i].ultimoEmblema)}`);
            }
            if (html == ``) {
                html = `<p class="texto-cinza">Nenhum emblema encontrado ainda.</p>`;
            }
            div_lista_recentes.innerHTML = html;

            let htmlEmblemas = ``;
            for (let i = 0; i < Math.min(6, emblemas.length); i++) {
                htmlEmblemas += `<img src="${imagem(emblemas[i].icone, `img/sterben-emblema.svg`)}" alt="" title="${escapar(emblemas[i].nome)}">`;
            }
            link_emblemas_recentes.innerHTML = htmlEmblemas;

            let desde = `—`;
            if (dados.primeiraData) {
                desde = new Date(dados.primeiraData).getFullYear();
            }
            div_mini_numeros.innerHTML =
                `<p><span>Emblemas</span> <strong>${formatarNumero(dados.total)}</strong></p>` +
                `<p><span>Último</span> <strong>${formatarData(dados.ultimaData)}</strong></p>` +
                `<p><span>Desde</span> <strong>${desde}</strong></p>`;
        })
        .catch(function (erro) {
            div_lista_recentes.innerHTML = `<p class="texto-cinza">Não foi possível carregar.</p>`;
        });
}

function carregarFavoritos() {
    let caixa = div_lista_favoritos;
    link_ver_favoritos.href = `https://www.roblox.com/users/${idRoblox}/favorites`;

    roblox.favoritos(idRoblox)
        .then(function (dados) {
            let html = ``;
            for (let i = 0; i < Math.min(6, dados.jogos.length); i++) {
                let jogo = dados.jogos[i];
                html += htmlCardJogo(jogo, `${numeroCurto(jogo.jogando)} jogando`);
            }
            if (html == ``) {
                html = `<p class="texto-cinza">Nenhum jogo favoritado.</p>`;
            }
            caixa.innerHTML = html;
        })
        .catch(function (erro) {
            caixa.innerHTML = `<p class="texto-cinza">Não foi possível carregar.</p>`;
        });
}

function carregarPerfil() {
    roblox.usuario(idRoblox)
        .then(function (dados) {
            img_foto_perfil.src = imagem(dados.foto, `img/baconpfp.jpg`);
            div_subtitulo.innerHTML =
                `@${escapar(dados.nome)} · no Roblox há ${anosDesde(dados.criado)} anos`;
            if (dados.foto && !usandoExemplo) {
                sessao.foto = dados.foto;
                salvarSessao();
                img_avatar_nav.src = dados.foto;
            }
        })
        .catch(function (erro) {
            div_subtitulo.innerHTML = `Não encontramos esse ID no Roblox. Confira no seu perfil.`;
        });
}

if (!idRoblox) {
    div_area_sem_id.innerHTML = htmlSemId();
    div_lista_amigos.innerHTML = `<p class="texto-cinza" style="padding: 10px;">Vincule seu ID para ver seus amigos.</p>`;
    div_lista_recentes.innerHTML = ``;
    div_lista_favoritos.innerHTML = ``;
} else {
    carregarPerfil();
    carregarAmigos();
    carregarEmblemas();
    carregarFavoritos();
}
