function htmlResultado(j, mostrarComparar) {
    let nomeMostrado = j.nome;
    if (j.apelido) {
        nomeMostrado = j.apelido;
    }
    let exato = ``;
    if (j.exato) {
        exato = ` · nome exato`;
    }
    let botaoComparar = ``;
    if (mostrarComparar) {
        botaoComparar = `<a href="?comparar=${j.id}" class="btn-contorno">Comparar</a>`;
    }
    return `<div class="resultado">` +
        `<img src="${imagem(j.foto, `img/baconpfp.jpg`)}" alt="">` +
        `<div class="item-texto"><strong>${escapar(nomeMostrado)}</strong>` +
        `<span>@${escapar(j.nome)}${exato}</span></div>` +
        `<div class="resultado-acoes">` +
        `<a href="perfil.html?id=${j.id}" class="btn">Ver perfil</a>` +
        botaoComparar +
        `</div></div>`;
}

function lerBuscasRecentes() {
    let salvas = localStorage.getItem(`sterben_buscas`);
    if (salvas == null) {
        return [];
    }
    return JSON.parse(salvas);
}

function guardarBusca(texto) {
    let antigas = lerBuscasRecentes();
    let buscas = [texto];
    for (let i = 0; i < antigas.length && buscas.length < 6; i++) {
        if (antigas[i].toLowerCase() != texto.toLowerCase()) {
            buscas.push(antigas[i]);
        }
    }
    localStorage.setItem(`sterben_buscas`, JSON.stringify(buscas));
    mostrarBuscasRecentes();
}

function mostrarBuscasRecentes() {
    let buscas = lerBuscasRecentes();
    if (buscas.length == 0) {
        div_buscas_recentes.innerHTML = ``;
        return;
    }
    let html = `<span class="texto-cinza" style="font-size: 14px;">Buscas recentes:</span>`;
    for (let i = 0; i < buscas.length; i++) {
        html += `<button class="filtro" onclick="repetirBusca(${i})">${escapar(buscas[i])}</button>`;
    }
    div_buscas_recentes.innerHTML = html;
}

function repetirBusca(posicao) {
    let texto = lerBuscasRecentes()[posicao];
    input_busca.value = texto;
    buscar(texto);
}

function clicouBuscar() {
    let texto = input_busca.value.trim();
    let erro = div_erro_busca;
    if (texto.length < 3 && (texto == `` || isNaN(texto))) {
        erro.innerHTML = `Digite pelo menos 3 letras (ou um ID).`;
        return;
    }
    erro.innerHTML = ``;
    buscar(texto);
}

function buscar(texto) {
    let lista = div_resultados;
    div_painel_resultados.style.display = `block`;
    lista.innerHTML = `<p class="carregando">Buscando "${escapar(texto)}"...</p>`;

    roblox.buscar(texto)
        .then(function (dados) {
            guardarBusca(texto);
            div_info_resultados.innerHTML = `${dados.resultados.length} encontrados`;
            let temId = false;
            if (sessao.robloxId) {
                temId = true;
            }
            let html = ``;
            for (let i = 0; i < dados.resultados.length; i++) {
                html += htmlResultado(dados.resultados[i], temId);
            }
            if (html == ``) {
                html = `<p class="texto-cinza">Ninguém encontrado com esse nome.</p>`;
            }
            lista.innerHTML = html;
        })
        .catch(function (erro) {
            lista.innerHTML = `<p class="texto-cinza">Ninguém encontrado.</p>`;
        });
}

function carregarSugestoes() {
    let caixa = div_lista_sugestoes;
    if (!sessao.robloxId) {
        caixa.innerHTML = `<p class="texto-cinza">Vincule seu ID do Roblox no Perfil para ver seus amigos aqui.</p>`;
        return;
    }
    roblox.amigos(sessao.robloxId)
        .then(function (dados) {
            let html = ``;
            for (let i = 0; i < Math.min(6, dados.amigos.length); i++) {
                html += htmlResultado(dados.amigos[i], true);
            }
            if (html == ``) {
                html = `<p class="texto-cinza">Nenhum amigo para sugerir.</p>`;
            }
            caixa.innerHTML = html;
        })
        .catch(function (erro) {
            caixa.innerHTML = `<p class="texto-cinza">Não foi possível carregar.</p>`;
        });
}

function resumoJogador(id) {
    let resumo = {};

    return roblox.usuario(id)
        .then(function (u) {
            resumo.usuario = u;
            resumo.anos = anosDesde(u.criado);
            resumo.amigos = u.amigos;
            resumo.seguidores = u.seguidores;
            return roblox.emblemas(id, 100);
        })
        .then(function (e) {
            resumo.emblemas = e.total;

            resumo.maisRaro = null;
            for (let i = 0; i < e.emblemas.length; i++) {
                let r = e.emblemas[i].raridade;
                if (r != null && (resumo.maisRaro == null || r < resumo.maisRaro)) {
                    resumo.maisRaro = r;
                }
            }

            return roblox.inventario(id)
                .then(function (inv) {
                    resumo.rap = null;
                    if (inv.podeVer) {
                        resumo.rap = 0;
                        for (let i = 0; i < inv.limitados.length; i++) {
                            resumo.rap += inv.limitados[i].rap;
                        }
                    }
                    return resumo;
                })
                .catch(function () {
                    resumo.rap = null;
                    return resumo;
                });
        });
}

function mostrarValor(valor, ehPorcentagem) {
    if (valor == null) {
        return `<span class="texto-cinza">—</span>`;
    }
    if (ehPorcentagem) {
        return formatarPorcentagem(valor);
    }
    return numeroCurto(valor);
}

function comparar(idOutro) {
    let painel = div_painel_comparar;
    painel.style.display = `block`;

    if (!sessao.robloxId) {
        painel.innerHTML = `<p class="texto-cinza">Vincule seu ID do Roblox no Perfil para poder se comparar.</p>`;
        return;
    }
    painel.innerHTML = `<p class="carregando">Comparando as duas contas...</p>`;

    let eu = null;
    resumoJogador(sessao.robloxId)
        .then(function (meuResumo) {
            eu = meuResumo;
            return resumoJogador(idOutro);
        })
        .then(function (outro) {
            mostrarComparacao(eu, outro);
        })
        .catch(function (erro) {
            painel.innerHTML = `<p class="texto-cinza">Não foi possível comparar (jogador não encontrado).</p>`;
        });
}

function mostrarComparacao(eu, outro) {
    let linhas = [
        [`Anos de Roblox`, eu.anos, outro.anos, false, false],
        [`Amigos`, eu.amigos, outro.amigos, false, false],
        [`Seguidores`, eu.seguidores, outro.seguidores, false, false],
        [`Emblemas`, eu.emblemas, outro.emblemas, false, false],
        [`Emblema mais raro (recentes)`, eu.maisRaro, outro.maisRaro, true, true],
        [`Valor dos limitados (RAP)`, eu.rap, outro.rap, false, false]
    ];

    let pontosEu = 0;
    let pontosOutro = 0;
    let html = ``;
    for (let i = 0; i < linhas.length; i++) {
        let rotulo = linhas[i][0];
        let a = linhas[i][1];
        let b = linhas[i][2];
        let menorMelhor = linhas[i][3];
        let ehPorcentagem = linhas[i][4];

        let venceA = false;
        let venceB = false;
        if (a != null && b != null && a != b) {
            if (menorMelhor) {
                venceA = a < b;
            } else {
                venceA = a > b;
            }
            venceB = !venceA;
        }
        let classeA = ``;
        let classeB = ``;
        if (venceA) {
            pontosEu++;
            classeA = `vence`;
        }
        if (venceB) {
            pontosOutro++;
            classeB = `vence`;
        }

        html += `<tr>` +
            `<td class="${classeA}">${mostrarValor(a, ehPorcentagem)}</td>` +
            `<td class="rotulo-comparar">${rotulo}</td>` +
            `<td class="${classeB}">${mostrarValor(b, ehPorcentagem)}</td>` +
            `</tr>`;
    }

    let resultado = `Empate!`;
    if (pontosEu > pontosOutro) {
        resultado = `Você ganhou em ${pontosEu} de ${linhas.length} categorias`;
    }
    if (pontosOutro > pontosEu) {
        resultado = `${escapar(outro.usuario.apelido)} ganhou em ${pontosOutro} de ${linhas.length} categorias`;
    }

    div_painel_comparar.innerHTML =
        `<div class="painel-cabecalho"><h2>Comparação</h2><span>${resultado}</span></div>` +
        `<div class="comparacao">` +
        `<div class="comparacao-jogador"><img src="${imagem(eu.usuario.avatar, `img/avatar-padrao.svg`)}" alt=""><h3>${escapar(eu.usuario.apelido)}</h3><span class="texto-cinza">você</span></div>` +
        `<div class="comparacao-vs">VS</div>` +
        `<div class="comparacao-jogador"><img src="${imagem(outro.usuario.avatar, `img/avatar-padrao.svg`)}" alt=""><h3>${escapar(outro.usuario.apelido)}</h3><a href="perfil.html?id=${outro.usuario.id}">ver perfil</a></div>` +
        `</div>` +
        `<table class="tabela-comparar">${html}</table>`;
}

mostrarBuscasRecentes();
carregarSugestoes();

let idComparar = pegarDoEndereco(`comparar`);
if (idComparar) {
    comparar(idComparar);
}
