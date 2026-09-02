import { elements } from "./ui/elements.js";
import { state } from "./player/state.js";
import { formatTime } from "./utils/formatTime.js";

import {
    loadMusic,
    togglePlayPause,
    nextMusic,
    prevMusic,
    stopMusic
} from "./player/player.js";

import {
    updateProgress,
    seek
} from "./player/progress.js";

import {
    addToPlaylist,
    clearPlaylist,
    updatePlaylistUI
} from "./playlist/playlist.js";

import { PRESETS } from "./config/presets.js";
import { updateStatus } from "./ui/status.js";

// ======================================================
// TELA INICIAL
// ======================================================

elements.telaInicial.addEventListener(
    "click",
    () => {
        elements.telaInicial.classList.add("hidden");
        elements.player.classList.add("visible");

        document.body.classList.add("playing");

        updateStatus(
            "📋 Adicione músicas à playlist"
        );
    }
);

// ======================================================
// BOTÕES DO PLAYER
// ======================================================

elements.btnPlayPause.addEventListener(
    "click",
    togglePlayPause
);

elements.btnNext.addEventListener(
    "click",
    nextMusic
);

elements.btnPrev.addEventListener(
    "click",
    prevMusic
);

elements.btnStop.addEventListener(
    "click",
    stopMusic
);

// ======================================================
// PROGRESSO
// ======================================================

elements.progressBar.addEventListener(
    "input",
    e => {
        seek(e.target.value);
    }
);

// ======================================================
// VOLUME
// ======================================================

elements.volumeControl.addEventListener(
    "input",
    e => {
        elements.musica.volume =
            e.target.value / 100;
    }
);

// ======================================================
// PLAYLIST
// ======================================================

elements.btnTogglePlaylist.addEventListener(
    "click",
    () => {
        elements.playlist.classList.toggle(
            "hidden"
        );
    }
);

elements.btnClearPlaylist.addEventListener(
    "click",
    () => {
        clearPlaylist(
            stopMusic,
            loadMusic
        );
    }
);

// ======================================================
// ARQUIVOS
// ======================================================

elements.btnAddMusic.addEventListener(
    "click",
    () => {
        elements.fileInput.click();
    }
);

elements.fileInput.addEventListener(
    "change",
    e => {
        for (const file of e.target.files) {
            const url =
                URL.createObjectURL(file);

            addToPlaylist(
                file.name.replace(
                    /\.[^/.]+$/,
                    ""
                ),
                url,
                false,
                null,
                loadMusic
            );
        }

        elements.fileInput.value = "";
    }
);

// ======================================================
// PRESETS
// ======================================================

function loadPreset(preset) {
    clearPlaylist(
        stopMusic,
        loadMusic
    );

    preset.forEach(item => {
        state.playlist.push({
            title: item.title,
            src: item.src,
            isRadio: item.isRadio || false,
            radioId: item.radioId || null
        });
    });

    state.currentIndex = -1;

    elements.musicTitle.textContent =
        "Selecione uma rádio";

    elements.musicSource.textContent =
        "Escolha uma rádio na playlist";

    updateStatus(
        "Selecione uma rádio"
    );

    updatePlaylistUI(loadMusic);
}

elements.btnLoadPreset1.addEventListener(
    "click",
    () => {
        loadPreset(PRESETS.classicas);
    }
);

elements.btnLoadPreset2.addEventListener(
    "click",
    () => {
        loadPreset(PRESETS.radio);
    }
);

// ======================================================
// EVENTOS DO ÁUDIO
// ======================================================

elements.musica.addEventListener(
    "ended",
    () => {
        if (!state.isRadio) {
            nextMusic();
        }
    }
);

elements.musica.addEventListener(
    "timeupdate",
    updateProgress
);

elements.musica.addEventListener(
    "loadedmetadata",
    () => {
        if (!state.isRadio) {
            elements.timeTotal.textContent =
                formatTime(elements.musica.duration);
        }
    }
);

elements.musica.addEventListener(
    "play",
    () => {
        state.isPlaying = true;
        elements.btnPlayPause.textContent = "⏸";
    }
);

elements.musica.addEventListener(
    "pause",
    () => {
        state.isPlaying = false;
        elements.btnPlayPause.textContent = "▶";
    }
);

// ======================================================
// TECLADO
// ======================================================

document.addEventListener(
    "keydown",
    e => {
        if (
            !elements.player.classList.contains(
                "visible"
            )
        ) {
            if (
                e.code === "Space" ||
                e.code === "Enter"
            ) {
                e.preventDefault();
                elements.telaInicial.click();
            }

            return;
        }

        switch (e.code) {
            case "Space":
                e.preventDefault();
                togglePlayPause();
                break;

            case "ArrowRight":
                e.preventDefault();
                nextMusic();
                break;

            case "ArrowLeft":
                e.preventDefault();
                prevMusic();
                break;

            case "KeyS":
                stopMusic();
                break;
        }
    }
);

// ======================================================
// DRAG AND DROP
// ======================================================

document.addEventListener(
    "dragover",
    e => {
        e.preventDefault();
    }
);

document.addEventListener(
    "drop",
    e => {
        e.preventDefault();

        if (
            !elements.player.classList.contains(
                "visible"
            )
        ) {
            return;
        }

        for (const file of e.dataTransfer.files) {
            if (
                file.type.startsWith("audio/")
            ) {
                const url =
                    URL.createObjectURL(file);

                addToPlaylist(
                    file.name.replace(
                        /\.[^/.]+$/,
                        ""
                    ),
                    url,
                    false,
                    null,
                    loadMusic
                );
            }
        }
    }
);

// ======================================================
// PROGRESSO AUTOMÁTICO
// ======================================================

setInterval(
    updateProgress,
    500
);

// ======================================================
// DESABILITAR SELEÇÃO / MENU
// ======================================================

document.addEventListener(
    "selectstart",
    e => {
        e.preventDefault();
    }
);

window.addEventListener(
    "contextmenu",
    e => {
        e.preventDefault();
    }
);

// ======================================================
// LIMPEZA
// ======================================================

window.addEventListener(
    "beforeunload",
    () => {
        if (state.nowPlayingInterval) {
            clearInterval(
                state.nowPlayingInterval
            );
        }

        if (state.hls) {
            state.hls.destroy();
        }
    }
);

