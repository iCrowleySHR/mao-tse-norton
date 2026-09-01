const telaInicial = document.getElementById("telaInicial");
const musica = document.getElementById("musica");

telaInicial.addEventListener("click", () => {

    // Começa as animações
    document.body.classList.add("playing");

    // Esconde a tela inicial
    telaInicial.style.display = "none";

    // Lista de músicas / rádio
    const musicas = [
        "./msc/duran.mp3",
        "./msc/china.mp3",
        "https://24283.live.streamtheworld.com/ASPENAAC.aac"
    ];

    // Escolhe aleatoriamente
    const musicaAleatoria =
        musicas[Math.floor(Math.random() * musicas.length)];

    // Define a música escolhida
    musica.src = musicaAleatoria;

    // Começa a reprodução
    musica.play().catch((erro) => {
        console.error("Erro ao reproduzir:", erro);
    });

});