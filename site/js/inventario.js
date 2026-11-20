let idInventario = pegarIdRoblox();

let limitados = [];
let ordemTabela = { coluna: `rap`, crescente: false };

function maiorChave(objeto) {
    let maior = null;
    for (let chave in objeto) {
        if (maior == null || objeto[chave] > objeto[maior]) {
            maior = chave;
        }
    }
    return maior;
}

function contarChaves(objeto) {
    let quantidade = 0;
    for (let chave in objeto) {
        quantidade++;
    }
    return quantidade;
}

function htmlBarras(objeto, ordenarPorValor, limite) {
    if (limite == null) {
        limite = 50;
    }
    let chaves = [];
    for (let chave in objeto) {
        chaves.push(chave);
    }
    if (ordenarPorValor) {
        chaves.sort(function (a, b) { return objeto[b] - objeto[a]; });
    } else {
        chaves.sort();
    }
    chaves = chaves.slice(0, limite);

    let maior = 1;
    for (let i = 0; i < chaves.length; i++) {
        if (objeto[chaves[i]] > maior) {
            maior = objeto[chaves[i]];
        }
    }

    let html = `<ul class="barras sem-icone barras-largas">`;
    for (let i = 0; i < chaves.length; i++) {
        let valor = objeto[chaves[i]];
        html += `<li><span class="barra-nome" title="${escapar(chaves[i])}">${escapar(chaves[i])}</span>` +
            `<div class="barra-fundo"><div class="barra-valor" style="width: ${valor / maior * 100}%;"></div></div>` +
            `<span class="barra-numero">${formatarNumero(valor)}</span></li>`;
    }
    return `${html}</ul>`;
}

function htmlItemCard(item, linha) {
    return `<a class="item-visual" href="https://www.roblox.com/catalog/${item.id}" target="_blank" style="color: inherit;">` +
        `<img src="${imagem(item.imagem, `img/jogo-padrao.svg`)}" alt="" loading="lazy">` +
        `<div><strong title="${escapar(item.nome)}">${escapar(item.nome)}</strong><span>${linha}</span></div>` +
        `</a>`;
}

function htmlVisaoGeral(dados, totalRap, custoVisual) {
    if (dados.totalItens == 0) {
        let motivo = `O inventário está vazio ou privado.`;
        if (dados.motivoBloqueio) {
            motivo = dados.motivoBloqueio;
        }
        return `<div class="painel vazio"><h2>Não foi possível ler o inventário completo</h2>` +
            `<p>${escapar(motivo)}</p></div>`;
    }
    let tipoFavorito = maiorChave(dados.porTipo);
    let anoMaisAtivo = maiorChave(dados.porAno);
    let antigo = dados.maisAntigo;

    let mais = ``;
    if (dados.temMaisItens) {
        mais = `+`;
    }
    let passes = ``;
    if (dados.totalPasses != null) {
        passes = `+ ${formatarNumero(dados.totalPasses)} passes de jogo`;
    }

    let cardDesde = `<span class="valor">—</span><span class="rotulo">Colecionando desde</span><span class="detalhe"></span>`;
    let curiosidadeAntigo = ``;
    if (antigo) {
        cardDesde = `<span class="valor">${new Date(antigo.data).getFullYear()}</span><span class="rotulo">Colecionando desde</span>` +
            `<span class="detalhe">primeiro item em ${formatarData(antigo.data)}</span>`;
        curiosidadeAntigo = `<div class="curiosidade"><img src="${imagem(antigo.imagem, `img/jogo-padrao.svg`)}" alt="">` +
            `<div><span class="texto-cinza">Seu item mais antigo</span><strong>${escapar(antigo.nome)}</strong>` +
            `<span>${escapar(antigo.tipo)} · ${formatarData(antigo.data)}</span></div></div>`;
    }

    let curiosidadeTipo = `<div class="curiosidade"><div class="curiosidade-numero">—</div><div><span class="texto-cinza">Tipo que você mais tem</span><strong>—</strong><span></span></div></div>`;
    if (tipoFavorito) {
        let porcentoTipo = Math.round(dados.porTipo[tipoFavorito] / dados.totalItens * 100);
        curiosidadeTipo = `<div class="curiosidade"><div class="curiosidade-numero">${dados.porTipo[tipoFavorito]}</div>` +
            `<div><span class="texto-cinza">Tipo que você mais tem</span><strong>${escapar(tipoFavorito)}</strong>` +
            `<span>${porcentoTipo}% do inventário</span></div></div>`;
    }

    let curiosidadeAno = `<div class="curiosidade"><div class="curiosidade-numero">—</div><div><span class="texto-cinza">Ano em que mais ganhou itens</span><strong>—</strong><span>itens adicionados nesse ano</span></div></div>`;
    if (anoMaisAtivo) {
        curiosidadeAno = `<div class="curiosidade"><div class="curiosidade-numero">${dados.porAno[anoMaisAtivo]}</div>` +
            `<div><span class="texto-cinza">Ano em que mais ganhou itens</span><strong>${anoMaisAtivo}</strong>` +
            `<span>itens adicionados nesse ano</span></div></div>`;
    }

    return `<div class="grade-numeros">` +
        `<div class="numero-card destaque"><span class="valor">${formatarNumero(dados.totalItens)}${mais}</span><span class="rotulo">Itens no inventário</span><span class="detalhe">${passes}</span></div>` +
        `<div class="numero-card"><span class="valor robux">${numeroCurto(totalRap)}</span><span class="rotulo">Valor dos limitados (RAP)</span><span class="detalhe">${limitados.length} itens limitados</span></div>` +
        `<div class="numero-card"><span class="valor robux">${formatarNumero(custoVisual)}</span><span class="rotulo">Custo do visual atual</span><span class="detalhe">itens à venda na loja</span></div>` +
        `<div class="numero-card">${cardDesde}</div>` +
        `</div>` +
        `<div class="duas-colunas">` +
        `<section class="painel"><div class="painel-cabecalho"><h2>Itens por tipo</h2><span>${contarChaves(dados.porTipo)} tipos</span></div>${htmlBarras(dados.porTipo, true, 14)}</section>` +
        `<section class="painel"><div class="painel-cabecalho"><h2>Itens por ano</h2><span>quando você ganhou ou comprou</span></div>${htmlBarras(dados.porAno, false)}</section>` +
        `</div>` +
        `<section class="painel" style="margin-top: 20px;"><h2>Curiosidades</h2><div class="curiosidades">` +
        `${curiosidadeAntigo}${curiosidadeTipo}${curiosidadeAno}` +
        `</div></section>`;
}

function htmlAvatar(dados, visualHtml) {
    let av = dados.avatar;
    if (av == null) {
        av = {};
    }
    let nomesPartes = { headColor3: `Cabeça`, torsoColor3: `Tronco`, leftArmColor3: `Braço esq.`, rightArmColor3: `Braço dir.`, leftLegColor3: `Perna esq.`, rightLegColor3: `Perna dir.` };

    let cores = ``;
    if (av.cores) {
        for (let parte in nomesPartes) {
            if (av.cores[parte]) {
                cores += `<div class="cor-corpo"><span style="background-color: #${escapar(av.cores[parte])};"></span>${nomesPartes[parte]}</div>`;
            }
        }
    }

    let listaEmotes = av.emotes;
    if (listaEmotes == null) {
        listaEmotes = [];
    }
    let emotes = ``;
    for (let i = 0; i < listaEmotes.length; i++) {
        emotes += `<span class="selo" style="margin: 0 4px 6px 0;">${escapar(listaEmotes[i].nome)}</span>`;
    }

    let roupas = ``;
    for (let i = 0; i < dados.roupas.length; i++) {
        roupas += `<div class="item-visual"><img src="${imagem(dados.roupas[i].imagem, `img/avatar-padrao.svg`)}" alt="" loading="lazy">` +
            `<div><strong title="${escapar(dados.roupas[i].nome)}">${escapar(dados.roupas[i].nome)}</strong></div></div>`;
    }
    if (roupas == ``) {
        roupas = `<p class="texto-cinza">Nenhuma roupa salva (ou a lista é privada).</p>`;
    }

    let tipo = `—`;
    if (av.tipo) {
        tipo = av.tipo;
    }
    let altura = `—`;
    if (av.escala && av.escala.height) {
        altura = `${Math.round(av.escala.height * 100)}%`;
    }

    let blocoCores = ``;
    if (cores != ``) {
        blocoCores = `<p class="texto-cinza" style="margin-bottom: 6px;">Cores do corpo</p><div class="cores-corpo">${cores}</div>`;
    }
    let blocoEmotes = ``;
    if (emotes != ``) {
        blocoEmotes = `<p class="texto-cinza" style="margin: 12px 0 6px;">Emotes</p><div>${emotes}</div>`;
    }

    return `<section class="painel"><div class="perfil-topo">` +
        `<img src="${imagem(av.imagem, `img/avatar-padrao.svg`)}" alt="avatar" class="perfil-avatar">` +
        `<div class="perfil-info">` +
        `<h2>Avatar atual</h2>` +
        `<div class="perfil-contagens">` +
        `<div><strong>${escapar(tipo)}</strong><span>Tipo de corpo</span></div>` +
        `<div><strong>${altura}</strong><span>Altura</span></div>` +
        `<div><strong>${listaEmotes.length}</strong><span>Emotes equipados</span></div>` +
        `<div><strong>${dados.roupas.length}</strong><span>Roupas salvas</span></div>` +
        `</div>` +
        blocoCores +
        blocoEmotes +
        `</div></div></section>` +
        visualHtml +
        `<section class="painel"><div class="painel-cabecalho"><h2>Roupas salvas</h2><span>visuais guardados no editor de avatar</span></div>` +
        `<div class="grade-itens">${roupas}</div></section>`;
}

function montarVisual(visual) {
    let total = 0;
    let itensPagos = 0;
    let html = ``;
    for (let i = 0; i < visual.length; i++) {
        let item = visual[i];
        let preco = ``;
        if (item.limitado) {
            preco = `Limitado`;
        } else if (item.preco > 0 && item.aVenda) {
            preco = `<span class="robux">${formatarNumero(item.preco)}</span>`;
            total += item.preco;
            itensPagos++;
        } else if (item.preco == 0 && item.aVenda) {
            preco = `Grátis`;
        } else {
            preco = `Fora de venda`;
        }
        html += htmlItemCard(item, preco);
    }
    if (html == ``) {
        html = `<p class="texto-cinza">Nenhum item.</p>`;
    }
    return {
        total: total,
        html: `<section class="painel">` +
            `<div class="painel-cabecalho"><h2>Visual que está usando</h2>` +
            `<span>${visual.length} itens · ${itensPagos} pagos somam <strong class="robux">${formatarNumero(total)}</strong> Robux</span></div>` +
            `<div class="grade-itens">${html}</div>` +
            `</section>`
    };
}

function htmlUltimos(dados) {
    let html = ``;
    for (let i = 0; i < dados.ultimos.length; i++) {
        let item = dados.ultimos[i];
        html += htmlItemCard(item, `${escapar(item.tipo)} · ${formatarData(item.data)}`);
    }
    if (html == ``) {
        html = `<p class="texto-cinza">Nenhum item com data.</p>`;
    }
    return `<section class="painel"><div class="painel-cabecalho"><h2>Últimos itens que entraram no inventário</h2><span>comprados ou ganhos</span></div>` +
        `<div class="grade-itens">${html}</div></section>`;
}

function htmlLimitados(dados, totalRap) {
    let maisValioso = null;
    for (let i = 0; i < limitados.length; i++) {
        if (maisValioso == null || limitados[i].rap > maisValioso.rap) {
            maisValioso = limitados[i];
        }
    }

    let cardRolimons = `<div class="numero-card"><span class="valor">—</span><span class="rotulo">Value (Rolimons)</span><span class="detalhe">conta não encontrada no Rolimons</span></div>`;
    if (dados.rolimons) {
        cardRolimons = `<div class="numero-card"><span class="valor robux">${numeroCurto(dados.rolimons.valor)}</span><span class="rotulo">Value (Rolimons)</span><span class="detalhe">estimativa da comunidade</span></div>`;
    }

    let valorMaisValioso = `—`;
    let nomeMaisValioso = `nenhum limitado`;
    if (maisValioso) {
        valorMaisValioso = `<span class="robux">${numeroCurto(maisValioso.rap)}</span>`;
        nomeMaisValioso = escapar(maisValioso.nome);
    }

    return `<div class="grade-numeros">` +
        `<div class="numero-card destaque"><span class="valor robux">${numeroCurto(totalRap)}</span><span class="rotulo">Valor dos limitados (RAP)</span><span class="detalhe">${formatarNumero(totalRap)} Robux</span></div>` +
        cardRolimons +
        `<div class="numero-card"><span class="valor">${valorMaisValioso}</span><span class="rotulo">Item mais valioso</span><span class="detalhe">${nomeMaisValioso}</span></div>` +
        `<div class="numero-card"><span class="valor">${limitados.length}</span><span class="rotulo">Itens limitados</span><span class="detalhe">podem ser trocados e revendidos</span></div>` +
        `</div>` +
        `<section class="painel"><div class="painel-cabecalho"><h2>Itens limitados</h2><span>clique no título da coluna para ordenar</span></div>` +
        `<div id="div_tabela_limitados"></div></section>`;
}

function lucro(item) {
    if (!item.precoOriginal) {
        return null;
    }
    return item.rap - item.precoOriginal;
}

function valorDaColuna(item, coluna) {
    let valor = item[coluna];
    if (coluna == `lucro`) {
        valor = lucro(item);
    }
    if (valor == null) {
        valor = -Infinity;
    }
    return valor;
}

function htmlTabelaLimitados() {
    let lista = limitados.slice();
    let c = ordemTabela.coluna;
    lista.sort(function (a, b) {
        if (c == `nome`) {
            if (ordemTabela.crescente) {
                return a.nome.localeCompare(b.nome);
            }
            return b.nome.localeCompare(a.nome);
        }
        if (ordemTabela.crescente) {
            return valorDaColuna(a, c) - valorDaColuna(b, c);
        }
        return valorDaColuna(b, c) - valorDaColuna(a, c);
    });

    let linhas = ``;
    for (let i = 0; i < lista.length; i++) {
        let item = lista[i];
        let ganho = lucro(item);
        let celulaGanho = `<span class="texto-cinza">—</span>`;
        if (ganho != null) {
            let porcento = Math.round(ganho / item.precoOriginal * 100);
            if (ganho >= 0) {
                celulaGanho = `<span class="positivo">+${formatarNumero(ganho)} (+${porcento}%)</span>`;
            } else {
                celulaGanho = `<span class="negativo">${formatarNumero(ganho)} (${porcento}%)</span>`;
            }
        }
        let serial = `<span class="texto-cinza">—</span>`;
        if (item.serial) {
            serial = `#${formatarNumero(item.serial)}`;
        }
        let precoOriginal = `<span class="texto-cinza">—</span>`;
        if (item.precoOriginal) {
            precoOriginal = formatarNumero(item.precoOriginal);
        }
        linhas += `<tr>` +
            `<td><img src="${imagem(item.imagem, `img/jogo-padrao.svg`)}" alt="" loading="lazy"></td>` +
            `<td><a href="https://www.roblox.com/catalog/${item.id}" target="_blank" style="color: inherit;">${escapar(item.nome)}</a></td>` +
            `<td class="num">${serial}</td>` +
            `<td class="num"><span class="robux">${formatarNumero(item.rap)}</span></td>` +
            `<td class="num">${precoOriginal}</td>` +
            `<td class="num">${celulaGanho}</td>` +
            `</tr>`;
    }

    return `<table class="tabela"><thead><tr>` +
        `<th></th>${htmlTitulo(`nome`, `Item`, ``)}${htmlTitulo(`serial`, `Serial`, `num`)}${htmlTitulo(`rap`, `RAP`, `num`)}` +
        `${htmlTitulo(`precoOriginal`, `Preço original`, `num`)}${htmlTitulo(`lucro`, `Valorização`, `num`)}` +
        `</tr></thead><tbody>${linhas}</tbody></table>`;
}

function htmlTitulo(coluna, texto, classe) {
    let seta = ``;
    if (ordemTabela.coluna == coluna) {
        if (ordemTabela.crescente) {
            seta = ` ▲`;
        } else {
            seta = ` ▼`;
        }
    }
    return `<th class="${classe}" onclick="ordenarPor('${coluna}')" style="cursor: pointer;">${texto}${seta}</th>`;
}

function ordenarPor(coluna) {
    if (ordemTabela.coluna == coluna) {
        ordemTabela.crescente = !ordemTabela.crescente;
    } else {
        ordemTabela = { coluna: coluna, crescente: coluna == `nome` };
    }
    desenharTabela();
}

function desenharTabela() {
    div_tabela_limitados.innerHTML = htmlTabelaLimitados();
}

function trocarAba(nome) {
    let nomes = [`geral`, `avatar`, `ultimos`, `limitados`];
    for (let i = 0; i < nomes.length; i++) {
        document.getElementById(`btn_aba_${nomes[i]}`).classList.remove(`ativa`);
        document.getElementById(`div_aba_${nomes[i]}`).classList.remove(`ativo`);
    }
    document.getElementById(`btn_aba_${nome}`).classList.add(`ativa`);
    document.getElementById(`div_aba_${nome}`).classList.add(`ativo`);
}

function carregarInventario() {
    let conteudo = div_conteudo;

    if (!idInventario) {
        conteudo.innerHTML = htmlSemId();
        return;
    }

    if (idInventario != sessao.robloxId) {
        roblox.usuario(idInventario)
            .then(function (u) {
                div_titulo.innerHTML = `Inventário de ${escapar(u.apelido)}`;
                div_subtitulo.innerHTML = `<a href="perfil.html?id=${u.id}">← Voltar ao perfil de @${escapar(u.nome)}</a>`;
            })
            .catch(function () {});
    }

    roblox.inventario(idInventario)
        .then(function (dados) {
            mostrarInventario(dados);
        })
        .catch(function (erro) {
            conteudo.innerHTML = `<div class="painel vazio"><h2>Jogador não encontrado</h2><p>Confira o ID.</p></div>`;
        });
}

function mostrarInventario(dados) {
    limitados = dados.limitados;
    let totalRap = 0;
    for (let i = 0; i < limitados.length; i++) {
        totalRap += limitados[i].rap;
    }
    let visual = montarVisual(dados.visual);

    let aviso = ``;
    if (dados.motivoBloqueio) {
        aviso = `<div class="aviso"><strong>Parte do inventário não carregou:</strong> ${escapar(dados.motivoBloqueio)}</div>`;
    }

    div_conteudo.innerHTML = aviso +
        `<div class="abas">` +
        `<button class="aba ativa" id="btn_aba_geral" onclick="trocarAba('geral')">Visão geral</button>` +
        `<button class="aba" id="btn_aba_avatar" onclick="trocarAba('avatar')">Avatar e roupas</button>` +
        `<button class="aba" id="btn_aba_ultimos" onclick="trocarAba('ultimos')">Últimos itens</button>` +
        `<button class="aba" id="btn_aba_limitados" onclick="trocarAba('limitados')">Limitados</button>` +
        `</div>` +
        `<div class="conteudo-aba ativo" id="div_aba_geral">${htmlVisaoGeral(dados, totalRap, visual.total)}</div>` +
        `<div class="conteudo-aba" id="div_aba_avatar">${htmlAvatar(dados, visual.html)}</div>` +
        `<div class="conteudo-aba" id="div_aba_ultimos">${htmlUltimos(dados)}</div>` +
        `<div class="conteudo-aba" id="div_aba_limitados">${htmlLimitados(dados, totalRap)}</div>`;

    if (dados.bloqueado) {
        div_tabela_limitados.innerHTML = `<p class="texto-cinza">O Roblox não liberou a lista de itens limitados.</p>`;
    } else if (limitados.length == 0) {
        div_tabela_limitados.innerHTML = `<p class="texto-cinza">Nenhum item limitado. Normal: a maioria dos jogadores não tem!</p>`;
    } else {
        desenharTabela();
    }
}

carregarInventario();
