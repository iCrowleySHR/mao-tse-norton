import { elements } from "../ui/elements.js";
import { state } from "./state.js";
import { formatTime } from "../utils/formatTime.js";

export function updateProgress() {
    const { musica, progressBar, timeCurrent, timeTotal } = elements;

    if (state.isRadio) {
        progressBar.value = 0;
        timeCurrent.textContent = "LIVE";
        timeTotal.textContent = "LIVE";
        return;
    }

    if (musica.duration) {
        const progress =
            (musica.currentTime / musica.duration) * 100;

        progressBar.value = progress;

        timeCurrent.textContent =
            formatTime(musica.currentTime);

        timeTotal.textContent =
            formatTime(musica.duration);
    }
}

export function seek(value) {
    if (
        elements.musica.duration &&
        !state.isRadio
    ) {
        elements.musica.currentTime =
            (value / 100) * elements.musica.duration;
    }
}

