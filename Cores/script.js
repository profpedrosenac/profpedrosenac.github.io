const harmonyDescriptions = {
    mono: {
        title: "Cores Monocromáticas",
        description: "Utilize variações de luminosidade e saturação de uma única matiz para criar composições elegantes e sofisticadas. Esta relação harmônica oferece unidade visual e tranquilidade, sendo ideal para designs minimalistas e interfaces clean."
    },
    complement: {
        title: "Cores Complementares", 
        description: "Combinação de cores diametralmente opostas no círculo cromático que geram contraste máximo e impacto visual. Perfeitas para destacar elementos importantes, criar hierarquia visual e transmitir energia dinâmica em layouts modernos."
    },
    analogous: {
        title: "Cores Análogas",
        description: "Harmonia natural entre cores vizinhas no círculo cromático que cria sensação de fluidez e continuidade. Ideal para atmosferas serenas, gradientes suaves e designs que buscam conforto visual e coesão estética."
    },
    triadic: {
        title: "Cores Triádicas",
        description: "Esquema equilibrado de três cores equidistantes que oferece vibração controlada e diversidade harmônica. Proporciona riqueza visual mantendo estabilidade, sendo excelente para identidades visuais marcantes e interfaces dinâmicas."
    },
    split: {
        title: "Cores Complementares Divididas",
        description: "Variação sofisticada das complementares que combina uma cor base com as duas adjacentes à sua oposta. Mantém contraste vibrante com maior sutileza, oferecendo versatilidade para composições complexas e refinadas."
    },
    tetradic: {
        title: "Cores Tetrádicas (Retângulo)",
        description: "Sistema avançado de quatro cores formando retângulo no círculo, criando duas duplas complementares balanceadas. Oferece máxima versatilidade cromática para projetos complexos que demandam riqueza visual e múltiplas hierarquias."
    }
};

class ColorWheel {
    constructor() {
        this.canvas = document.getElementById('colorWheel');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = 200;
        this.centerY = 200;
        this.radius = 180;
        this.primaryHue = 180;
        this.saturation = 70;
        this.lightness = 50;
        this.mode = 'mono';
        this.colors = [];
        this.isDragging = false;
        this.dragTarget = null;
        
        this.init();
        this.attachEvents();
        this.updatePalette();
    }

    init() {
        this.drawWheel();
        this.updateSelectors();
        this.updateCurrentColorDisplay();
        this.updateHSLDisplay();
        this.updateSliders();
        this.updateHarmonyDescription();
    }

    drawWheel() {
        const ctx = this.ctx;
        const centerX = this.centerX;
        const centerY = this.centerY;
        const radius = this.radius;

        // Limpar canvas
        ctx.clearRect(0, 0, 400, 400);

        // Desenhar círculo cromático com gradiente de saturação
        for (let angle = 0; angle < 360; angle += 1) {
            const startAngle = (angle - 0.5) * Math.PI / 180;
            const endAngle = (angle + 0.5) * Math.PI / 180;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.arc(centerX, centerY, 20, endAngle, startAngle, true);
            ctx.closePath();
            
            // Gradiente radial de saturação
            const gradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius);
            gradient.addColorStop(0, `hsl(${angle}, 0%, 50%)`);
            gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
            
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // Círculo interno
        ctx.beginPath();
        ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
        ctx.fillStyle = '#f8f9fa';
        ctx.fill();
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    updateSelectors() {
        const primarySelector = document.getElementById('primarySelector');
        const angle = (this.primaryHue - 90) * Math.PI / 180;
        const distance = 20 + (this.saturation / 100) * (this.radius - 20);
        
        const x = this.centerX + Math.cos(angle) * distance;
        const y = this.centerY + Math.sin(angle) * distance;
        
        primarySelector.style.left = x + 'px';
        primarySelector.style.top = y + 'px';
        primarySelector.style.backgroundColor = `hsl(${this.primaryHue}, ${this.saturation}%, ${this.lightness}%)`;

        this.updateSecondarySelectors();
    }

    updateSecondarySelectors() {
        const container = document.getElementById('secondarySelectors');
        container.innerHTML = '';

        const secondaryHues = this.getSecondaryHues();
        
        secondaryHues.forEach((hue, index) => {
            const selector = document.createElement('div');
            selector.className = 'color-selector secondary';
            
            const angle = (hue - 90) * Math.PI / 180;
            const distance = 20 + (this.saturation / 100) * (this.radius - 20);
            const x = this.centerX + Math.cos(angle) * distance;
            const y = this.centerY + Math.sin(angle) * distance;
            
            selector.style.left = x + 'px';
            selector.style.top = y + 'px';
            selector.style.backgroundColor = `hsl(${hue}, ${this.saturation}%, ${this.lightness}%)`;
            
            container.appendChild(selector);
        });
    }

    updateCurrentColorDisplay() {
        const display = document.getElementById('currentColorDisplay');
        display.style.backgroundColor = `hsl(${this.primaryHue}, ${this.saturation}%, ${this.lightness}%)`;
    }

    updateHSLDisplay() {
        document.getElementById('hue-value').textContent = Math.round(this.primaryHue) + '°';
        document.getElementById('saturation-value').textContent = Math.round(this.saturation) + '%';
        document.getElementById('lightness-value').textContent = Math.round(this.lightness) + '%';
    }

    updateSliders() {
        document.getElementById('hue-slider').value = this.primaryHue;
        document.getElementById('saturation-slider').value = this.saturation;
        document.getElementById('lightness-slider').value = this.lightness;
        
        document.getElementById('hue-input').value = Math.round(this.primaryHue);
        document.getElementById('saturation-input').value = Math.round(this.saturation);
        document.getElementById('lightness-input').value = Math.round(this.lightness);
    }

    updateHarmonyDescription() {
        const descContainer = document.getElementById('harmonyDescription');
        const harmony = harmonyDescriptions[this.mode];
        descContainer.innerHTML = `
            <h4>${harmony.title}</h4>
            <p>${harmony.description}</p>
        `;
    }

    getSecondaryHues() {
        const hues = [];
        
        switch(this.mode) {
            case 'complement':
                hues.push((this.primaryHue + 180) % 360);
                break;
            case 'analogous':
                hues.push((this.primaryHue + 30) % 360);
                hues.push((this.primaryHue - 30 + 360) % 360);
                break;
            case 'triadic':
                hues.push((this.primaryHue + 120) % 360);
                hues.push((this.primaryHue + 240) % 360);
                break;
            case 'split':
                hues.push((this.primaryHue + 150) % 360);
                hues.push((this.primaryHue + 210) % 360);
                break;
            case 'tetradic':
                hues.push((this.primaryHue + 90) % 360);
                hues.push((this.primaryHue + 180) % 360);
                hues.push((this.primaryHue + 270) % 360);
                break;
        }
        
        return hues;
    }

    updatePalette() {
        this.colors = [this.primaryHue, ...this.getSecondaryHues()];
        this.renderPalette();
    }

    renderPalette() {
        const container = document.getElementById('colorPalette');
        container.innerHTML = '';

        this.colors.forEach((hue, index) => {
            const lightnesses = [20, 35, 50, 65, 80];
            
            lightnesses.forEach((lightness, lIndex) => {
                const color = `hsl(${hue}, ${this.saturation}%, ${lightness}%)`;
                const hex = this.hslToHex(hue, this.saturation, lightness);
                
                const row = document.createElement('div');
                row.className = 'color-row';
                
                row.innerHTML = `
                    <div class="color-swatch" style="background-color: ${color}" onclick="copyToClipboard('${hex}')"></div>
                    <div class="color-info">
                        <div class="color-name">Cor ${index + 1}.${lIndex + 1}</div>
                        <div class="color-values">${hex} | hsl(${Math.round(hue)}, ${Math.round(this.saturation)}%, ${lightness}%)</div>
                    </div>
                `;
                
                container.appendChild(row);
            });
        });
    }

    handleColorSelection(x, y) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.radius && distance >= 20) {
            // Calcular Matiz baseada no ângulo
            let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
            if (angle < 0) angle += 360;
            this.primaryHue = angle;
            
            // Calcular Saturação baseada na distância do centro
            this.saturation = Math.min(100, Math.max(0, ((distance - 20) / (this.radius - 20)) * 100));
            
            this.updateSelectors();
            this.updateCurrentColorDisplay();
            this.updateHSLDisplay();
            this.updateSliders();
            this.updatePalette();
            this.updateColorInput();
        }
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    attachEvents() {
        // Eventos de mouse para clique e arraste no círculo
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const dx = x - this.centerX;
            const dy = y - this.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.radius && distance >= 20) {
                this.isDragging = true;
                this.dragTarget = 'wheel';
                this.handleColorSelection(x, y);
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.dragTarget === 'wheel') {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.handleColorSelection(x, y);
                e.preventDefault();
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.dragTarget = null;
        });

        // Eventos de toque para dispositivos móveis
        this.canvas.addEventListener('touchstart', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches;
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const dx = x - this.centerX;
            const dy = y - this.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.radius && distance >= 20) {
                this.isDragging = true;
                this.dragTarget = 'wheel';
                this.handleColorSelection(x, y);
                e.preventDefault();
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging && this.dragTarget === 'wheel') {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches;
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this.handleColorSelection(x, y);
                e.preventDefault();
            }
        });

        document.addEventListener('touchend', () => {
            this.isDragging = false;
            this.dragTarget = null;
        });

        // Sliders para ajustes finos
        document.getElementById('hue-slider').addEventListener('input', (e) => {
            this.primaryHue = parseFloat(e.target.value);
            this.updateValues();
        });

        document.getElementById('saturation-slider').addEventListener('input', (e) => {
            this.saturation = parseFloat(e.target.value);
            this.updateValues();
        });

        document.getElementById('lightness-slider').addEventListener('input', (e) => {
            this.lightness = parseFloat(e.target.value);
            this.updateValues();
        });

        // Inputs numéricos
        document.getElementById('hue-input').addEventListener('input', (e) => {
            const value = Math.min(360, Math.max(0, parseFloat(e.target.value) || 0));
            this.primaryHue = value;
            this.updateValues();
        });

        document.getElementById('saturation-input').addEventListener('input', (e) => {
            const value = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
            this.saturation = value;
            this.updateValues();
        });

        document.getElementById('lightness-input').addEventListener('input', (e) => {
            const value = Math.min(90, Math.max(10, parseFloat(e.target.value) || 10));
            this.lightness = value;
            this.updateValues();
        });

        // Selector de harmonia
        document.getElementById('harmonySelect').addEventListener('change', (e) => {
            this.mode = e.target.value;
            this.updateSelectors();
            this.updatePalette();
            this.updateHarmonyDescription();
        });

        // Input de cor primária
        document.getElementById('primaryColorInput').addEventListener('change', (e) => {
            const hex = e.target.value;
            if (hex.match(/^#[0-9A-F]{6}$/i)) {
                const hsl = this.hexToHsl(hex);
                this.primaryHue = hsl.h;
                this.saturation = hsl.s;
                this.lightness = hsl.l;
                this.updateValues();
            }
        });
    }

    updateValues() {
        this.updateSelectors();
        this.updateCurrentColorDisplay();
        this.updateHSLDisplay();
        this.updateSliders();
        this.updatePalette();
        this.updateColorInput();
    }

    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    updateColorInput() {
        const hex = this.hslToHex(this.primaryHue, this.saturation, this.lightness);
        document.getElementById('primaryColorInput').value = hex;
    }
}

// Funções globais
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.createElement('div');
        notification.textContent = '✅ Cor copiada para área de transferência!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ecc71;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    });
}

function copyPrimaryColor() {
    const hex = colorWheel.hslToHex(colorWheel.primaryHue, colorWheel.saturation, colorWheel.lightness);
    copyToClipboard(hex);
}

function randomizePalette() {
    const randomHue = Math.floor(Math.random() * 360);
    const randomSat = 50 + Math.floor(Math.random() * 50);
    const randomLight = 30 + Math.floor(Math.random() * 40);
    
    colorWheel.primaryHue = randomHue;
    colorWheel.saturation = randomSat;
    colorWheel.lightness = randomLight;
    colorWheel.updateValues();
}

function resetPalette() {
    colorWheel.primaryHue = 180;
    colorWheel.saturation = 70;
    colorWheel.lightness = 50;
    colorWheel.updateValues();
}

function exportCSS() {
    let css = ':root {\n';
    css += `  /* Paleta ${harmonyDescriptions[colorWheel.mode].title} */\n`;
    colorWheel.colors.forEach((hue, index) => {
        const lightnesses = [20, 35, 50, 65, 80];
        lightnesses.forEach((lightness, lIndex) => {
            const hex = colorWheel.hslToHex(hue, colorWheel.saturation, lightness);
            css += `  --color-${index + 1}-${lIndex + 1}: ${hex};\n`;
        });
    });
    css += '}';
    
    downloadFile('palette.css', css);
}

function exportJSON() {
    const palette = {
        type: colorWheel.mode,
        name: harmonyDescriptions[colorWheel.mode].title,
        description: harmonyDescriptions[colorWheel.mode].description,
        primary: {
            hue: Math.round(colorWheel.primaryHue),
            saturation: Math.round(colorWheel.saturation),
            lightness: Math.round(colorWheel.lightness)
        },
        colors: []
    };
    
    colorWheel.colors.forEach((hue, index) => {
        const lightnesses = [20, 35, 50, 65, 80];
        const colorVariations = lightnesses.map(lightness => ({
            hex: colorWheel.hslToHex(hue, colorWheel.saturation, lightness),
            hsl: `hsl(${Math.round(hue)}, ${Math.round(colorWheel.saturation)}%, ${lightness}%)`
        }));
        palette.colors.push(colorVariations);
    });
    
    downloadFile('palette.json', JSON.stringify(palette, null, 2));
}

function exportPNG() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 200;
    
    const swatchWidth = canvas.width / (colorWheel.colors.length * 5);
    let x = 0;
    
    colorWheel.colors.forEach(hue => {
        const lightnesses = [20, 35, 50, 65, 80];
        lightnesses.forEach(lightness => {
            const color = `hsl(${hue}, ${colorWheel.saturation}%, ${lightness}%)`;
            ctx.fillStyle = color;
            ctx.fillRect(x, 0, swatchWidth, canvas.height);
            x += swatchWidth;
        });
    });
    
    const link = document.createElement('a');
    link.download = 'palette.png';
    link.href = canvas.toDataURL();
    link.click();
}

function exportASE() {
    // Simulação de exportação ASE (Adobe Swatch Exchange)
    let aseContent = `Adobe Swatch Exchange - ${harmonyDescriptions[colorWheel.mode].title}\n\n`;
    
    colorWheel.colors.forEach((hue, index) => {
        const lightnesses = [20, 35, 50, 65, 80];
        lightnesses.forEach((lightness, lIndex) => {
            const hex = colorWheel.hslToHex(hue, colorWheel.saturation, lightness);
            const hsl = `hsl(${Math.round(hue)}, ${Math.round(colorWheel.saturation)}%, ${lightness}%)`;
            aseContent += `Color ${index + 1}.${lIndex + 1}: ${hex} (${hsl})\n`;
        });
    });
    
    downloadFile('palette.ase.txt', aseContent);
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

// Inicializar aplicação
let colorWheel;
document.addEventListener('DOMContentLoaded', () => {
    colorWheel = new ColorWheel();
});
