let idPerfil = pegarIdRoblox();
let ehMeuPerfil = idPerfil == sessao.robloxId;

function idNoLink(id) {
    if (ehMeuPerfil) {
        return ``;
    }
    return `?id=${id}`;
}

function htmlTopo(u) {
    let selos = ``;
    if (u.verificado) {
        selos += ` <span class="selo vermelho">Verificado</span>`;
    }
    if (u.banido) {
        selos += ` <span class="selo vermelho">Conta banida</span>`;
    }
    if (!ehMeuPerfil) {
        selos += ` <span class="selo">Visitando</span>`;
    }

    let acoes = `<a href="emblemas.html${idNoLink(u.id)}" class="btn btn-grande">Ver emblemas</a>` +
        `<a href="inventario.html${idNoLink(u.id)}" class="btn-contorno">Ver inventário</a>` +
        `<a href="https://www.roblox.com/users/${u.id}/profile" target="_blank" class="btn-contorno">Abrir no Roblox</a>`;
    if (ehMeuPerfil) {
        acoes += `<button class="btn-contorno" onclick="mostrarTrocarId()">Trocar ID vinculado</button>`;
    } else {
        acoes += `<a href="jogador.html?comparar=${u.id}" class="btn-contorno">Comparar comigo</a>`;
    }

    let descricao = `<span class="texto-cinza">Sem descrição.</span>`;
    if (u.descricao) {
        descricao = escapar(u.descricao);
    }

    return `<section class="painel">` +
        `<div class="perfil-topo">` +
        `<img src="${imagem(u.avatar, `img/avatar-padrao.svg`)}" alt="Avatar de ${escapar(u.nome)}" class="perfil-avatar">` +
        `<div class="perfil-info">` +
        `<h1>${escapar(u.apelido)}${selos}</h1>` +
        `<p class="arroba">@${escapar(u.nome)} · conta criada em ${formatarData(u.criado)} (há ${anosDesde(u.criado)} anos)</p>` +
        `<div class="perfil-contagens">` +
        `<div><strong>${formatarNumero(u.amigos)}</strong><span>Amigos</span></div>` +
        `<div><strong>${formatarNumero(u.seguidores)}</strong><span>Seguidores</span></div>` +
        `<div><strong>${formatarNumero(u.seguindo)}</strong><span>Seguindo</span></div>` +
        `</div>` +
        `<p class="perfil-descricao">${descricao}</p>` +
        `<div class="perfil-acoes">${acoes}</div>` +
        `<div id="div_area_trocar_id"></div>` +
        `</div></div></section>`;
}

function htmlListaInsignias(u) {
    if (u.insigniasRoblox.length == 0) {
        return `<p class="texto-cinza">Nenhuma insígnia do Roblox.</p>`;
    }
    let html = `<ul class="lista-itens">`;
    for (let i = 0; i < u.insigniasRoblox.length; i++) {
        let ins = u.insigniasRoblox[i];
        html += `<li><img src="${imagem(ins.imagem, `img/sterben-emblema.svg`)}" alt="">` +
            `<div class="item-texto"><strong>${escapar(ins.nome)}</strong><span>${escapar(ins.descricao)}</span></div></li>`;
    }
    return `${html}</ul>`;
}

function htmlListaGrupos(u) {
    if (u.grupos.length == 0) {
        return `<p class="texto-cinza">Não participa de grupos.</p>`;
    }
    let html = `<ul class="lista-itens">`;
    for (let i = 0; i < u.grupos.length; i++) {
        let g = u.grupos[i];
        html += `<li><div class="item-texto">` +
            `<strong><a href="https://www.roblox.com/groups/${g.id}" target="_blank" style="color: inherit;">${escapar(g.nome)}</a></strong>` +
            `<span>${escapar(g.cargo)}</span></div>` +
            `<span class="item-valor">${numeroCurto(g.membros)} membros</span></li>`;
    }
    return `${html}</ul>`;
}

function carregarPerfil() {
    let conteudo = div_conteudo;

    if (!idPerfil) {
        conteudo.innerHTML = htmlSemId();
        return;
    }

    roblox.usuario(idPerfil)
        .then(function (u) {
            mostrarPerfil(u);
        })
        .catch(function (erro) {
            let final = `<a href="jogador.html" class="btn btn-grande">Buscar outro jogador</a>`;
            if (ehMeuPerfil) {
                final = htmlSemId();
            }
            conteudo.innerHTML = `<div class="painel vazio"><h2>Jogador não encontrado</h2>` +
                `<p>Não existe nenhum jogador com o ID ${escapar(idPerfil)}.</p>${final}</div>`;
        });
}

function mostrarPerfil(u) {
    let nomesAntigos = `<p class="texto-cinza">Nunca trocou de nome.</p>`;
    if (u.nomesAntigos.length > 0) {
        nomesAntigos = ``;
        for (let i = 0; i < u.nomesAntigos.length; i++) {
            nomesAntigos += `<span class="selo" style="margin: 0 4px 6px 0;">${escapar(u.nomesAntigos[i])}</span>`;
        }
    }

    div_conteudo.innerHTML =
        htmlTopo(u) +
        `<div class="grade-numeros" id="div_numeros_perfil">` +
        `<div class="numero-card destaque"><span class="valor">${anosDesde(u.criado)} anos</span><span class="rotulo">de Roblox</span><span class="detalhe">desde ${new Date(u.criado).getFullYear()}</span></div>` +
        `<div class="numero-card"><span class="valor" id="div_num_emblemas">…</span><span class="rotulo">Emblemas</span><span class="detalhe" id="div_det_emblemas">carregando</span></div>` +
        `<div class="numero-card"><span class="valor" id="div_num_jogos">…</span><span class="rotulo">Último emblema</span><span class="detalhe" id="div_det_jogos">carregando</span></div>` +
        `<div class="numero-card"><span class="valor robux" id="div_num_valor">…</span><span class="rotulo">Valor dos limitados (RAP)</span><span class="detalhe" id="div_det_valor">carregando</span></div>` +
        `</div>` +
        `<div class="duas-colunas">` +
        `<section class="painel"><div class="painel-cabecalho"><h2>Insígnias do Roblox</h2><span>dadas pelo próprio Roblox</span></div>${htmlListaInsignias(u)}</section>` +
        `<section class="painel"><div class="painel-cabecalho"><h2>Grupos</h2><span>${u.grupos.length} mostrados</span></div>${htmlListaGrupos(u)}</section>` +
        `</div>` +
        `<section class="painel" style="margin-top: 20px;"><div class="painel-cabecalho"><h2>Nomes anteriores</h2><span>histórico de nomes de usuário</span></div>${nomesAntigos}</section>`;

    document.title = `Sterben · ${u.apelido}`;
    carregarNumeros();
}

function carregarNumeros() {
    roblox.emblemas(idPerfil, 1)
        .then(function (e) {
            div_num_emblemas.innerHTML = formatarNumero(e.total);
            if (e.primeiraData) {
                div_det_emblemas.innerHTML = `primeiro em ${formatarData(e.primeiraData)}`;
            } else {
                div_det_emblemas.innerHTML = `nenhum ainda`;
            }
            div_num_jogos.innerHTML = formatarData(e.ultimaData);
            if (e.emblemas.length > 0) {
                div_det_jogos.innerHTML = escapar(e.emblemas[0].nome);
            } else {
                div_det_jogos.innerHTML = ``;
            }
            carregarValor();
        })
        .catch(function (erro) {
            div_num_emblemas.innerHTML = `—`;
            div_num_jogos.innerHTML = `—`;
            carregarValor();
        });
}

function carregarValor() {
    roblox.inventario(idPerfil)
        .then(function (inv) {
            if (!inv.podeVer) {
                div_num_valor.innerHTML = `privado`;
                div_det_valor.innerHTML = `inventário escondido`;
                return;
            }
            let total = 0;
            for (let i = 0; i < inv.limitados.length; i++) {
                total += inv.limitados[i].rap;
            }
            div_num_valor.innerHTML = numeroCurto(total);
            div_det_valor.innerHTML = `${inv.limitados.length} itens limitados`;
        })
        .catch(function (erro) {
            div_num_valor.innerHTML = `—`;
        });
}

function mostrarTrocarId() {
    div_area_trocar_id.innerHTML = `<div style="margin-top: 16px;">${htmlSemId()}</div>`;
}

carregarPerfil();
