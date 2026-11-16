let generoEscolhido = `Todos`;

function htmlImagemJogo(jogo, classe) {
    if (jogo.imagem) {
        return `<img src="${jogo.imagem}" alt="${jogo.nome}" class="${classe}">`;
    }
    return `<div class="espaco-imagem ${classe}"><strong>Espaço para imagem</strong>${jogo.sugestaoImagem}</div>`;
}

function htmlNota(nota) {
    let estrelas = ``;
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.round(nota / 2)) {
            estrelas += `★`;
        } else {
            estrelas += `☆`;
        }
    }
    return `<span><span class="estrelas" title="Nota ${nota} de 10">${estrelas}</span> <span class="texto-cinza">${nota}/10</span></span>`;
}

function montarFiltros() {
    let generos = [`Todos`];
    for (let i = 0; i < MEUS_JOGOS.length; i++) {
        if (generos.indexOf(MEUS_JOGOS[i].genero) == -1) {
            generos.push(MEUS_JOGOS[i].genero);
        }
    }

    let html = ``;
    for (let i = 0; i < generos.length; i++) {
        let classe = `filtro`;
        if (generos[i] == generoEscolhido) {
            classe = `filtro ativo`;
        }
        html += `<button class="${classe}" onclick="escolherGenero('${generos[i]}')">${generos[i]}</button>`;
    }
    div_filtros.innerHTML = html;
}

function escolherGenero(genero) {
    generoEscolhido = genero;
    montarFiltros();
    montarCards();
}

function montarCards() {
    let html = ``;
    for (let i = 0; i < MEUS_JOGOS.length; i++) {
        let jogo = MEUS_JOGOS[i];
        if (generoEscolhido != `Todos` && jogo.genero != generoEscolhido) {
            continue;
        }

        html += `<article class="meu-jogo" onclick="abrirJogo(${i})">` +
            htmlImagemJogo(jogo, `meu-jogo-imagem`) +
            `<div class="meu-jogo-info">` +
            `<div class="meu-jogo-topo"><span class="selo">${jogo.genero}</span><span class="texto-cinza">desde ${jogo.ano}</span></div>` +
            `<h2>${jogo.nome}</h2>` +
            `<p>${jogo.resumo}</p>` +
            `<div class="meu-jogo-rodape">${htmlNota(jogo.nota)}<span class="ler-mais">Ler história →</span></div>` +
            `</div>` +
            `</article>`;
    }
    div_grade_jogos.innerHTML = html;
}

function abrirJogo(posicao) {
    let jogo = MEUS_JOGOS[posicao];
    if (jogo == null) {
        return;
    }
    let paragrafos = ``;
    for (let i = 0; i < jogo.texto.length; i++) {
        paragrafos += `<p>${jogo.texto[i]}</p>`;
    }
    div_modal_conteudo.innerHTML =
        htmlImagemJogo(jogo, `modal-imagem`) +
        `<p class="sobretitulo" style="margin-top: 18px;">${jogo.genero} · desde ${jogo.ano}</p>` +
        `<h2>${jogo.nome}</h2>` +
        `<p>${htmlNota(jogo.nota)}</p>` +
        paragrafos;
    div_modal_fundo.classList.add(`aberto`);
}

function fecharJogo() {
    div_modal_fundo.classList.remove(`aberto`);
}

function clicouNoFundo(evento) {
    if (evento.target.id == `div_modal_fundo`) {
        fecharJogo();
    }
}

document.onkeydown = function (evento) {
    if (evento.key == `Escape`) {
        fecharJogo();
    }
};

montarFiltros();
montarCards();

let jogoNoEndereco = pegarDoEndereco(`jogo`);
if (jogoNoEndereco != null) {
    abrirJogo(Number(jogoNoEndereco));
}
