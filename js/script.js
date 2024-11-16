const teclas = document.querySelectorAll('.tecla-letra');
const apagar = document.querySelector('.tecla-apagar');
const enter = document.querySelector('.tecla-enter');
const celulas = document.querySelectorAll('.principal__celula');
const tamanhoPalavra = 5;
const tentativas = 6;
let tentativaAtual = 1;
let palavraSecreta = '';
let palavraChutada = '';
let letrasChutadas = [];
let letrasClasses = [];
let letrasCertas = [];
let letrasPosicaoErradas = [];
let letrasErradas = [];
let jogoAtivo = false;

exibirPopUp = (mensagem, cor) => {
    Toastify({
        text: mensagem,
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
            background: `var(--${cor})`,
        },
    }).showToast();
}

selecionarPalavra = (palavras) => {
    const palavraSecreta = palavras[Math.floor(Math.random() * palavras.length)];
    
    return palavraSecreta;
}

obterPalavras = async () => {
    return fetch('./js/palavras.json')
        .then(response => response.json())
        .then(data => {
            return selecionarPalavra(data.palavras)
        })
        .catch(error => {
            console.error('Erro ao carregar o JSON:', error);
            return []; 
        });
}

exibirPalavra = async () => {
    palavraSecreta = await obterPalavras();
    // console.log(palavraSecreta);
}

exibirLetras = () => {
    celulas.forEach((celula, index) => {
        if (index < letrasChutadas.length) {
            celula.textContent = letrasChutadas[index];

            celula.classList.add(letrasClasses[index]);
        } else {
            celula.textContent = '';
        }
    });
}

atualizarTeclas = () => {    
    teclas.forEach(tecla => {
        if (letrasChutadas.includes(tecla.textContent)) {
            if (letrasCertas.includes(tecla.textContent)) { 
                tecla.classList.add('letra-certa');
                tecla.disabled = false;
            } else if (letrasPosicaoErradas.includes(tecla.textContent)) {
                tecla.classList.add('letra-posicao-errada');
                tecla.disabled = false;
            } else {
                tecla.classList.add('letra-errada');
                tecla.disabled = true;
            }
        }
    });
}

formarPalavra = (letra) => {
    // console.log(tentativaAtual, tentativas, palavraChutada.length, tamanhoPalavra);
    if (tentativaAtual <= tentativas && palavraChutada.length < tamanhoPalavra) {
        palavraChutada += letra;

        letrasChutadas.push(letra);

        exibirLetras(); 
    }
}

apagarLetra = () => {
    if (letrasChutadas.length > tamanhoPalavra * (tentativaAtual - 1)) {
        letrasChutadas = letrasChutadas.slice(0, -1);
        palavraChutada = palavraChutada.slice(0, -1);
    }

    exibirLetras();
}

verificarLetra = (letra, posicao) => {
    if (palavraSecreta[posicao].toUpperCase() === letra.toUpperCase()) {
        letrasCertas.push(letra);

        return 'letra-certa';
    }
    
    if (palavraSecreta.toUpperCase().includes(letra.toUpperCase())) {
        letrasPosicaoErradas.push(letra);

        return 'letra-posicao-errada';
    }

    letrasErradas.push(letra);

    return 'letra-errada';
}

verificarPalavra = () => {
    for (let i = 0; i < palavraChutada.length; i++) {
        // console.log(i);
        let letra = palavraChutada[i]
        const letraClass = verificarLetra(letra, i);

        letrasClasses.push(letraClass);
        // console.log(letraClass);
    }

    exibirLetras();
    atualizarTeclas();

    //console.log(palavraSecreta);
    if (palavraChutada.toUpperCase() === palavraSecreta.toUpperCase() || tentativaAtual >= tentativas) {    
        jogoAtivo = false;

        enter.textContent = "JOGAR NOVAMENTE";
        teclas.forEach(tecla => {
            tecla.disabled = true;
        })
        apagar.disabled = true;

        if (palavraChutada.toUpperCase() === palavraSecreta.toUpperCase()) {
            exibirMensagem(`Parabéns! Você acertou a palavra secreta "${palavraSecreta.toUpperCase()}" com ${tentativaAtual} tentativa${(tentativaAtual > 1 ? 's' : '')}!`, 'verde');
        } else if (tentativaAtual >= tentativas) {
            exibirMensagem(`Você perdeu! A palavra era "${palavraSecreta.toUpperCase()}"!`, 'vermelho');
        }
    }

    tentativaAtual++;
    palavraChutada = '';
}

exibirMensagem = (mensagem, cor) => {
    exibirPopUp(mensagem, cor);
}

configurarTeclas_click = () => {
    teclas.forEach(tecla => {
        tecla.addEventListener('click', () => {
            const letra = tecla.textContent;

            formarPalavra(letra);
        });
    });

    apagar.addEventListener('click', () => {
        apagarLetra();
    });

    enter.addEventListener('click', () => {
        // console.log(palavraChutada.length, tamanhoPalavra);
        if (palavraChutada.length === tamanhoPalavra && jogoAtivo) {
            verificarPalavra();
        } else if (!jogoAtivo){
            reniciar();
        }
    });
}

configurarTeclas_teclado = () => {
    document.addEventListener("keydown", function(event) {
        //console.log(event.key);
        if (event.keyCode >= 65 && event.keyCode <= 90 && jogoAtivo && !letrasErradas.includes(event.key.toUpperCase())) {
            const letra = event.key.toUpperCase();

            formarPalavra(letra);
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === 'Backspace' && jogoAtivo) {
            apagarLetra();
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === 'Enter' && jogoAtivo)
        {
            // console.log(palavraChutada.length, tamanhoPalavra);
            if (palavraChutada.length === tamanhoPalavra) {
                verificarPalavra();
            }
        } else if (event.key === 'Enter' && !jogoAtivo){
            reniciar();
        }
    });
}

iniciar = () => {
    exibirPalavra();
    configurarTeclas_click();
    configurarTeclas_teclado();

    jogoAtivo = true;
}

reniciar = () => {
    window.location.reload();
}

iniciar();