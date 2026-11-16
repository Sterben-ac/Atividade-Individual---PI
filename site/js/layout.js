let sessao = JSON.parse(localStorage.getItem(`sterben_sessao`));

if (sessao == null) {
    window.location.href = `index.html`;
}

function salvarSessao() {
    localStorage.setItem(`sterben_sessao`, JSON.stringify(sessao));
}

function sair() {
    localStorage.removeItem(`sterben_sessao`);
    window.location.href = `index.html`;
}

function pegarDoEndereco(nome) {
    let parametros = new URLSearchParams(window.location.search);
    return parametros.get(nome);
}

function pegarIdRoblox() {
    let idNoEndereco = pegarDoEndereco(`id`);
    if (idNoEndereco != null && idNoEndereco != ``) {
        return idNoEndereco;
    }
    if (sessao != null) {
        return sessao.robloxId;
    }
    return ``;
}

let paginaAtual = document.body.dataset.pagina;

let linksNavbar = [
    { pagina: `inicio`, href: `inicio.html`, texto: `Início` },
    { pagina: `historia`, href: `historia.html`, texto: `Minha história` },
    { pagina: `jogos`, href: `jogos.html`, texto: `Jogos que me marcaram` },
    { pagina: `dashboard`, href: `dashboard.html`, texto: `Dashboard` }
];

let linksMenu = [
    { pagina: `inicio`, href: `inicio.html`, texto: `Início`, icone: `inicio` },
    { pagina: `perfil`, href: `perfil.html`, texto: `Perfil`, icone: `perfil` },
    { pagina: `jogador`, href: `jogador.html`, texto: `Buscar jogador`, icone: `buscar` },
    { pagina: `emblemas`, href: `emblemas.html`, texto: `Emblemas`, icone: `emblemas` },
    { pagina: `inventario`, href: `inventario.html`, texto: `Inventário`, icone: `inventario` },
    { pagina: `quiz`, href: `quiz.html`, texto: `Quiz`, icone: `quiz` },
    { pagina: `minigame`, href: `minigame.html`, texto: `Minigame`, icone: `minigame` }
];

function montarLayout() {
    let foto = `img/baconpfp.jpg`;
    if (sessao.foto) {
        foto = sessao.foto;
    }

    let htmlNavbar = `<div class="nav-esquerda">` +
        `<a href="inicio.html"><img src="img/sterben-emblema.svg" alt="Sterben" class="logo"></a>`;
    for (let i = 0; i < linksNavbar.length; i++) {
        let link = linksNavbar[i];
        let classe = `link`;
        if (link.pagina == paginaAtual) {
            classe = `link ativo`;
        }
        htmlNavbar += `<a href="${link.href}" class="${classe}">${link.texto}</a>`;
    }
    htmlNavbar += `</div>` +
        `<div class="nav-direita">` +
        `<button class="btn-2017" id="btn_2017" onclick="trocarModo()">Modo 2017</button>` +
        `<a href="perfil.html" class="nav-usuario">` +
        `<img src="${foto}" alt="avatar" class="avatar-nav" id="img_avatar_nav">` +
        `<span class="nome-nav">${escapar(sessao.usuario)}</span>` +
        `</a>` +
        `<a href="#" class="sair" onclick="sair(); return false">Sair</a>` +
        `</div>`;
    div_navbar.innerHTML = htmlNavbar;

    let htmlMenu = ``;
    for (let i = 0; i < linksMenu.length; i++) {
        let item = linksMenu[i];
        let classe = `item`;
        if (item.pagina == paginaAtual) {
            classe = `item selecionado`;
        }
        htmlMenu += `<a href="${item.href}" class="${classe}">` +
            `<img src="img/icones/${item.icone}.svg" alt="" class="icone"> ${item.texto}</a>`;
    }
    div_menu_lateral.innerHTML = htmlMenu;
}

if (sessao != null) {
    montarLayout();
}

function escapar(texto) {
    if (texto == null) {
        return ``;
    }
    texto = String(texto);
    texto = texto.split(`&`).join(`&amp;`);
    texto = texto.split(`<`).join(`&lt;`);
    texto = texto.split(`>`).join(`&gt;`);
    texto = texto.split(`"`).join(`&quot;`);
    return texto;
}

function formatarNumero(numero) {
    if (numero == null) {
        return `—`;
    }
    return Number(numero).toLocaleString(`pt-BR`);
}

function numeroCurto(numero) {
    if (numero == null) {
        return `—`;
    }
    if (numero >= 1000000) {
        return `${(numero / 1000000).toLocaleString(`pt-BR`, { maximumFractionDigits: 1 })} mi`;
    }
    if (numero >= 1000) {
        return `${(numero / 1000).toLocaleString(`pt-BR`, { maximumFractionDigits: 1 })} mil`;
    }
    return String(numero);
}

function formatarData(textoData) {
    if (!textoData) {
        return `—`;
    }
    return new Date(textoData).toLocaleDateString(`pt-BR`);
}

function anosDesde(textoData) {
    let dias = (Date.now() - new Date(textoData).getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(dias / 365.25);
}

function imagem(url, reserva) {
    if (url) {
        return url;
    }
    return reserva;
}
