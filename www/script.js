// ===== ELEMENTOS =====
const telaInicial = document.getElementById("telaInicial");
const player = document.getElementById("player");
const musica = document.getElementById("musica");
const audioStatus = document.getElementById("audioStatus");

const btnPlayPause = document.getElementById("btnPlayPause");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnStop = document.getElementById("btnStop");
const progressBar = document.getElementById("progressBar");
const volumeControl = document.getElementById("volumeControl");
const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");
const musicTitle = document.getElementById("musicTitle");
const musicSource = document.getElementById("musicSource");

const playlistItems = document.getElementById("playlistItems");
const btnTogglePlaylist = document.getElementById("btnTogglePlaylist");
const playlist = document.getElementById("playlist");
const btnAddMusic = document.getElementById("btnAddMusic");
const btnClearPlaylist = document.getElementById("btnClearPlaylist");
const fileInput = document.getElementById("fileInput");
const btnLoadPreset1 = document.getElementById("btnLoadPreset1");
const btnLoadPreset2 = document.getElementById("btnLoadPreset2");

// ===== VARIÁVEIS =====
let playlistArray = [];
let currentIndex = 0;
let isPlaying = false;
let hls = null;
let isRadio = false;
let updateInterval = null;

// ===== URLS PREDEFINIDAS =====
const PRESETS = {
    classicas: [
        { title: "Duran Duran", src: "./msc/duran.mp3" },
        { title: "China", src: "./msc/china.mp3" },
        
    ],
    radio: [
        { 
            title: "📻 Kiss FM", 
            src: "https://24413.live.streamtheworld.com/RADIO_KISSFM_ADP/HLS/playlist.m3u8",
            isRadio: true
        },
        { title: "Aspen FM", src: "https://24283.live.streamtheworld.com/ASPENAAC.aac" }
    ]
};

// ===== FUNÇÕES =====

// Formatar tempo
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Atualizar barra de progresso
function updateProgress() {
    if (musica.duration) {
        const progress = (musica.currentTime / musica.duration) * 100;
        progressBar.value = progress;
        timeCurrent.textContent = formatTime(musica.currentTime);
        timeTotal.textContent = formatTime(musica.duration);
    }
}

// Carregar música
function loadMusic(index) {
    if (index < 0 || index >= playlistArray.length) {
        if (playlistArray.length === 0) {
            musicTitle.textContent = "Nenhuma música na playlist";
            musicSource.textContent = "Adicione músicas para começar";
            return;
        }
        index = 0;
    }

    currentIndex = index;
    const item = playlistArray[currentIndex];
    
    // Destruir HLS se existir
    if (hls) {
        hls.destroy();
        hls = null;
    }
    
    isRadio = item.isRadio || false;
    
    if (isRadio) {
        // Carregar rádio via HLS
        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hls.loadSource(item.src);
            hls.attachMedia(musica);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                musica.play().catch(() => {});
                isPlaying = true;
                btnPlayPause.textContent = "⏸";
                updateStatus("📻 Tocando rádio");
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    hls.destroy();
                    hls = null;
                    updateStatus("❌ Erro na rádio");
                }
            });
        } else if (musica.canPlayType('application/vnd.apple.mpegurl')) {
            musica.src = item.src;
            musica.play().catch(() => {});
            isPlaying = true;
            btnPlayPause.textContent = "⏸";
            updateStatus("📻 Tocando rádio (Safari)");
        } else {
            updateStatus("❌ Navegador não suporta rádio");
        }
        
        musicTitle.textContent = item.title;
        musicSource.textContent = "📻 Stream de rádio";
        
    } else {
        // Carregar arquivo local
        musica.src = item.src;
        musica.load();
        musica.play().catch(() => {});
        isPlaying = true;
        btnPlayPause.textContent = "⏸";
        
        musicTitle.textContent = item.title || "Arquivo de áudio";
        musicSource.textContent = "🎵 Arquivo local";
        updateStatus("🎵 Tocando música");
    }
    
    // Atualizar playlist visual
    updatePlaylistUI();
}

// Atualizar status
function updateStatus(text) {
    audioStatus.textContent = text;
}

// Play/Pause
function togglePlayPause() {
    if (playlistArray.length === 0) {
        updateStatus("⚠️ Adicione músicas na playlist");
        return;
    }
    
    if (isPlaying) {
        musica.pause();
        isPlaying = false;
        btnPlayPause.textContent = "▶";
        updateStatus("⏸ Pausado");
    } else {
        musica.play().catch(() => {});
        isPlaying = true;
        btnPlayPause.textContent = "⏸";
        updateStatus(isRadio ? "📻 Tocando rádio" : "🎵 Tocando música");
    }
}

// Próxima música
function nextMusic() {
    if (playlistArray.length === 0) return;
    if (isRadio) {
        // Recarregar rádio
        loadMusic(currentIndex);
        return;
    }
    const nextIndex = (currentIndex + 1) % playlistArray.length;
    loadMusic(nextIndex);
}

// Música anterior
function prevMusic() {
    if (playlistArray.length === 0) return;
    if (isRadio) {
        loadMusic(currentIndex);
        return;
    }
    const prevIndex = (currentIndex - 1 + playlistArray.length) % playlistArray.length;
    loadMusic(prevIndex);
}

// Parar
function stopMusic() {
    musica.pause();
    musica.currentTime = 0;
    isPlaying = false;
    btnPlayPause.textContent = "▶";
    progressBar.value = 0;
    timeCurrent.textContent = "0:00";
    updateStatus("⏹ Parado");
}

// Atualizar UI da playlist
function updatePlaylistUI() {
    playlistItems.innerHTML = '';
    playlistArray.forEach((item, index) => {
        const li = document.createElement('li');
        if (index === currentIndex) {
            li.classList.add('active');
        }
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = item.title || `Música ${index + 1}`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '✕';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            removeFromPlaylist(index);
        };
        
        li.appendChild(titleSpan);
        li.appendChild(removeBtn);
        
        li.onclick = () => {
            loadMusic(index);
        };
        
        playlistItems.appendChild(li);
    });
}

// Adicionar música à playlist
function addToPlaylist(title, src, isRadio = false) {
    playlistArray.push({ title, src, isRadio });
    updatePlaylistUI();
    if (playlistArray.length === 1) {
        loadMusic(0);
    }
}

// Remover da playlist
function removeFromPlaylist(index) {
    if (index === currentIndex) {
        stopMusic();
        if (hls) {
            hls.destroy();
            hls = null;
        }
    }
    playlistArray.splice(index, 1);
    if (index < currentIndex) {
        currentIndex--;
    } else if (index === currentIndex && playlistArray.length > 0) {
        if (currentIndex >= playlistArray.length) {
            currentIndex = playlistArray.length - 1;
        }
        loadMusic(currentIndex);
    } else if (playlistArray.length === 0) {
        currentIndex = 0;
        musicTitle.textContent = "Nenhuma música na playlist";
        musicSource.textContent = "Adicione músicas para começar";
        updateStatus("📋 Playlist vazia");
    }
    updatePlaylistUI();
}

// Limpar playlist
function clearPlaylist() {
    stopMusic();
    if (hls) {
        hls.destroy();
        hls = null;
    }
    playlistArray = [];
    currentIndex = 0;
    musicTitle.textContent = "Nenhuma música na playlist";
    musicSource.textContent = "Adicione músicas para começar";
    updateStatus("📋 Playlist limpa");
    updatePlaylistUI();
}

// Carregar preset
function loadPreset(preset) {
    clearPlaylist();
    preset.forEach(item => {
        addToPlaylist(item.title, item.src, item.isRadio || false);
    });
    if (playlistArray.length > 0) {
        loadMusic(0);
    }
}

// ===== EVENTOS =====

// Tela inicial - iniciar
telaInicial.addEventListener("click", () => {
    telaInicial.classList.add("hidden");
    player.classList.add("visible");
    document.body.classList.add("playing");
    updateStatus("📋 Adicione músicas à playlist");
});

// Teclado
document.addEventListener("keydown", (e) => {
    if (!player.classList.contains("visible")) {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            telaInicial.click();
        }
        return;
    }
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextMusic();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            prevMusic();
            break;
        case 'KeyS':
            stopMusic();
            break;
    }
});

// Botões de controle
btnPlayPause.addEventListener("click", togglePlayPause);
btnNext.addEventListener("click", nextMusic);
btnPrev.addEventListener("click", prevMusic);
btnStop.addEventListener("click", stopMusic);

// Progresso
progressBar.addEventListener("input", (e) => {
    if (musica.duration) {
        const newTime = (e.target.value / 100) * musica.duration;
        musica.currentTime = newTime;
    }
});

// Volume
volumeControl.addEventListener("input", (e) => {
    musica.volume = e.target.value / 100;
});

// Playlist
btnTogglePlaylist.addEventListener("click", () => {
    playlist.classList.toggle("hidden");
});

btnAddMusic.addEventListener("click", () => {
    fileInput.click();
});

btnClearPlaylist.addEventListener("click", clearPlaylist);

// Adicionar arquivos
fileInput.addEventListener("change", (e) => {
    const files = e.target.files;
    for (let file of files) {
        const url = URL.createObjectURL(file);
        addToPlaylist(file.name.replace(/\.[^/.]+$/, ""), url);
    }
    fileInput.value = '';
});

// Presets
btnLoadPreset1.addEventListener("click", () => loadPreset(PRESETS.classicas));
btnLoadPreset2.addEventListener("click", () => loadPreset(PRESETS.radio));

// Eventos do áudio
musica.addEventListener("ended", () => {
    if (!isRadio) {
        nextMusic();
    }
});

musica.addEventListener("timeupdate", updateProgress);

musica.addEventListener("loadedmetadata", () => {
    timeTotal.textContent = formatTime(musica.duration);
});

musica.addEventListener("play", () => {
    isPlaying = true;
    btnPlayPause.textContent = "⏸";
});

musica.addEventListener("pause", () => {
    isPlaying = false;
    btnPlayPause.textContent = "▶";
});

// ===== INICIALIZAÇÃO =====
// Atualizar progresso periodicamente
setInterval(updateProgress, 500);

// Prevenir seleção e arraste
document.addEventListener('selectstart', (e) => e.preventDefault());
window.addEventListener('contextmenu', (e) => e.preventDefault());

// Limpeza
window.addEventListener('beforeunload', () => {
    if (hls) {
        hls.destroy();
    }
});

// ===== DRAG AND DROP =====
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (player.classList.contains('visible')) {
        const files = e.dataTransfer.files;
        for (let file of files) {
            if (file.type.startsWith('audio/')) {
                const url = URL.createObjectURL(file);
                addToPlaylist(file.name.replace(/\.[^/.]+$/, ""), url);
            }
        }
    }
});