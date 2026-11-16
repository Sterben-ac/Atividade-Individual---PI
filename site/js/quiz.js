let perguntaAtual = 0;
let acertos = 0;
let respostas = [];

function lerTentativas() {
    let salvas = localStorage.getItem(`sterben_quiz`);
    if (salvas == null) {
        return [];
    }
    return JSON.parse(salvas);
}

function telaInicio() {
    let tentativas = lerTentativas();
    let recorde = ``;
    if (tentativas.length > 0) {
        let melhor = 0;
        for (let i = 0; i < tentativas.length; i++) {
            if (tentativas[i].acertos > melhor) {
                melhor = tentativas[i].acertos;
            }
        }
        recorde = `<p class="texto-cinza">Seu recorde: <strong>${melhor}/${PERGUNTAS.length}</strong> em ${tentativas.length} tentativas.</p>`;
    }
    div_quiz.innerHTML =
        `<div class="quiz-centro">` +
        `<img src="img/sterben-emblema.svg" alt="" class="quiz-icone">` +
        `<h2>${PERGUNTAS.length} perguntas, sem tempo limite</h2>` +
        recorde +
        `<button class="btn btn-grande" onclick="comecar()">Começar</button>` +
        `</div>`;
}

function comecar() {
    perguntaAtual = 0;
    acertos = 0;
    respostas = [];
    mostrarPergunta();
}

function mostrarPergunta() {
    let p = PERGUNTAS[perguntaAtual];
    let letras = [`A`, `B`, `C`, `D`];
    let botoes = ``;
    for (let i = 0; i < p.opcoes.length; i++) {
        botoes += `<button class="opcao" id="btn_opcao_${i}" onclick="responder(${i})"><span>${letras[i]}</span>${p.opcoes[i]}</button>`;
    }
    let progresso = perguntaAtual / PERGUNTAS.length * 100;

    div_quiz.innerHTML =
        `<div class="quiz-topo"><span>Pergunta ${perguntaAtual + 1} de ${PERGUNTAS.length}</span><span>${acertos} acertos</span></div>` +
        `<div class="barra-progresso"><div style="width: ${progresso}%;"></div></div>` +
        `<h2 class="quiz-pergunta">${p.pergunta}</h2>` +
        `<div class="opcoes">${botoes}</div>` +
        `<div id="div_explicacao"></div>`;
}

function responder(escolhida) {
    let p = PERGUNTAS[perguntaAtual];
    let acertou = false;
    if (escolhida == p.correta) {
        acertou = true;
        acertos++;
    }
    respostas.push(acertou);

    for (let i = 0; i < p.opcoes.length; i++) {
        let opcao = document.getElementById(`btn_opcao_${i}`);
        opcao.disabled = true;
        if (i == p.correta) {
            opcao.classList.add(`certa`);
        } else if (i == escolhida) {
            opcao.classList.add(`errada`);
        }
    }

    let classeAviso = `aviso`;
    let titulo = `Errou.`;
    if (acertou) {
        classeAviso = `aviso aviso-certo`;
        titulo = `Acertou!`;
    }
    let textoBotao = `Próxima`;
    if (perguntaAtual == PERGUNTAS.length - 1) {
        textoBotao = `Ver resultado`;
    }

    div_explicacao.innerHTML =
        `<div class="${classeAviso}"><strong>${titulo}</strong> ${p.explicacao}</div>` +
        `<button class="btn btn-grande" onclick="proximaPergunta()">${textoBotao}</button>`;
}

function proximaPergunta() {
    perguntaAtual++;
    if (perguntaAtual < PERGUNTAS.length) {
        mostrarPergunta();
    } else {
        telaResultado();
    }
}

function telaResultado() {
    let tentativas = lerTentativas();
    tentativas.push({ data: new Date().toISOString(), acertos: acertos, total: PERGUNTAS.length, respostas: respostas });
    localStorage.setItem(`sterben_quiz`, JSON.stringify(tentativas));

    let porcentagem = Math.round(acertos / PERGUNTAS.length * 100);
    let mensagem = ``;
    if (porcentagem == 100) {
        mensagem = `Perfeito! Você é um veterano de verdade.`;
    } else if (porcentagem >= 70) {
        mensagem = `Muito bom! Dá para ver que você conhece o Roblox.`;
    } else if (porcentagem >= 40) {
        mensagem = `Nada mal! Mas ainda tem história para descobrir.`;
    } else {
        mensagem = `Bacon hair detectado! Que tal ler a página "Minha história"?`;
    }

    let revisao = `<ul class="lista-itens">`;
    for (let i = 0; i < PERGUNTAS.length; i++) {
        let classe = `negativo`;
        let simbolo = `✘`;
        if (respostas[i]) {
            classe = `positivo`;
            simbolo = `✔`;
        }
        revisao += `<li><span class="${classe}" style="font-size: 20px;">${simbolo}</span>` +
            `<div class="item-texto"><strong>${PERGUNTAS[i].pergunta}</strong>` +
            `<span>Resposta: ${PERGUNTAS[i].opcoes[PERGUNTAS[i].correta]}</span></div></li>`;
    }
    revisao += `</ul>`;

    div_quiz.innerHTML =
        `<div class="quiz-centro">` +
        `<p class="sobretitulo">Resultado</p>` +
        `<p class="quiz-placar">${acertos}<span>/${PERGUNTAS.length}</span></p>` +
        `<h2>${mensagem}</h2>` +
        `<div class="quiz-botoes"><button class="btn btn-grande" onclick="comecar()">Tentar de novo</button>` +
        `<a href="dashboard.html" class="btn-contorno">Ver na dashboard</a></div>` +
        `</div>` +
        `<h3 style="margin: 24px 0 8px;">Revisão</h3>${revisao}`;
}

telaInicio();
