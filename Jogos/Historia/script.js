let jogosExibidos = [...jogos];

// Função para criar um card de jogo simplificado
function criarCardJogo(jogo, index) {
    return `
        <div class="timeline-item" style="animation-delay: ${index * 0.1}s">
            <div class="game-card" onclick="abrirModal(${jogos.indexOf(jogo)})">
                <img src="${jogo.Imagem}" alt="${jogo.Jogo}" class="game-image" onerror="this.style.display='none'">
                <div class="game-info">
                    <h2 class="game-title">${jogo.Jogo}</h2>
                    <span class="game-year">${jogo.Ano}</span>
                </div>
            </div>
        </div>
    `;
}

// Função para abrir o modal com detalhes do jogo
function abrirModal(indiceJogo) {
    const jogo = jogos[indiceJogo];
    const modal = document.getElementById('gameModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = jogo.Jogo;
    
    modalBody.innerHTML = `
        <div class="modal-info-item">
            <span class="modal-info-label">Ano de Lançamento:</span>
            <span class="modal-year-badge">${jogo.Ano}</span>
        </div>
        
        <div class="modal-info-item">
            <span class="modal-info-label">História Resumida:</span>
            <div class="modal-info-content">${jogo.HistoriaResumida}</div>
        </div>
        
        <div class="modal-info-item">
            <span class="modal-info-label">Motivo da Criação:</span>
            <div class="modal-info-content">${jogo.MotivoDaCriacao}</div>
        </div>
        
        <div class="modal-info-item">
            <span class="modal-info-label">Mecânicas Principais:</span>
            <div class="modal-info-content">${jogo.MecanicasPrincipais}</div>
        </div>
        
        <div class="modal-info-item">
            <span class="modal-info-label">Inovações Tecnológicas:</span>
            <div class="modal-info-content">${jogo.InovacoesTecnologicas}</div>
        </div>
        
        <div class="modal-info-item">
            <span class="modal-info-label">Impacto Cultural ou Comercial:</span>
            <div class="modal-info-content">${jogo.ImpactoCulturalOuComercial}</div>
        </div>
        
        <div class="modal-info-item">
            <span class="modal-info-label">Gênero:</span>
            <span class="modal-genre-tag">${jogo.Genero}</span>
        </div>
        
        <div class="modal-info-item">
            <span class="modal-info-label">Era/Geração:</span>
            <span class="modal-generation-tag">${jogo.ErasGeracoes}</span>
        </div>
        <div class="modal-info-item">
            <span class="modal-info-label">Imagem:</span>
            <div class="modal-info-content"><img src="${jogo.Imagem}" style="width:100%"/></div>
        </div>
    `;
    
    // Mostra o modal primeiro
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // **CORREÇÃO**: Força o scroll para o topo com múltiplas abordagens
    // Método 1: scrollTop imediato
    modalBody.scrollTop = 0;
    
    // Método 2: usando setTimeout para garantir que aconteça após o render
    setTimeout(() => {
        modalBody.scrollTop = 0;
        modalBody.scrollTo(0, 0);
    }, 10);
    
    // Método 3: usando requestAnimationFrame para aguardar o próximo frame
    requestAnimationFrame(() => {
        modalBody.scrollTop = 0;
        modalBody.scrollTo(0, 0);
    });
}

// Função para fechar o modal
function fecharModal() {
    const modal = document.getElementById('gameModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Função para renderizar a timeline
function renderizarTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = jogosExibidos
        .map((jogo, index) => criarCardJogo(jogo, index))
        .join('');
}

// Função para popular o filtro de gêneros
function popularFiltroGeneros() {
    const generos = [...new Set(jogos.map(jogo => jogo.Genero))];
    const select = document.getElementById('generoFilter');
    
    generos.forEach(genero => {
        const option = document.createElement('option');
        option.value = genero;
        option.textContent = genero;
        select.appendChild(option);
    });
}

// Função para filtrar por gênero
function filtrarPorGenero(genero) {
    if (genero === '') {
        jogosExibidos = [...jogos];
    } else {
        jogosExibidos = jogos.filter(jogo => jogo.Genero === genero);
    }
    renderizarTimeline();
}

// Função para pesquisar jogos
function pesquisarJogos(termo) {
    if (termo === '') {
        jogosExibidos = [...jogos];
    } else {
        jogosExibidos = jogos.filter(jogo => 
            jogo.Jogo.toLowerCase().includes(termo.toLowerCase()) ||
            jogo.Ano.toString().includes(termo)
        );
    }
    renderizarTimeline();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    popularFiltroGeneros();
    renderizarTimeline();
    
    // Filtro por gênero
    document.getElementById('generoFilter').addEventListener('change', function() {
        filtrarPorGenero(this.value);
    });
    
    // Pesquisa
    document.getElementById('searchInput').addEventListener('input', function() {
        pesquisarJogos(this.value);
    });
    
    // Event listeners para o modal
    const modal = document.getElementById('gameModal');
    const closeBtn = document.querySelector('.close');
    
    // Fechar modal ao clicar no X
    closeBtn.onclick = fecharModal;
    
    // Fechar modal ao clicar fora dele
    window.onclick = function(event) {
        if (event.target === modal) {
            fecharModal();
        }
    };
    
    // Fechar modal com a tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            fecharModal();
        }
    });
});
