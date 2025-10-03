class DiceSimulator3D {
    constructor() {
        this.dices = [];
        this.history = [];
        this.isRolling = false;
        
        // Elementos da interface
        this.elements = {
            diceType: document.getElementById('diceType'),
            diceCount: document.getElementById('diceCount'),
            diceCountValue: document.getElementById('diceCountValue'),
            diceColor: document.getElementById('diceColor'),
            animationSpeed: document.getElementById('animationSpeed'),
            animationSpeedValue: document.getElementById('animationSpeedValue'),
            rollButton: document.getElementById('rollButton'),
            clearButton: document.getElementById('clearButton'),
            clearHistory: document.getElementById('clearHistory'),
            diceContainer: document.getElementById('diceContainer'),
            resultDisplay: document.getElementById('resultDisplay'),
            historyDisplay: document.getElementById('historyDisplay'),
            statsDisplay: document.getElementById('statsDisplay')
        };
        
        this.initializeEventListeners();
        this.loadHistory();
        this.updateSpeedLabel();
    }

    initializeEventListeners() {
        // Controles de sliders
        this.elements.diceCount.addEventListener('input', () => {
            const count = this.elements.diceCount.value;
            this.elements.diceCountValue.textContent = count == 1 ? '1 dado' : `${count} dados`;
        });

        this.elements.animationSpeed.addEventListener('input', () => {
            this.updateSpeedLabel();
        });

        // Botões principais
        this.elements.rollButton.addEventListener('click', () => this.rollDice());
        this.elements.clearButton.addEventListener('click', () => this.clearTable());
        this.elements.clearHistory.addEventListener('click', () => this.clearHistory());

        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRolling) {
                e.preventDefault();
                this.rollDice();
            }
        });

        // Clique na mesa para rolar
        this.elements.diceContainer.addEventListener('click', (e) => {
            if (e.target === this.elements.diceContainer && !this.isRolling) {
                this.rollDice();
            }
        });
    }

    updateSpeedLabel() {
        const speed = this.elements.animationSpeed.value;
        const labels = ['Muito Lenta', 'Lenta', 'Normal', 'Rápida', 'Muito Rápida'];
        this.elements.animationSpeedValue.textContent = labels[speed - 1];
    }

    async rollDice() {
        if (this.isRolling) return;

        this.isRolling = true;
        this.elements.rollButton.textContent = '🎲 Rolando...';
        this.elements.rollButton.disabled = true;

        // Configurações atuais
        const diceType = parseInt(this.elements.diceType.value);
        const diceCount = parseInt(this.elements.diceCount.value);
        const diceColor = this.elements.diceColor.value;
        const speed = parseInt(this.elements.animationSpeed.value);

        // Limpa dados anteriores
        this.clearTable();

        // Cria e anima os dados
        const diceElements = this.createDice(diceCount, diceType, diceColor);
        const results = await this.animateDiceRoll(diceElements, speed);

        // Mostra resultados
        this.displayResults(results, diceType);
        this.addToHistory(results, diceType);

        // Restaura botão
        this.isRolling = false;
        this.elements.rollButton.textContent = '🎲 Rolar Dados';
        this.elements.rollButton.disabled = false;

        // Vibração no mobile
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }

    createDice(count, type, color) {
        const diceElements = [];
        
        for (let i = 0; i < count; i++) {
            const dice = this.createSingleDice(type, color, i);
            this.elements.diceContainer.appendChild(dice);
            diceElements.push(dice);
        }
        
        return diceElements;
    }

    createSingleDice(type, color, index) {
        const dice = document.createElement('div');
        dice.className = `dice d${type}`;
        dice.style.setProperty('--dice-color', color);
        
        // Posição aleatória inicial
        const angle = (index * 360 / parseInt(this.elements.diceCount.value)) + (Math.random() * 60 - 30);
        const radius = 50 + Math.random() * 30;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        
        dice.style.transform = `translate(${x}px, ${y}px)`;
        
        // Cria face do dado
        const face = document.createElement('div');
        face.className = 'dice-face';
        face.style.background = this.getDiceGradient(type, color);
        
        const number = document.createElement('span');
        number.className = 'dice-number';
        number.textContent = '?';
        
        face.appendChild(number);
        dice.appendChild(face);
        
        return dice;
    }

    getDiceGradient(type, color) {
        const gradients = {
            4: `linear-gradient(145deg, ${color}, ${this.lightenColor(color, 20)})`,
            6: `linear-gradient(145deg, ${color}, ${this.lightenColor(color, 15)})`,
            8: `linear-gradient(145deg, ${color}, ${this.lightenColor(color, 25)})`,
            10: `linear-gradient(145deg, ${color}, ${this.lightenColor(color, 30)})`,
            12: `linear-gradient(145deg, ${color}, ${this.lightenColor(color, 35)})`,
            20: `linear-gradient(145deg, ${color}, ${this.lightenColor(color, 40)})`
        };
        return gradients[type] || gradients[6];
    }

    lightenColor(color, percent) {
        // Converte hex para RGB e clareia
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    async animateDiceRoll(diceElements, speed) {
        return new Promise((resolve) => {
            const results = [];
            const animationDuration = (6 - speed) * 500 + 1000; // 1.5s a 3.5s
            
            diceElements.forEach((dice, index) => {
                // Adiciona classe de animação
                dice.classList.add('rolling');
                
                // Remove animação após o tempo determinado
                setTimeout(() => {
                    dice.classList.remove('rolling');
                }, animationDuration);
                
                // Anima números durante a rolagem
                this.animateNumberChanging(dice, speed, animationDuration);
            });
            
            // Gera resultados finais após a animação
            setTimeout(() => {
                diceElements.forEach(dice => {
                    const diceType = parseInt(this.elements.diceType.value);
                    const result = Math.floor(Math.random() * diceType) + 1;
                    const numberElement = dice.querySelector('.dice-number');
                    numberElement.textContent = result;
                    
                    // Efeitos especiais
                    this.applySpecialEffects(dice, result, diceType);
                    
                    results.push(result);
                });
                
                resolve(results);
            }, animationDuration);
        });
    }

    animateNumberChanging(dice, speed, duration) {
        const numberElement = dice.querySelector('.dice-number');
        const diceType = parseInt(this.elements.diceType.value);
        const changeInterval = Math.max(50, 200 - speed * 30);
        
        let currentNumber = 1;
        const interval = setInterval(() => {
            currentNumber = Math.floor(Math.random() * diceType) + 1;
            numberElement.textContent = currentNumber;
        }, changeInterval);
        
        setTimeout(() => {
            clearInterval(interval);
        }, duration - 200);
    }

    applySpecialEffects(dice, result, diceType) {
        // Remove efeitos anteriores
        dice.classList.remove('max-roll', 'min-roll');
        
        if (result === diceType) {
            // Resultado máximo
            dice.classList.add('max-roll');
            setTimeout(() => dice.classList.remove('max-roll'), 1500);
        } else if (result === 1 && diceType > 4) {
            // Resultado mínimo
            dice.classList.add('min-roll');
            setTimeout(() => dice.classList.remove('min-roll'), 600);
        }
    }

    displayResults(results, diceType) {
        const resultContainer = this.elements.resultDisplay;
        const total = results.reduce((sum, val) => sum + val, 0);
        
        if (results.length === 0) {
            resultContainer.innerHTML = '<p class="no-results">Clique em "Rolar Dados" para começar!</p>';
            return;
        }
        
        let html = '';
        
        results.forEach((result, index) => {
            const isMax = result === diceType;
            const isMin = result === 1 && diceType > 4;
            let extraIcon = '';
            
            if (isMax) extraIcon = ' 🌟';
            if (isMin) extraIcon = ' 💥';
            
            html += `<div class="dice-result">D${diceType}: ${result}${extraIcon}</div>`;
        });
        
        if (results.length > 1) {
            html += `<div class="total-result">Total: ${total}</div>`;
        }
        
        resultContainer.innerHTML = html;
    }

    addToHistory(results, diceType) {
        const entry = {
            results: [...results],
            total: results.reduce((sum, val) => sum + val, 0),
            diceType: diceType,
            count: results.length,
            timestamp: new Date().toLocaleString('pt-BR')
        };
        
        this.history.unshift(entry);
        
        // Limita histórico a 20 entradas
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyContainer = this.elements.historyDisplay;
        const statsContainer = this.elements.statsDisplay;
        
        if (this.history.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">Nenhuma jogada ainda</p>';
            statsContainer.innerHTML = '';
            return;
        }
        
        // Histórico
        let historyHtml = '';
        this.history.slice(0, 8).forEach(entry => {
            const resultsText = entry.results.length === 1 
                ? entry.results[0] 
                : `[${entry.results.join(', ')}] = ${entry.total}`;
            
            historyHtml += `
                <div class="history-item">
                    <strong>${entry.count}x D${entry.diceType}</strong>: ${resultsText}
                    <br><small>${entry.timestamp}</small>
                </div>
            `;
        });
        historyContainer.innerHTML = historyHtml;
        
        // Estatísticas
        const totals = this.history.map(h => h.total);
        const average = (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1);
        const highest = Math.max(...totals);
        const lowest = Math.min(...totals);
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${this.history.length}</span>
                <span class="stat-label">Jogadas</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${average}</span>
                <span class="stat-label">Média</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${highest}</span>
                <span class="stat-label">Maior</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${lowest}</span>
                <span class="stat-label">Menor</span>
            </div>
        `;
    }

    clearTable() {
        this.elements.diceContainer.innerHTML = '';
        this.elements.resultDisplay.innerHTML = '<p class="no-results">Clique em "Rolar Dados" para começar!</p>';
    }

    clearHistory() {
        if (this.history.length === 0) {
            alert('Não há histórico para limpar!');
            return;
        }
        
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            this.history = [];
            this.saveHistory();
            this.updateHistoryDisplay();
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('dice3d_history', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Erro ao salvar histórico:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('dice3d_history');
            if (saved) {
                this.history = JSON.parse(saved);
                this.updateHistoryDisplay();
            }
        } catch (e) {
            console.warn('Erro ao carregar histórico:', e);
            this.history = [];
        }
    }
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    new DiceSimulator3D();
});

// Previne zoom duplo toque no mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Previne zoom com múltiplos toques
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});
