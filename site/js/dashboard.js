let CORES = [`#E2231A`, `#FF8A3D`, `#FFB020`, `#3FA9FF`, `#B86BFF`, `#2EB872`, `#A0A4AD`, `#F25FA0`];

let graficos = [];
let dadosConta = null;

function corCss(nome) {
    return getComputedStyle(document.body).getPropertyValue(nome).trim();
}

function criarGrafico(idCanvas, configuracao) {
    let canvas = document.getElementById(idCanvas);
    if (canvas == null) {
        return;
    }
    if (typeof Chart == `undefined`) {
        canvas.parentElement.innerHTML = `<p class="texto-cinza">Não foi possível carregar o Chart.js (sem internet?).</p>`;
        return;
    }
    Chart.defaults.color = corCss(`--cinza`);
    Chart.defaults.borderColor = corCss(`--linha`);
    Chart.defaults.font.family = `'Source Sans 3', Arial, sans-serif`;
    Chart.defaults.font.size = 14;
    if (configuracao.options == null) {
        configuracao.options = {};
    }
    configuracao.options.maintainAspectRatio = false;
    graficos.push(new Chart(canvas, configuracao));
}

function cardNumero(valor, rotulo, detalhe, destaque) {
    let classe = `numero-card`;
    if (destaque) {
        classe = `numero-card destaque`;
    }
    if (detalhe == null) {
        detalhe = ``;
    }
    return `<div class="${classe}"><span class="valor">${valor}</span>` +
        `<span class="rotulo">${rotulo}</span><span class="detalhe">${detalhe}</span></div>`;
}

function contar(lista) {
    let contagem = {};
    for (let i = 0; i < lista.length; i++) {
        if (contagem[lista[i]] == null) {
            contagem[lista[i]] = 0;
        }
        contagem[lista[i]]++;
    }
    return contagem;
}

function nomesDe(objeto) {
    let nomes = [];
    for (let chave in objeto) {
        nomes.push(chave);
    }
    return nomes;
}

function valoresDe(objeto, nomes) {
    let valores = [];
    for (let i = 0; i < nomes.length; i++) {
        valores.push(objeto[nomes[i]]);
    }
    return valores;
}

function montarJornada() {
    let somaNotas = 0;
    let generos = [];
    let anosDosJogos = [];
    let nomesJogos = [];
    let notasJogos = [];
    for (let i = 0; i < MEUS_JOGOS.length; i++) {
        somaNotas += MEUS_JOGOS[i].nota;
        generos.push(MEUS_JOGOS[i].genero);
        anosDosJogos.push(MEUS_JOGOS[i].ano);
        nomesJogos.push(MEUS_JOGOS[i].nome);
        notasJogos.push(MEUS_JOGOS[i].nota);
    }
    let media = somaNotas / MEUS_JOGOS.length;

    let porGenero = contar(generos);
    let generoFavorito = ``;
    for (let genero in porGenero) {
        if (generoFavorito == `` || porGenero[genero] > porGenero[generoFavorito]) {
            generoFavorito = genero;
        }
    }

    let porAno = contar(anosDosJogos);
    let anos = nomesDe(porAno).sort();
    let melhorJogo = MEUS_JOGOS[0];
    for (let i = 1; i < MEUS_JOGOS.length; i++) {
        if (MEUS_JOGOS[i].nota > melhorJogo.nota) {
            melhorJogo = MEUS_JOGOS[i];
        }
    }

    div_numeros_jornada.innerHTML =
        cardNumero(MEUS_JOGOS.length, `Jogos que me marcaram`, `entre ${anos[0]} e ${anos[anos.length - 1]}`, true) +
        cardNumero(media.toLocaleString(`pt-BR`, { maximumFractionDigits: 1 }), `Nota média`, `de 0 a 10`) +
        cardNumero(generoFavorito, `Gênero favorito`, `${porGenero[generoFavorito]} jogos`) +
        cardNumero(melhorJogo.nota, `Maior nota`, melhorJogo.nome);

    let nomesGeneros = nomesDe(porGenero);
    criarGrafico(`canvas_grafico_generos`, {
        type: `doughnut`,
        data: {
            labels: nomesGeneros,
            datasets: [{ data: valoresDe(porGenero, nomesGeneros), backgroundColor: CORES, borderColor: corCss(`--caixa`), borderWidth: 3 }]
        },
        options: { plugins: { legend: { position: `right` } } }
    });

    criarGrafico(`canvas_grafico_notas`, {
        type: `bar`,
        data: {
            labels: nomesJogos,
            datasets: [{ label: `Nota`, data: notasJogos, backgroundColor: CORES[0], borderRadius: 4 }]
        },
        options: {
            indexAxis: `y`,
            plugins: { legend: { display: false } },
            scales: { x: { min: 0, max: 10 } }
        }
    });

    criarGrafico(`canvas_grafico_anos`, {
        type: `bar`,
        data: {
            labels: anos,
            datasets: [{ label: `Jogos começados`, data: valoresDe(porAno, anos), backgroundColor: CORES[0], borderRadius: 4 }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: function (item) {
                            let nomes = [];
                            for (let i = 0; i < MEUS_JOGOS.length; i++) {
                                if (String(MEUS_JOGOS[i].ano) == item.label) {
                                    nomes.push(MEUS_JOGOS[i].nome);
                                }
                            }
                            return nomes.join(`, `);
                        }
                    }
                }
            },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function carregarConta() {
    if (!sessao.robloxId) {
        div_conta_sem_id.innerHTML = htmlSemId();
        div_numeros_conta.innerHTML = ``;
        return;
    }
    todosEmblemas(sessao.robloxId, function (carregados, total) {
        div_numeros_conta.innerHTML = `<div style="grid-column: 1 / -1;">${htmlProgresso(carregados, total)}</div>`;
    })
        .then(function (dados) {
            dadosConta = dados;
            montarConta();
        })
        .catch(function (erro) {
            div_numeros_conta.innerHTML = `<p class="texto-cinza">Não foi possível carregar os emblemas.</p>`;
        });
}

function nomeDoJogo(id) {
    if (dadosConta.jogos[id]) {
        return dadosConta.jogos[id].nome;
    }
    let emblemas = dadosConta.emblemas;
    for (let i = 0; i < emblemas.length; i++) {
        if (String(emblemas[i].jogoId) == String(id) && emblemas[i].jogoNome) {
            return emblemas[i].jogoNome;
        }
    }
    return `Desconhecido`;
}

function montarConta() {
    if (dadosConta == null) {
        return;
    }
    let emblemas = dadosConta.emblemas;

    let anosEmblemas = [];
    let jogosEmblemas = [];
    for (let i = 0; i < emblemas.length; i++) {
        anosEmblemas.push(new Date(emblemas[i].data).getFullYear());
        jogosEmblemas.push(emblemas[i].jogoId);
    }

    let porAno = contar(anosEmblemas);
    let anos = nomesDe(porAno).sort();

    let acumulado = [];
    let soma = 0;
    for (let i = 0; i < anos.length; i++) {
        soma += porAno[anos[i]];
        acumulado.push(soma);
    }

    let faixas = { 'Impossível (<1%)': 0, 'Insano (1–5%)': 0, 'Extremo (5–10%)': 0, 'Difícil (10–20%)': 0, 'Mais fáceis (20%+)': 0 };
    let raros = 0;
    for (let i = 0; i < emblemas.length; i++) {
        let r = emblemas[i].raridade;
        if (r == null) {
            continue;
        }
        if (r < 1) {
            faixas[`Impossível (<1%)`]++;
        } else if (r < 5) {
            faixas[`Insano (1–5%)`]++;
        } else if (r < 10) {
            faixas[`Extremo (5–10%)`]++;
        } else if (r < 20) {
            faixas[`Difícil (10–20%)`]++;
        } else {
            faixas[`Mais fáceis (20%+)`]++;
        }
        if (r < 5) {
            raros++;
        }
    }

    let porJogo = contar(jogosEmblemas);
    let idsJogos = nomesDe(porJogo);
    idsJogos.sort(function (a, b) {
        return porJogo[b] - porJogo[a];
    });
    let topJogos = idsJogos.slice(0, 8);
    let nomesTop = [];
    let valoresTop = [];
    for (let i = 0; i < topJogos.length; i++) {
        nomesTop.push(nomeDoJogo(topJogos[i]));
        valoresTop.push(porJogo[topJogos[i]]);
    }

    let anoMaisAtivo = anos[0];
    for (let i = 0; i < anos.length; i++) {
        if (porAno[anos[i]] > porAno[anoMaisAtivo]) {
            anoMaisAtivo = anos[i];
        }
    }
    let mediaPorAno = emblemas.length / Math.max(anos.length, 1);

    div_numeros_conta.innerHTML =
        cardNumero(formatarNumero(emblemas.length), `Emblemas`, `em ${idsJogos.length} jogos`, true) +
        cardNumero(mediaPorAno.toLocaleString(`pt-BR`, { maximumFractionDigits: 1 }), `Emblemas por ano`, `média desde ${anos[0]}`) +
        cardNumero(anoMaisAtivo, `Ano mais ativo`, `${porAno[anoMaisAtivo]} emblemas`) +
        cardNumero(`${Math.round(raros / Math.max(emblemas.length, 1) * 100)}%`, `Emblemas raros`, `${raros} com menos de 5% de conquista`);

    criarGrafico(`canvas_grafico_emblemas_ano`, {
        type: `bar`,
        data: { labels: anos, datasets: [{ label: `Emblemas`, data: valoresDe(porAno, anos), backgroundColor: CORES[0], borderRadius: 4 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    let nomesFaixas = nomesDe(faixas);
    criarGrafico(`canvas_grafico_raridade`, {
        type: `doughnut`,
        data: {
            labels: nomesFaixas,
            datasets: [{ data: valoresDe(faixas, nomesFaixas), backgroundColor: [`#FFB020`, `#B86BFF`, `#3FA9FF`, `#2EB872`, `#A0A4AD`], borderColor: corCss(`--caixa`), borderWidth: 3 }]
        },
        options: { plugins: { legend: { position: `right` } } }
    });

    criarGrafico(`canvas_grafico_top_jogos`, {
        type: `bar`,
        data: {
            labels: nomesTop,
            datasets: [{ label: `Emblemas`, data: valoresTop, backgroundColor: CORES[0], borderRadius: 4 }]
        },
        options: { indexAxis: `y`, plugins: { legend: { display: false } } }
    });

    criarGrafico(`canvas_grafico_acumulado`, {
        type: `line`,
        data: {
            labels: anos,
            datasets: [{ label: `Total de emblemas`, data: acumulado, borderColor: CORES[0], backgroundColor: `rgba(226, 35, 26, 0.15)`, fill: true, tension: 0.3, pointRadius: 4 }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

function montarQuiz() {
    let tentativas = JSON.parse(localStorage.getItem(`sterben_quiz`));
    if (tentativas == null) {
        tentativas = [];
    }

    if (tentativas.length == 0) {
        div_numeros_quiz.innerHTML =
            `<div class="painel vazio" style="grid-column: 1 / -1;"><h2>Nenhuma tentativa ainda</h2>` +
            `<p>Faça o quiz para os seus resultados aparecerem aqui.</p><a href="quiz.html" class="btn btn-grande">Fazer o quiz</a></div>`;
        return;
    }

    let soma = 0;
    let melhor = 0;
    let rotulosTentativas = [];
    let acertosTentativas = [];
    for (let i = 0; i < tentativas.length; i++) {
        soma += tentativas[i].acertos;
        if (tentativas[i].acertos > melhor) {
            melhor = tentativas[i].acertos;
        }
        rotulosTentativas.push(`${i + 1}ª`);
        acertosTentativas.push(tentativas[i].acertos);
    }
    let total = tentativas[0].total;
    let ultima = tentativas[tentativas.length - 1];

    div_numeros_quiz.innerHTML =
        cardNumero(tentativas.length, `Tentativas`, `desde ${formatarData(tentativas[0].data)}`, true) +
        cardNumero(`${melhor}/${total}`, `Melhor resultado`, `${Math.round(melhor / total * 100)}% de acerto`) +
        cardNumero((soma / tentativas.length).toLocaleString(`pt-BR`, { maximumFractionDigits: 1 }), `Média de acertos`, `por tentativa`) +
        cardNumero(`${ultima.acertos}/${total}`, `Última tentativa`, formatarData(ultima.data));

    criarGrafico(`canvas_grafico_tentativas`, {
        type: `line`,
        data: {
            labels: rotulosTentativas,
            datasets: [{ label: `Acertos`, data: acertosTentativas, borderColor: CORES[0], backgroundColor: CORES[0], tension: 0.2, pointRadius: 5 }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: total, ticks: { stepSize: 1 } } } }
    });

    let acertosPergunta = [];
    let rotulosPerguntas = [];
    let coresPerguntas = [];
    for (let p = 0; p < PERGUNTAS.length; p++) {
        let acertou = 0;
        let respondeu = 0;
        for (let t = 0; t < tentativas.length; t++) {
            if (tentativas[t].respostas && tentativas[t].respostas[p] != null) {
                respondeu++;
                if (tentativas[t].respostas[p]) {
                    acertou++;
                }
            }
        }
        let porcento = 0;
        if (respondeu > 0) {
            porcento = Math.round(acertou / respondeu * 100);
        }
        acertosPergunta.push(porcento);
        rotulosPerguntas.push(`P${p + 1}`);
        if (porcento >= 50) {
            coresPerguntas.push(`#2EB872`);
        } else {
            coresPerguntas.push(CORES[0]);
        }
    }

    criarGrafico(`canvas_grafico_perguntas`, {
        type: `bar`,
        data: {
            labels: rotulosPerguntas,
            datasets: [{ label: `% de acerto`, data: acertosPergunta, backgroundColor: coresPerguntas, borderRadius: 4 }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function (itens) {
                            return PERGUNTAS[itens[0].dataIndex].pergunta;
                        }
                    }
                }
            },
            scales: { y: { min: 0, max: 100 } }
        }
    });
}

function trocarAba(nome) {
    let nomes = [`jornada`, `conta`, `quiz`];
    for (let i = 0; i < nomes.length; i++) {
        document.getElementById(`btn_aba_${nomes[i]}`).classList.remove(`ativa`);
        document.getElementById(`div_aba_${nomes[i]}`).classList.remove(`ativo`);
    }
    document.getElementById(`btn_aba_${nome}`).classList.add(`ativa`);
    document.getElementById(`div_aba_${nome}`).classList.add(`ativo`);
}

function montarTudo() {
    for (let i = 0; i < graficos.length; i++) {
        graficos[i].destroy();
    }
    graficos = [];
    montarJornada();
    montarConta();
    montarQuiz();
}

montarJornada();
montarQuiz();
carregarConta();
