class DiceGame {
    constructor() {
        this.dice = document.getElementById('dice');
        this.rollBtn = document.getElementById('rollBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.diceType = document.getElementById('diceType');
        this.diceCount = document.getElementById('diceCount');
        this.result = document.getElementById('result');
        this.resultValue = document.getElementById('resultValue');
        this.historyList = document.getElementById('historyList');
        this.stats = document.getElementById('stats');
        this.multipleDiceContainer = document.getElementById('multipleDiceContainer');
        this.history = [];
        this.isRolling = false;
        this.additionalDice = [];
        
        this.initializeEventListeners();
        this.loadHistory();
        this.updateDiceDisplay();
    }

    initializeEventListeners() {
        this.rollBtn.addEventListener('click', () => this.rollDice());
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        this.diceCount.addEventListener('change', () => this.updateDiceDisplay());
        this.diceType.addEventListener('change', () => this.updateDiceDisplay());
        
        // Suporte para toque no dado principal
        this.dice.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.isRolling) {
                this.rollDice();
            }
        });

        // Suporte para clique no dado principal
        this.dice.addEventListener('click', (e) => {
            if (!this.isRolling) {
                this.rollDice();
            }
        });
        
        // Suporte para teclado (barra de espaço)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRolling) {
                e.preventDefault();
                this.rollDice();
            }
        });
    }

    updateDiceDisplay() {
        const count = parseInt(this.diceCount.value);
        const diceTypeValue = parseInt(this.diceType.value);
        
        // Atualiza texto do botão
        const diceTypeName = `D${diceTypeValue}`;
        this.rollBtn.textContent = count === 1 ? `Rolar ${diceTypeName}` : `Rolar ${count} ${diceTypeName}s`;
        
        // Atualiza estilo do dado principal
        this.updateDiceStyle(this.dice, diceTypeValue);
        
        // Adiciona indicador de tipo
        this.updateDiceTypeIndicator(diceTypeValue);
        
        // Limpa e recria dados adicionais
        this.multipleDiceContainer.innerHTML = '';
        this.additionalDice = [];
        
        if (count > 1) {
            this.multipleDiceContainer.classList.add('show');
            this.createAdditionalDice(count - 1, diceTypeValue);
        } else {
            this.multipleDiceContainer.classList.remove('show');
        }
    }

    updateDiceStyle(diceElement, diceType) {
        // Remove classes antigas de tipo
        diceElement.className = diceElement.className.replace(/dice-type-d\d+/g, '');
        
        // Adiciona classe específica do tipo
        diceElement.classList.add(`dice-type-d${diceType}`);
    }

    updateDiceTypeIndicator(diceType) {
        // Remove indicador existente
        const existingIndicator = this.dice.parentElement.querySelector('.dice-type-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Cria novo indicador
        const indicator = document.createElement('div');
        indicator.className = 'dice-type-indicator';
        indicator.textContent = `D${diceType}`;
        this.dice.parentElement.appendChild(indicator);
    }

    createAdditionalDice(count, diceType) {
        for (let i = 0; i < count; i++) {
            const diceContainer = document.createElement('div');
            diceContainer.className = 'additional-dice';
            diceContainer.innerHTML = this.createDigitalDiceHTML(`additional-dice-${i}`, diceType);
            this.multipleDiceContainer.appendChild(diceContainer);
            
            const diceElement = diceContainer.querySelector('.dice');
            this.updateDiceStyle(diceElement, diceType);
            this.additionalDice.push(diceElement);
        }
    }

    createDigitalDiceHTML(id, diceType) {
        return `
            <div class="dice digital-dice dice-type-d${diceType}" id="${id}">
                <div class="dice-face">
                    <span class="dice-number">1</span>
                </div>
            </div>
        `;
    }

    rollDice() {
        if (this.isRolling) return;
        
        const diceQuantity = parseInt(this.diceCount.value);
        const diceTypeValue = parseInt(this.diceType.value);
        const diceTypeName = `D${diceTypeValue}`;
        
        this.isRolling = true;
        this.rollBtn.disabled = true;
        this.rollBtn.textContent = 'Rolando...';
        
        // Adiciona animação a todos os dados
        this.dice.classList.add('rolling');
        this.additionalDice.forEach(dice => dice.classList.add('rolling'));
        
        // Gera valores aleatórios para todos os dados
        const diceValues = [];
        for (let i = 0; i < diceQuantity; i++) {
            diceValues.push(Math.floor(Math.random() * diceTypeValue) + 1);
        }
        
        // Animação de números rolando
        this.animateRollingNumbers(diceTypeValue, diceValues);
        
        // Remove animação e mostra resultado após 1 segundo
        setTimeout(() => {
            this.dice.classList.remove('rolling');
            this.additionalDice.forEach(dice => dice.classList.remove('rolling'));
            
            this.showDiceResults(diceValues, diceTypeValue);
            this.showResult(diceValues, diceTypeValue);
            this.updateHistory(diceValues, diceTypeValue);
            this.updateStats();
            
            this.isRolling = false;
            this.rollBtn.disabled = false;
            this.rollBtn.textContent = diceQuantity === 1 ? `Rolar ${diceTypeName}` : `Rolar ${diceQuantity} ${diceTypeName}s`;
        }, 1000);
    }

    animateRollingNumbers(maxValue, finalValues) {
        const animateNumbers = (element, finalValue) => {
            const numberSpan = element.querySelector('.dice-number');
            let currentNumber = Math.floor(Math.random() * maxValue) + 1;
            const interval = setInterval(() => {
                currentNumber = Math.floor(Math.random() * maxValue) + 1;
                numberSpan.textContent = currentNumber;
            }, 60);

            setTimeout(() => {
                clearInterval(interval);
                numberSpan.textContent = finalValue;
            }, 900);
        };

        // Anima número do dado principal
        animateNumbers(this.dice, finalValues[0]);

        // Anima números dos dados adicionais
        this.additionalDice.forEach((dice, index) => {
            animateNumbers(dice, finalValues[index + 1]);
        });
    }

    showDiceResults(values, diceType) {
        // Atualiza o número no dado principal
        const mainNumberSpan = this.dice.querySelector('.dice-number');
        mainNumberSpan.textContent = values[0];
        
        // Atualiza números nos dados adicionais
        this.additionalDice.forEach((dice, index) => {
            if (values[index + 1] !== undefined) {
                const numberSpan = dice.querySelector('.dice-number');
                numberSpan.textContent = values[index + 1];
            }
        });

        // Adiciona efeitos especiais
        values.forEach((value, index) => {
            const diceElement = index === 0 ? this.dice : this.additionalDice[index - 1];
            
            // Remove efeitos anteriores
            diceElement.classList.remove('max-roll', 'min-roll');
            
            if (value === diceType) {
                // Valor máximo - efeito dourado
                setTimeout(() => {
                    diceElement.classList.add('max-roll');
                    setTimeout(() => diceElement.classList.remove('max-roll'), 1500);
                }, 100);
            } else if (value === 1 && diceType > 3) {
                // Valor mínimo (só para dados maiores que D3) - efeito shake
                setTimeout(() => {
                    diceElement.classList.add('min-roll');
                    setTimeout(() => diceElement.classList.remove('min-roll'), 600);
                }, 100);
            }
        });
    }

    showResult(values, diceType) {
        const total = values.reduce((sum, val) => sum + val, 0);
        const diceTypeName = `D${diceType}`;
        
        if (values.length === 1) {
            this.resultValue.textContent = `${values[0]} (${diceTypeName})`;
        } else {
            let resultHTML = '<div class="result-multiple">';
            values.forEach((value, index) => {
                const isMax = value === diceType;
                const isMin = value === 1 && diceType > 3;
                let extraClass = '';
                let extraText = '';
                
                if (isMax) {
                    extraText = ' 🌟';
                } else if (isMin) {
                    extraText = ' 💥';
                }
                
                resultHTML += `<span class="result-item${extraClass}">D${index + 1}: ${value}${extraText}</span>`;
            });
            resultHTML += '</div>';
            resultHTML += `<div class="result-total">Total: ${total} (${values.length}x ${diceTypeName})</div>`;
            this.resultValue.innerHTML = resultHTML;
        }
        
        this.result.classList.add('show');
        this.result.classList.add('result-highlight');
        setTimeout(() => this.result.classList.remove('result-highlight'), 800);
        
        // Vibração no mobile
        if (navigator.vibrate) {
            const hasMaxRoll = values.some(v => v === diceType);
            const hasMinRoll = values.some(v => v === 1 && diceType > 3);
            
            if (hasMaxRoll) {
                navigator.vibrate([100, 50, 100]); // Padrão especial para valor máximo
            } else if (hasMinRoll) {
                navigator.vibrate([200]); // Vibração mais longa para valor mínimo
            } else {
                navigator.vibrate(100); // Vibração normal
            }
        }
    }

    updateHistory(values, diceType) {
        const total = values.reduce((sum, val) => sum + val, 0);
        const diceTypeName = `D${diceType}`;
        const historyEntry = {
            values: values,
            total: total,
            diceType: diceType,
            diceTypeName: diceTypeName,
            timestamp: new Date().toLocaleString('pt-BR')
        };
        
        this.history.unshift(historyEntry);
        
        // Limita o histórico a 30 jogadas
        if (this.history.length > 30) {
            this.history = this.history.slice(0, 30);
        }
        
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<span style="opacity: 0.5;">Nenhuma jogada ainda</span>';
            this.stats.style.display = 'none';
            return;
        }
        
        this.historyList.innerHTML = this.history
            .map(entry => {
                const hasMaxRoll = entry.values.some(v => v === entry.diceType);
                const hasMinRoll = entry.values.some(v => v === 1 && entry.diceType > 3);
                
                let displayText = '';
                let titleText = '';
                
                if (entry.values.length === 1) {
                    displayText = `${entry.values[0]}`;
                    titleText = `${entry.diceTypeName}: ${entry.values[0]} | ${entry.timestamp}`;
                } else {
                    displayText = `${entry.total}`;
                    titleText = `${entry.values.length}x ${entry.diceTypeName}: [${entry.values.join(', ')}] = ${entry.total} | ${entry.timestamp}`;
                }
                
                if (hasMaxRoll) displayText += ' 🌟';
                if (hasMinRoll) displayText += ' 💥';
                
                return `<span class="history-item" title="${titleText}">${displayText}</span>`;
            })
            .join('');
        
        this.stats.style.display = 'grid';
    }

    updateStats() {
        if (this.history.length === 0) return;
        
        const total = this.history.length;
        const totals = this.history.map(entry => entry.total);
        const sum = totals.reduce((a, b) => a + b, 0);
        const average = (sum / total).toFixed(1);
        const last = this.history[0].total;
        const highest = Math.max(...totals);
        
        document.getElementById('totalRolls').textContent = total;
        document.getElementById('averageRoll').textContent = average;
        document.getElementById('lastRoll').textContent = last;
        document.getElementById('highestRoll').textContent = highest;
    }

    clearHistory() {
        if (this.history.length === 0) {
            alert('Não há histórico para limpar!');
            return;
        }
        
        if (confirm('Tem certeza que deseja zerar todo o histórico? Esta ação não pode ser desfeita.')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            this.result.classList.remove('show');
            this.resultValue.textContent = '-';
            
            // Feedback visual
            this.clearBtn.textContent = 'Limpo!';
            this.clearBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            setTimeout(() => {
                this.clearBtn.textContent = 'Zerar Histórico';
                this.clearBtn.style.background = 'linear-gradient(45deg, #ff4757, #c44569)';
            }, 1500);
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('advancedDiceHistory', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Não foi possível salvar o histórico no localStorage:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('advancedDiceHistory');
            if (saved) {
                this.history = JSON.parse(saved);
                // Compatibilidade com versões anteriores
                this.history = this.history.map(entry => {
                    if (typeof entry === 'number') {
                        return { 
                            values: [entry], 
                            total: entry, 
                            diceType: 6,
                            diceTypeName: 'D6',
                            timestamp: 'Histórico antigo' 
                        };
                    }
                    // Adiciona campos que podem estar faltando
                    if (!entry.diceType) entry.diceType = 6;
                    if (!entry.diceTypeName) entry.diceTypeName = `D${entry.diceType || 6}`;
                    if (!entry.timestamp) entry.timestamp = 'Data não disponível';
                    return entry;
                });
                this.renderHistory();
                this.updateStats();
            }
        } catch (e) {
            console.warn('Não foi possível carregar o histórico do localStorage:', e);
            this.history = [];
        }
    }
}

// Inicializa o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new DiceGame();
});

// Adiciona suporte para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker não disponível, continua normalmente
        });
    });
}

// Previne zoom no mobile em toques duplos
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
