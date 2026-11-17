let usandoExemplo = false;

function chamarApi(caminho, nomeExemplo) {
    if (window.location.protocol == `file:`) {
        return Promise.resolve(usarExemplo(nomeExemplo, ``));
    }

    return fetch(`/roblox${caminho}`)
        .then(function (resposta) {
            if (resposta.status == 404) {
                throw new Error(`nao-encontrado`);
            }
            if (resposta.ok) {
                return resposta.json();
            }
            return resposta.json()
                .then(function (json) {
                    return usarExemplo(nomeExemplo, json.detalhe);
                })
                .catch(function () {
                    return usarExemplo(nomeExemplo, ``);
                });
        }, function () {
            return usarExemplo(nomeExemplo, ``);
        });
}

function usarExemplo(nomeExemplo, detalhe) {
    usandoExemplo = true;
    mostrarAvisoExemplo(detalhe);
    return JSON.parse(JSON.stringify(DADOS_EXEMPLO[nomeExemplo]));
}

function mostrarAvisoExemplo(detalhe) {
    let area = document.getElementById(`div_aviso`);
    if (area == null || area.innerHTML != ``) {
        return;
    }
    let texto = ``;
    if (detalhe) {
        texto = `<strong>Dados de exemplo nesta parte.</strong> O servidor está ligado, mas o Roblox recusou o pedido: ` +
            `<code>${escapar(detalhe)}</code>`;
    } else {
        texto = `<strong>Dados de exemplo.</strong> Para ver os dados reais do Roblox, ` +
            `rode o servidor (<code>npm start</code> na pasta <code>api</code>) e abra ` +
            `<code>http://localhost:3000</code>.`;
    }
    area.innerHTML = `<div class="aviso">${texto}</div>`;
}

let roblox = {
    usuario: function (id) {
        return chamarApi(`/perfil/${id}`, `usuario`);
    },
    amigos: function (id) {
        return chamarApi(`/amigos/${id}`, `amigos`);
    },
    favoritos: function (id) {
        return chamarApi(`/favoritos/${id}`, `favoritos`);
    },
    emblemas: function (id, quantidade, inicio) {
        if (quantidade == null) {
            quantidade = 100;
        }
        if (inicio == null) {
            inicio = 0;
        }
        return chamarApi(`/emblemas/${id}?quantidade=${quantidade}&inicio=${inicio}`, `emblemas`);
    },
    inventario: function (id) {
        return chamarApi(`/inventario/${id}`, `inventario`);
    },
    buscar: function (nome) {
        return chamarApi(`/buscar?nome=${encodeURIComponent(nome)}`, `busca`);
    }
};

function htmlSemId() {
    return `<div class="painel vazio">` +
        `<h2>Vincule sua conta do Roblox</h2>` +
        `<p>Para ver seus dados, informe o ID do seu perfil no Roblox. ` +
        `Ele é o número que aparece no endereço do seu perfil: roblox.com/users/<strong>388413545</strong>/profile</p>` +
        `<form class="form-id" onsubmit="vincularId(); return false">` +
        `<input type="text" id="input_vincular" placeholder="Ex.: 388413545" inputmode="numeric">` +
        `<button type="submit" class="btn btn-grande">Vincular</button>` +
        `</form>` +
        `<p class="erro-campo" id="div_erro_vincular"></p>` +
        `</div>`;
}

function vincularId() {
    let valor = input_vincular.value.trim();
    if (valor == `` || isNaN(valor)) {
        div_erro_vincular.innerHTML = `O ID tem que ter só números.`;
        return;
    }
    sessao.robloxId = valor;
    salvarSessao();

    let usuarios = JSON.parse(localStorage.getItem(`sterben_usuarios`));
    if (usuarios == null) {
        usuarios = [];
    }
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].usuario == sessao.usuario) {
            usuarios[i].robloxId = valor;
        }
    }
    localStorage.setItem(`sterben_usuarios`, JSON.stringify(usuarios));
    window.location.reload();
}

function nivelRaridade(porcentagem) {
    if (porcentagem == null) {
        return { nome: `Desconhecida`, classe: `comum` };
    }
    if (porcentagem < 1) {
        return { nome: `Impossível`, classe: `lendario` };
    }
    if (porcentagem < 5) {
        return { nome: `Insano`, classe: `epico` };
    }
    if (porcentagem < 10) {
        return { nome: `Extremo`, classe: `raro` };
    }
    if (porcentagem < 20) {
        return { nome: `Difícil`, classe: `raro` };
    }
    if (porcentagem < 30) {
        return { nome: `Desafiador`, classe: `comum` };
    }
    if (porcentagem < 50) {
        return { nome: `Moderado`, classe: `comum` };
    }
    if (porcentagem < 80) {
        return { nome: `Fácil`, classe: `comum` };
    }
    if (porcentagem < 90) {
        return { nome: `Moleza`, classe: `comum` };
    }
    return { nome: `Brinde`, classe: `comum` };
}

function formatarPorcentagem(numero) {
    if (numero == null) {
        return `—`;
    }
    return `${numero.toLocaleString(`pt-BR`, { maximumFractionDigits: 2 })}%`;
}
