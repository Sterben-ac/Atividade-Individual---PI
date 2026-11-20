let idEmblemas = pegarIdRoblox();

let todos = [];
let jogosMapa = {};
let quantidadeMostrada = 60;

function nomeDoJogo(emblema) {
    let jogo = jogosMapa[emblema.jogoId];
    if (jogo) {
        return jogo.nome;
    }
    if (emblema.jogoNome) {
        return emblema.jogoNome;
    }
    return `Jogo desconhecido`;
}

function htmlEmblema(e) {
    let nivel = nivelRaridade(e.raridade);
    return `<div class="emblema ${nivel.classe}" onclick="abrirEmblema(${e.id})">` +
        `<img src="${imagem(e.icone, `img/sterben-emblema.svg`)}" alt="" loading="lazy">` +
        `<strong>${escapar(e.nome)}</strong>` +
        `<span class="raridade-${nivel.classe}">${nivel.nome} · ${formatarPorcentagem(e.raridade)}</span>` +
        `<span>${formatarData(e.data)}</span>` +
        `</div>`;
}

function contarJogosDiferentes(lista) {
    let vistos = {};
    let quantidade = 0;
    for (let i = 0; i < lista.length; i++) {
        if (vistos[lista[i].jogoId] == null) {
            vistos[lista[i].jogoId] = true;
            quantidade++;
        }
    }
    return quantidade;
}

function htmlResumo() {
    let jogosDiferentes = contarJogosDiferentes(todos);

    let maisRaro = null;
    for (let i = 0; i < todos.length; i++) {
        if (todos[i].raridade == null) {
            continue;
        }
        if (maisRaro == null || todos[i].raridade < maisRaro.raridade) {
            maisRaro = todos[i];
        }
    }

    let porAno = contarPorAno();
    let anoMaisAtivo = null;
    for (let ano in porAno) {
        if (anoMaisAtivo == null || porAno[ano] > porAno[anoMaisAtivo]) {
            anoMaisAtivo = ano;
        }
    }

    let primeiro = todos[todos.length - 1];

    let cardPrimeiro = `<span class="valor">—</span><span class="rotulo">Primeiro emblema</span><span class="detalhe"></span>`;
    if (primeiro) {
        cardPrimeiro = `<span class="valor">${formatarData(primeiro.data)}</span><span class="rotulo">Primeiro emblema</span>` +
            `<span class="detalhe">${escapar(primeiro.nome)} · ${escapar(nomeDoJogo(primeiro))}</span>`;
    }
    let cardRaro = `<span class="valor raridade-comum">—</span><span class="rotulo">Emblema mais raro</span><span class="detalhe"></span>`;
    if (maisRaro) {
        cardRaro = `<span class="valor raridade-${nivelRaridade(maisRaro.raridade).classe}">${formatarPorcentagem(maisRaro.raridade)}</span>` +
            `<span class="rotulo">Emblema mais raro</span><span class="detalhe">${escapar(maisRaro.nome)}</span>`;
    }
    let cardAno = `<span class="valor">—</span><span class="rotulo">Ano mais ativo</span><span class="detalhe"></span>`;
    if (anoMaisAtivo) {
        cardAno = `<span class="valor">${anoMaisAtivo}</span><span class="rotulo">Ano mais ativo</span>` +
            `<span class="detalhe">${porAno[anoMaisAtivo]} emblemas nesse ano</span>`;
    }

    return `<div class="grade-numeros">` +
        `<div class="numero-card destaque"><span class="valor">${formatarNumero(todos.length)}</span><span class="rotulo">Emblemas</span><span class="detalhe">em ${jogosDiferentes} jogos diferentes</span></div>` +
        `<div class="numero-card">${cardPrimeiro}</div>` +
        `<div class="numero-card">${cardRaro}</div>` +
        `<div class="numero-card">${cardAno}</div>` +
        `</div>`;
}

function contarPorAno() {
    let porAno = {};
    for (let i = 0; i < todos.length; i++) {
        let ano = new Date(todos[i].data).getFullYear();
        if (porAno[ano] == null) {
            porAno[ano] = 0;
        }
        porAno[ano]++;
    }
    return porAno;
}

function htmlLinhaDoTempo() {
    let grupos = {};
    let anos = [];
    for (let i = 0; i < todos.length; i++) {
        let ano = new Date(todos[i].data).getFullYear();
        if (grupos[ano] == null) {
            grupos[ano] = [];
            anos.push(ano);
        }
        grupos[ano].push(todos[i]);
    }

    let html = ``;
    for (let i = 0; i < anos.length; i++) {
        let lista = grupos[anos[i]];
        let jogosNoAno = contarJogosDiferentes(lista);
        html += `<div class="linha-tempo-ano"><h3>${anos[i]} <span>· ${lista.length} emblemas em ${jogosNoAno} jogos</span></h3><div class="fila-emblemas">`;
        for (let j = 0; j < lista.length; j++) {
            html += `<img src="${imagem(lista[j].icone, `img/sterben-emblema.svg`)}" alt="" loading="lazy" onclick="abrirEmblema(${lista[j].id})" title="${escapar(lista[j].nome)} · ${escapar(nomeDoJogo(lista[j]))}">`;
        }
        html += `</div></div>`;
    }
    return `<section class="painel">${html}</section>`;
}

function contarPorJogo() {
    let contagem = {};
    for (let i = 0; i < todos.length; i++) {
        let chave = todos[i].jogoId;
        if (!chave) {
            chave = `desconhecido`;
        }
        if (contagem[chave] == null) {
            contagem[chave] = { jogoId: todos[i].jogoId, nome: nomeDoJogo(todos[i]), total: 0 };
        }
        contagem[chave].total++;
    }
    let lista = [];
    for (let chave in contagem) {
        lista.push(contagem[chave]);
    }
    lista.sort(function (a, b) {
        return b.total - a.total;
    });
    return lista;
}

function htmlPorJogo() {
    let lista = contarPorJogo();
    let maior = 1;
    if (lista.length > 0) {
        maior = lista[0].total;
    }
    let html = `<ul class="barras">`;
    for (let i = 0; i < Math.min(lista.length, 20); i++) {
        let item = lista[i];
        let jogo = jogosMapa[item.jogoId];
        let icone = null;
        if (jogo) {
            icone = jogo.icone;
        }
        html += `<li>` +
            `<img src="${imagem(icone, `img/jogo-padrao.svg`)}" alt="">` +
            `<span class="barra-nome" title="${escapar(item.nome)}">${escapar(item.nome)}</span>` +
            `<div class="barra-fundo"><div class="barra-valor" style="width: ${item.total / maior * 100}%;"></div></div>` +
            `<span class="barra-numero">${item.total}</span>` +
            `</li>`;
    }
    html += `</ul>`;
    return `<section class="painel"><div class="painel-cabecalho"><h2>Jogos com mais emblemas</h2><span>${lista.length} jogos no total</span></div>${html}</section>`;
}

function htmlMaisRaros() {
    let comRaridade = [];
    for (let i = 0; i < todos.length; i++) {
        if (todos[i].raridade != null) {
            comRaridade.push(todos[i]);
        }
    }
    comRaridade.sort(function (a, b) {
        return a.raridade - b.raridade;
    });
    let html = ``;
    for (let i = 0; i < Math.min(comRaridade.length, 18); i++) {
        html += htmlEmblema(comRaridade[i]);
    }
    if (html == ``) {
        html = `<p class="texto-cinza">Sem dados de raridade.</p>`;
    }
    return `<section class="painel"><div class="painel-cabecalho"><h2>Os mais difíceis de conseguir</h2>` +
        `<span>porcentagem de jogadores que conseguiram</span></div>` +
        `<div class="grade-emblemas">${html}</div></section>`;
}

function htmlTodos() {
    let opcoesJogos = `<option value="">Todos os jogos</option>`;
    let lista = contarPorJogo();
    for (let i = 0; i < lista.length; i++) {
        opcoesJogos += `<option value="${lista[i].jogoId}">${escapar(lista[i].nome)} (${lista[i].total})</option>`;
    }
    return `<div class="filtros">` +
        `<select class="campo" id="select_filtro_jogo" onchange="trocouJogo()">${opcoesJogos}</select>` +
        `<select class="campo" id="select_filtro_ordem" onchange="atualizarTodos()">` +
        `<option value="recentes">Mais recentes</option>` +
        `<option value="antigos">Mais antigos</option>` +
        `<option value="raros">Mais raros</option>` +
        `<option value="comuns">Mais comuns</option>` +
        `</select>` +
        `<input class="campo" id="input_filtro_busca" placeholder="Buscar emblema pelo nome" oninput="atualizarTodos()">` +
        `</div>` +
        `<div class="grade-emblemas" id="div_grade_todos"></div>` +
        `<p style="text-align: center; margin-top: 16px;"><button class="btn-contorno" id="btn_mostrar_mais" onclick="mostrarMais()">Mostrar mais</button></p>`;
}

function raridadeParaOrdenar(emblema, valorSeNaoTiver) {
    if (emblema.raridade == null) {
        return valorSeNaoTiver;
    }
    return emblema.raridade;
}

function atualizarTodos() {
    let jogo = select_filtro_jogo.value;
    let ordem = select_filtro_ordem.value;
    let busca = input_filtro_busca.value.trim().toLowerCase();

    let lista = [];
    for (let i = 0; i < todos.length; i++) {
        let e = todos[i];
        if (jogo != `` && String(e.jogoId) != jogo) {
            continue;
        }
        if (busca != `` && e.nome.toLowerCase().indexOf(busca) == -1) {
            continue;
        }
        lista.push(e);
    }

    if (ordem == `antigos`) {
        lista.sort(function (a, b) { return new Date(a.data) - new Date(b.data); });
    }
    if (ordem == `recentes`) {
        lista.sort(function (a, b) { return new Date(b.data) - new Date(a.data); });
    }
    if (ordem == `raros`) {
        lista.sort(function (a, b) { return raridadeParaOrdenar(a, 101) - raridadeParaOrdenar(b, 101); });
    }
    if (ordem == `comuns`) {
        lista.sort(function (a, b) { return raridadeParaOrdenar(b, -1) - raridadeParaOrdenar(a, -1); });
    }

    let html = ``;
    for (let i = 0; i < Math.min(lista.length, quantidadeMostrada); i++) {
        html += htmlEmblema(lista[i]);
    }
    if (html == ``) {
        html = `<p class="texto-cinza">Nenhum emblema encontrado.</p>`;
    }
    div_grade_todos.innerHTML = html;

    if (lista.length > quantidadeMostrada) {
        btn_mostrar_mais.style.display = `inline-block`;
    } else {
        btn_mostrar_mais.style.display = `none`;
    }
}

function trocouJogo() {
    quantidadeMostrada = 60;
    atualizarTodos();
}

function mostrarMais() {
    quantidadeMostrada += 60;
    atualizarTodos();
}

function abrirEmblema(id) {
    let e = null;
    for (let i = 0; i < todos.length; i++) {
        if (todos[i].id == id) {
            e = todos[i];
        }
    }
    if (e == null) {
        return;
    }

    let nivel = nivelRaridade(e.raridade);
    let descricao = `<span class="texto-cinza">Sem descrição.</span>`;
    if (e.descricao) {
        descricao = escapar(e.descricao);
    }
    div_modal_conteudo.innerHTML =
        `<div class="modal-emblema">` +
        `<img src="${imagem(e.icone, `img/sterben-emblema.svg`)}" alt="">` +
        `<div><p class="sobretitulo">${escapar(nomeDoJogo(e))}</p>` +
        `<h2>${escapar(e.nome)}</h2>` +
        `<p>${descricao}</p>` +
        `<ul class="lista-itens">` +
        `<li><div class="item-texto"><span>Conquistado em</span></div><span class="item-valor">${formatarData(e.data)}</span></li>` +
        `<li><div class="item-texto"><span>Raridade</span></div><span class="item-valor raridade-${nivel.classe}">${nivel.nome} (${formatarPorcentagem(e.raridade)})</span></li>` +
        `<li><div class="item-texto"><span>Pessoas que têm</span></div><span class="item-valor">${formatarNumero(e.conquistados)}</span></li>` +
        `</ul>` +
        `<p style="margin-top: 14px;"><a class="btn" href="https://www.roblox.com/badges/${e.id}" target="_blank">Ver no Roblox</a></p>` +
        `</div></div>`;
    div_modal_fundo.classList.add(`aberto`);
}

function fecharEmblema() {
    div_modal_fundo.classList.remove(`aberto`);
}

function clicouNoFundo(evento) {
    if (evento.target.id == `div_modal_fundo`) {
        fecharEmblema();
    }
}

function trocarAba(nome) {
    let nomes = [`tempo`, `jogos`, `raros`, `todos`];
    for (let i = 0; i < nomes.length; i++) {
        document.getElementById(`btn_aba_${nomes[i]}`).classList.remove(`ativa`);
        document.getElementById(`div_aba_${nomes[i]}`).classList.remove(`ativo`);
    }
    document.getElementById(`btn_aba_${nome}`).classList.add(`ativa`);
    document.getElementById(`div_aba_${nome}`).classList.add(`ativo`);
}

function carregarEmblemas() {
    let conteudo = div_conteudo;

    if (!idEmblemas) {
        conteudo.innerHTML = htmlSemId();
        return;
    }

    if (idEmblemas != sessao.robloxId) {
        roblox.usuario(idEmblemas)
            .then(function (u) {
                div_titulo.innerHTML = `Emblemas de ${escapar(u.apelido)}`;
                div_subtitulo.innerHTML = `<a href="perfil.html?id=${u.id}">← Voltar ao perfil de @${escapar(u.nome)}</a>`;
            })
            .catch(function () {});
    }

    todosEmblemas(idEmblemas, function (carregados, total) {
        conteudo.innerHTML = htmlProgresso(carregados, total);
    })
        .then(function (dados) {
            todos = dados.emblemas;
            jogosMapa = dados.jogos;
            mostrarEmblemas();
        })
        .catch(function (erro) {
            conteudo.innerHTML = `<div class="painel vazio"><h2>Jogador não encontrado</h2><p>Confira o ID.</p></div>`;
        });
}

function mostrarEmblemas() {
    let conteudo = div_conteudo;

    if (todos.length == 0) {
        conteudo.innerHTML = `<div class="painel vazio"><h2>Nenhum emblema ainda</h2><p>Os emblemas aparecem aqui quando a pessoa ganha conquistas nos jogos.</p></div>`;
        return;
    }

    conteudo.innerHTML =
        htmlResumo() +
        `<div class="abas">` +
        `<button class="aba ativa" id="btn_aba_tempo" onclick="trocarAba('tempo')">Linha do tempo</button>` +
        `<button class="aba" id="btn_aba_jogos" onclick="trocarAba('jogos')">Por jogo</button>` +
        `<button class="aba" id="btn_aba_raros" onclick="trocarAba('raros')">Mais raros</button>` +
        `<button class="aba" id="btn_aba_todos" onclick="trocarAba('todos')">Todos</button>` +
        `</div>` +
        `<div class="conteudo-aba ativo" id="div_aba_tempo">${htmlLinhaDoTempo()}</div>` +
        `<div class="conteudo-aba" id="div_aba_jogos">${htmlPorJogo()}</div>` +
        `<div class="conteudo-aba" id="div_aba_raros">${htmlMaisRaros()}</div>` +
        `<div class="conteudo-aba" id="div_aba_todos">${htmlTodos()}</div>`;

    atualizarTodos();
}

carregarEmblemas();
