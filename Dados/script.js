class DICE3DSimulator {
    constructor() {
        this.diceArray = [];
        this.rollHistory = [];
        this.isRolling = false;
        this.rollCount = 0;
        
        // Elementos da interface
        this.elements = {
            // Controls
            diceType: document.getElementById('diceType'),
            diceCount: document.getElementById('diceCount'),
            diceCountValue: document.getElementById('diceCountValue'),
            diceColor: document.getElementById('diceColor'),
            rollForce: document.getElementById('rollForce'),
            rollForceValue: document.getElementById('rollForceValue'),
            tableTexture: document.getElementById('tableTexture'),
            gravity: document.getElementById('gravity'),
            gravityValue: document.getElementById('gravityValue'),
            bounce: document.getElementById('bounce'),
            bounceValue: document.getElementById('bounceValue'),
            spin: document.getElementById('spin'),
            spinValue: document.getElementById('spinValue'),
            
            // Buttons
            rollButton: document.getElementById('rollButton'),
            clearButton: document.getElementById('clearButton'),
            resetStats: document.getElementById('resetStats'),
            
            // Display areas
            diceArena: document.getElementById('diceArena'),
            diceTable: document.getElementById('diceTable'),
            resultDisplay: document.getElementById('resultDisplay'),
            historyDisplay: document.getElementById('historyDisplay'),
            diceCounter: document.getElementById('diceCounter'),
            lastRoll: document.getElementById('lastRoll'),
            
            // Stats
            totalRolls: document.getElementById('totalRolls'),
            averageRoll: document.getElementById('averageRoll'),
            highestRoll: document.getElementById('highestRoll'),
            streakCount: document.getElementById('streakCount')
        };
        
        this.initializeEventListeners();
        this.loadGameState();
        this.updateAllLabels();
    }

    initializeEventListeners() {
        // Range sliders com labels
        this.elements.diceCount.addEventListener('input', () => this.updateDiceCountLabel());
        this.elements.rollForce.addEventListener('input', () => this.updateRollForceLabel());
        this.elements.gravity.addEventListener('input', () => this.updateGravityLabel());
        this.elements.bounce.addEventListener('input', () => this.updateBounceLabel());
        this.elements.spin.addEventListener('input', () => this.updateSpinLabel());

        // Texturas da mesa
        this.elements.tableTexture.addEventListener('change', () => this.updateTableTexture());

        // Botões principais
        this.elements.rollButton.addEventListener('click', () => this.rollDice());
        this.elements.clearButton.addEventListener('click', () => this.clearTable());
        this.elements.resetStats.addEventListener('click', () => this.resetStats());

        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRolling) {
                e.preventDefault();
                this.rollDice();
            }
            if (e.code === 'KeyC' && e.ctrlKey) {
                e.preventDefault();
                this.clearTable();
            }
            if (e.code === 'KeyR' && e.ctrlKey) {
                e.preventDefault();
                this.rollDice();
            }
        });

        // Clique na mesa para rolar
        this.elements.diceTable.addEventListener('click', (e) => {
            if (e.target === this.elements.diceTable || e.target.classList.contains('table-surface')) {
                if (!this.isRolling) {
                    this.rollDice();
                }
            }
        });

        // Clique individual nos dados
        this.elements.diceArena.addEventListener('click', (e) => {
            const dice = e.target.closest('.dice-3d');
            if (dice && !this.isRolling) {
                this.rollSingleDice(dice);
            }
        });
    }

    updateAllLabels() {
        this.updateDiceCountLabel();
        this.updateRollForceLabel();
        this.updateGravityLabel();
        this.updateBounceLabel();
        this.updateSpinLabel();
        this.updateTableTexture();
    }

    updateDiceCountLabel() {
        const count = this.elements.diceCount.value;
        this.elements.diceCountValue.textContent = count == 1 ? '1 dado' : `${count} dados`;
    }

    updateRollForceLabel() {
        const force = this.elements.rollForce.value;
        const labels = ['Muito Fraco', 'Fraco', 'Médio', 'Forte', 'Muito Forte'];
        this.elements.rollForceValue.textContent = labels[force - 1];
    }

    updateGravityLabel() {
        const gravity = parseFloat(this.elements.gravity.value);
        let label = 'Normal';
        if (gravity < 0.8) label = 'Baixa';
        else if (gravity > 1.2) label = 'Alta';
        this.elements.gravityValue.textContent = label;
    }

    updateBounceLabel() {
        const bounce = parseFloat(this.elements.bounce.value);
        let label = 'Média';
        if (bounce < 0.3) label = 'Baixa';
        else if (bounce > 0.7) label = 'Alta';
        this.elements.bounceValue.textContent = label;
    }

    updateSpinLabel() {
        const spin = this.elements.spin.value;
        const labels = ['Mínima', 'Baixa', 'Média', 'Alta', 'Máxima'];
        const index = Math.floor((spin - 1) / 2);
        this.elements.spinValue.textContent = labels[Math.min(index, 4)];
    }

    updateTableTexture() {
        const texture = this.elements.tableTexture.value;
        const surface = document.querySelector('.table-surface');
        surface.className = `table-surface ${texture}`;
    }

    async rollDice() {
        if (this.isRolling) return;

        this.isRolling = true;
        this.elements.rollButton.textContent = '🎲 Rolando...';
        this.elements.rollButton.disabled = true;

        // Configurações atuais
        const diceType = this.elements.diceType.value;
        const diceCount = parseInt(this.elements.diceCount.value);
        const diceColor = this.elements.diceColor.value;
        const rollForce = parseInt(this.elements.rollForce.value);
        const spinLevel = parseInt(this.elements.spin.value);

        // Limpa dados anteriores
        this.clearTable();

        // Cria dados 3D
        const diceElements = this.createDice3D(diceCount, diceType, diceColor);
        
        // Anima rolagem
        const results = await this.animateDiceRoll(diceElements, rollForce, spinLevel);

        // Processa resultados
        this.displayResults(results, diceType);
        this.addToHistory(results, diceType);
        this.updateStats();

        // Restaura interface
        this.isRolling = false;
        this.elements.rollButton.textContent = '🎲 Rolar Dados';
        this.elements.rollButton.disabled = false;

        // Feedback tátil
        if (navigator.vibrate) {
            const pattern = this.getVibrationPattern(results, diceType);
            navigator.vibrate(pattern);
        }
    }

    createDice3D(count, type, color) {
        const diceElements = [];
        const maxFaces = this.getDiceMaxValue(type);

        for (let i = 0; i < count; i++) {
            const dice = this.createSingleDice3D(type, color, maxFaces, i);
            this.elements.diceArena.appendChild(dice);
            diceElements.push(dice);
        }

        this.updateDiceCounter();
        return diceElements;
    }

    createSingleDice3D(type, color, maxFaces, index) {
        const dice = document.createElement('div');
        dice.className = `dice-3d dice-${type}`;
        dice.style.setProperty('--dice-color', color);

        // Posição inicial em círculo
        const totalDice = parseInt(this.elements.diceCount.value);
        const angle = (index * 360 / totalDice) + (Math.random() * 40 - 20);
        const radius = 60 + Math.random() * 40;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;

        dice.style.transform = `translate(${x}px, ${y}px)`;

        // Cria faces do cubo 3D
        if (type === 'd6') {
            this.createD6Faces(dice, color);
        } else {
            this.createGenericDiceFaces(dice, color, maxFaces);
        }

        return dice;
    }

    createD6Faces(dice, color) {
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        
        faces.forEach((position, index) => {
            const face = document.createElement('div');
            face.className = `dice-face ${position} face-${index + 1}`;
            face.style.background = this.getDiceGradient(color);

            // Cria pontos para cada face
            this.createDots(face, index + 1);
            dice.appendChild(face);
        });
    }

    createGenericDiceFaces(dice, color, maxFaces) {
        // Para dados que não são D6, cria uma face principal
        const face = document.createElement('div');
        face.className = 'dice-face front generic-face';
        face.style.background = this.getDiceGradient(color);
        face.style.fontSize = '2rem';
        face.style.fontWeight = '900';
        face.style.color = '#333';
        face.textContent = '?';

        dice.appendChild(face);
    }

    createDots(face, number) {
        for (let i = 0; i < number; i++) {
            const dot = document.createElement('div');
            dot.className = 'dice-dot';
            face.appendChild(dot);
        }
    }

    getDiceGradient(color) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        const lighten = 30;
        const lightR = Math.min(255, r + lighten);
        const lightG = Math.min(255, g + lighten);
        const lightB = Math.min(255, b + lighten);
        
        const lightColor = `rgb(${lightR}, ${lightG}, ${lightB})`;
        return `linear-gradient(145deg, ${color}, ${lightColor})`;
    }

    getDiceMaxValue(type) {
        const maxValues = { d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20 };
        return maxValues[type] || 6;
    }

    async animateDiceRoll(diceElements, force, spin) {
        return new Promise((resolve) => {
            const results = [];
            const animationDuration = 2000 + (force * 200); // 2-3 segundos
            const maxValue = this.getDiceMaxValue(this.elements.diceType.value);

            diceElements.forEach((dice, index) => {
                // Adiciona classe de animação
                dice.classList.add('rolling');

                // Animação de números para dados genéricos
                if (!dice.querySelector('.face-1')) {
                    this.animateGenericDiceNumbers(dice, maxValue, animationDuration);
                }

                // Remove animação após duração
                setTimeout(() => {
                    dice.classList.remove('rolling');
                }, animationDuration);
            });

            // Gera e aplica resultados finais
            setTimeout(() => {
                diceElements.forEach(dice => {
                    const result = Math.floor(Math.random() * maxValue) + 1;
                    
                    if (dice.querySelector('.face-1')) {
                        // D6 com faces reais
                        dice.className = `dice-3d dice-d6 show-${result}`;
                    } else {
                        // Dados genéricos
                        const face = dice.querySelector('.generic-face');
                        if (face) face.textContent = result;
                    }

                    this.applySpecialEffects(dice, result, maxValue);
                    results.push(result);
                });

                resolve(results);
            }, animationDuration);
        });
    }

    animateGenericDiceNumbers(dice, maxValue, duration) {
        const face = dice.querySelector('.generic-face');
        if (!face) return;

        let currentNumber = 1;
        const changeInterval = 80;
        
        const interval = setInterval(() => {
            currentNumber = Math.floor(Math.random() * maxValue) + 1;
            face.textContent = currentNumber;
        }, changeInterval);

        setTimeout(() => {
            clearInterval(interval);
        }, duration - 300);
    }

    async rollSingleDice(dice) {
        if (this.isRolling) return;

        const maxValue = this.getDiceMaxValue(this.elements.diceType.value);
        
        dice.classList.add('rolling');
        
        setTimeout(() => {
            dice.classList.remove('rolling');
            const result = Math.floor(Math.random() * maxValue) + 1;
            
            if (dice.querySelector('.face-1')) {
                dice.className = `dice-3d dice-d6 show-${result}`;
            } else {
                const face = dice.querySelector('.generic-face');
                if (face) face.textContent = result;
            }
            
            this.applySpecialEffects(dice, result, maxValue);
            
            // Atualiza display com resultado único
            this.elements.resultDisplay.innerHTML = `
                <div class="dice-result">Resultado: ${result}</div>
            `;
        }, 1500);
    }

    applySpecialEffects(dice, result, maxValue) {
        // Remove efeitos anteriores
        dice.classList.remove('max-roll', 'min-roll');

        setTimeout(() => {
            if (result === maxValue) {
                dice.classList.add('max-roll');
                setTimeout(() => dice.classList.remove('max-roll'), 2000);
            } else if (result === 1 && maxValue > 4) {
                dice.classList.add('min-roll');
                setTimeout(() => dice.classList.remove('min-roll'), 800);
            }
        }, 100);
    }

    displayResults(results, diceType) {
        if (results.length === 0) {
            this.elements.resultDisplay.innerHTML = '<p class="no-results">Clique em "Rolar Dados" ou na mesa para começar!</p>';
            return;
        }

        const maxValue = this.getDiceMaxValue(diceType);
        const total = results.reduce((sum, val) => sum + val, 0);
        const diceTypeName = diceType.toUpperCase();

        let html = '';

        results.forEach((result, index) => {
            const isMax = result === maxValue;
            const isMin = result === 1 && maxValue > 4;
            let extraIcon = '';

            if (isMax) extraIcon = ' ⭐';
            if (isMin) extraIcon = ' 💥';

            html += `<div class="dice-result">${diceTypeName}: ${result}${extraIcon}</div>`;
        });

        if (results.length > 1) {
            html += `<div class="total-result">Total: ${total} (${results.length}x ${diceTypeName})</div>`;
        }

        this.elements.resultDisplay.innerHTML = html;
        this.elements.lastRoll.textContent = `Último resultado: ${results.length > 1 ? total : results[0]}`;
    }

    addToHistory(results, diceType) {
        const entry = {
            results: [...results],
            total: results.reduce((sum, val) => sum + val, 0),
            diceType: diceType.toUpperCase(),
            count: results.length,
            maxValue: this.getDiceMaxValue(diceType),
            timestamp: new Date().toLocaleString('pt-BR', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };

        this.rollHistory.unshift(entry);

        // Limita histórico a 15 entradas
        if (this.rollHistory.length > 15) {
            this.rollHistory = this.rollHistory.slice(0, 15);
        }

        this.rollCount++;
        this.updateHistoryDisplay();
        this.saveGameState();
    }

    updateHistoryDisplay() {
        if (this.rollHistory.length === 0) {
            this.elements.historyDisplay.innerHTML = '<p class="no-history">Nenhuma jogada registrada</p>';
            return;
        }

        let historyHtml = '';
        this.rollHistory.slice(0, 8).forEach((entry, index) => {
            const hasMax = entry.results.some(r => r === entry.maxValue);
            const hasMin = entry.results.some(r => r === 1 && entry.maxValue > 4);
            
            let icons = '';
            if (hasMax) icons += ' ⭐';
            if (hasMin) icons += ' 💥';

            const resultsText = entry.count === 1 
                ? `${entry.results[0]}` 
                : `[${entry.results.join(', ')}] = ${entry.total}`;

            historyHtml += `
                <div class="history-item">
                    <strong>#${this.rollCount - index}</strong> - 
                    ${entry.count}x ${entry.diceType}: ${resultsText}${icons}
                    <br><small>⏰ ${entry.timestamp}</small>
                </div>
            `;
        });

        this.elements.historyDisplay.innerHTML = historyHtml;
    }

    updateStats() {
        if (this.rollHistory.length === 0) {
            this.elements.totalRolls.textContent = '0';
            this.elements.averageRoll.textContent = '0';
            this.elements.highestRoll.textContent = '0';
            this.elements.streakCount.textContent = '0';
            return;
        }

        const totals = this.rollHistory.map(h => h.total);
        const average = (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1);
        const highest = Math.max(...totals);
        
        // Calcula sequência de valores máximos
        let currentStreak = 0;
        let maxStreak = 0;
        this.rollHistory.forEach(entry => {
            const hasMax = entry.results.some(r => r === entry.maxValue);
            if (hasMax) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });

        this.elements.totalRolls.textContent = this.rollCount;
        this.elements.averageRoll.textContent = average;
        this.elements.highestRoll.textContent = highest;
        this.elements.streakCount.textContent = maxStreak;

        this.updateDiceCounter();
    }

    updateDiceCounter() {
        const count = this.diceArray.length;
        this.elements.diceCounter.textContent = `Dados na mesa: ${count}`;
    }

    getVibrationPattern(results, diceType) {
        const maxValue = this.getDiceMaxValue(diceType);
        const hasMax = results.some(r => r === maxValue);
        const hasMin = results.some(r => r === 1 && maxValue > 4);

        if (hasMax && hasMin) return [100, 50, 100, 50, 200];
        if (hasMax) return [100, 50, 100];
        if (hasMin) return [200];
        return [100];
    }

    clearTable() {
        this.elements.diceArena.innerHTML = '';
        this.diceArray = [];
        this.elements.resultDisplay.innerHTML = '<p class="no-results">Clique em "Rolar Dados" ou na mesa para começar!</p>';
        this.elements.lastRoll.textContent = 'Último resultado: -';
        this.updateDiceCounter();
    }

    resetStats() {
        if (this.rollHistory.length === 0 && this.rollCount === 0) {
            alert('Não há estatísticas para resetar!');
            return;
        }

        if (confirm('Tem certeza que deseja zerar todas as estatísticas e histórico? Esta ação não pode ser desfeita.')) {
            this.rollHistory = [];
            this.rollCount = 0;
            this.updateHistoryDisplay();
            this.updateStats();
            this.saveGameState();

            // Feedback visual
            this.elements.resetStats.textContent = '✅ Resetado!';
            this.elements.resetStats.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            setTimeout(() => {
                this.elements.resetStats.textContent = '📊 Zerar Stats';
                this.elements.resetStats.style.background = 'linear-gradient(45deg, #fdcb6e, #e17055)';
            }, 2000);
        }
    }

    saveGameState() {
        try {
            const gameState = {
                rollHistory: this.rollHistory,
                rollCount: this.rollCount,
                settings: {
                    diceType: this.elements.diceType.value,
                    diceCount: this.elements.diceCount.value,
                    diceColor: this.elements.diceColor.value,
                    rollForce: this.elements.rollForce.value,
                    tableTexture: this.elements.tableTexture.value,
                    gravity: this.elements.gravity.value,
                    bounce: this.elements.bounce.value,
                    spin: this.elements.spin.value
                }
            };
            localStorage.setItem('dice3d_game_state', JSON.stringify(gameState));
        } catch (e) {
            console.warn('Erro ao salvar estado do jogo:', e);
        }
    }

    loadGameState() {
        try {
            const saved = localStorage.getItem('dice3d_game_state');
            if (saved) {
                const gameState = JSON.parse(saved);
                
                this.rollHistory = gameState.rollHistory || [];
                this.rollCount = gameState.rollCount || 0;
                
                if (gameState.settings) {
                    Object.keys(gameState.settings).forEach(key => {
                        if (this.elements[key]) {
                            this.elements[key].value = gameState.settings[key];
                        }
                    });
                }
                
                this.updateHistoryDisplay();
                this.updateStats();
            }
        } catch (e) {
            console.warn('Erro ao carregar estado do jogo:', e);
            this.rollHistory = [];
            this.rollCount = 0;
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new DICE3DSimulator();
});

// Prevenção de zoom em dispositivos móveis
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});
