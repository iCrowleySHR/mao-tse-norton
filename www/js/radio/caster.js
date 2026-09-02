import { elements } from "../ui/elements.js";
import { RADIOS } from "../config/radios.js";

let casterScript = null;

export function showCasterPlayer() {

    if (!elements.casterPlayer) {
        console.error(
            "Elemento #casterPlayer não encontrado."
        );

        return;
    }

    const radio = RADIOS.maoTseNorton;

    // Limpa uma instância anterior
    destroyCasterPlayer();

    // Mostra o container
    elements.casterPlayer.classList.remove("hidden");

    // =========================================================
    // Monta exatamente o embed do Caster.fm dinamicamente
    // =========================================================

    elements.casterPlayer.innerHTML = `


        <div
    class="cstrEmbed"
    data-type="newStreamPlayer"
    data-publicToken="${radio.publicToken}"
    data-theme="light"
    data-color="6C2BDD"
    data-channelId=""
    data-rendered="false"
>
    <a href="https://www.caster.fm">Shoutcast Hosting</a>
    <a href="https://www.caster.fm">Stream Hosting</a>
    <a href="https://www.caster.fm">Radio Server Hosting</a>
</div>

<script src="https://cdn.cloud.caster.fm/widgets/embed.js"></script>
    `;

    // =========================================================
    // Carrega o script do Caster.fm
    // =========================================================

    casterScript = document.createElement("script");

    casterScript.src =
        "https://cdn.cloud.caster.fm/widgets/embed.js";

    casterScript.async = true;

    document.body.appendChild(casterScript);
}


export function hideCasterPlayer() {

    if (!elements.casterPlayer) {
        return;
    }

    // Tenta parar qualquer áudio criado dentro do container
    elements.casterPlayer
        .querySelectorAll("audio")
        .forEach(audio => {

            audio.pause();

            audio.removeAttribute("src");

            audio.load();
        });

    // Tenta parar qualquer vídeo
    elements.casterPlayer
        .querySelectorAll("video")
        .forEach(video => {

            video.pause();

            video.removeAttribute("src");

            video.load();
        });

    // Destrói o widget
    destroyCasterPlayer();

    // Esconde
    elements.casterPlayer.classList.add("hidden");
}


function destroyCasterPlayer() {

    if (!elements.casterPlayer) {
        return;
    }

    // Remove o HTML do Caster
    elements.casterPlayer.innerHTML = "";

    // Remove o script criado dinamicamente
    if (casterScript) {

        casterScript.remove();

        casterScript = null;
    }

    // Remove qualquer outra instância do script
    document
        .querySelectorAll(
            'script[src*="cdn.cloud.caster.fm/widgets/embed.js"]'
        )
        .forEach(script => {

            script.remove();
        });
}

