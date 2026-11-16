if (localStorage.getItem(`modo2017`) == `sim`) {
    document.body.classList.add(`modo-2017`);
    btn_2017.innerHTML = `Modo Sterben`;
}

function trocarModo() {
    let botao2017 = btn_2017;
    document.body.classList.toggle(`modo-2017`);

    if (document.body.classList.contains(`modo-2017`)) {
        botao2017.innerHTML = `Modo Sterben`;
        localStorage.setItem(`modo2017`, `sim`);
    } else {
        botao2017.innerHTML = `Modo 2017`;
        localStorage.setItem(`modo2017`, `nao`);
    }

    if (typeof montarTudo == `function`) {
        montarTudo();
    }
}
