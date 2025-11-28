/**
 * SimpleChart - A minimal line chart library
 * No external dependencies
 */

class SimpleChart {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.data = config.data || { labels: [], datasets: [] };
        this.options = config.options || {};
        
        // Bind resize handler for proper event listener removal
        this._resizeHandler = () => this.resize();
        
        // Set canvas size
        this.resize();
        window.addEventListener('resize', this._resizeHandler);
        
        this.draw();
    }
    
    resize() {
        const parent = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = parent.clientWidth * dpr;
        this.canvas.height = parent.clientHeight * dpr;
        this.canvas.style.width = parent.clientWidth + 'px';
        this.canvas.style.height = parent.clientHeight + 'px';
        this.ctx.scale(dpr, dpr);
        this.width = parent.clientWidth;
        this.height = parent.clientHeight;
        this.draw();
    }
    
    draw() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const width = this.width;
        const height = this.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Padding
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // Get data
        const labels = this.data.labels || [];
        const datasets = this.data.datasets || [];
        
        if (labels.length === 0 || datasets.length === 0) return;
        
        // Calculate min/max values
        let allValues = [];
        datasets.forEach(ds => {
            allValues = allValues.concat(ds.data || []);
        });
        
        if (allValues.length === 0) return;
        
        let minValue = Math.min(...allValues);
        let maxValue = Math.max(...allValues);
        
        // Add padding to range
        const range = maxValue - minValue || 1;
        minValue = minValue - range * 0.1;
        maxValue = maxValue + range * 0.1;
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        const numYLines = 5;
        for (let i = 0; i <= numYLines; i++) {
            const y = padding.top + (chartHeight * i / numYLines);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            
            // Y-axis labels
            const value = maxValue - ((maxValue - minValue) * i / numYLines);
            ctx.fillStyle = '#aaa';
            ctx.font = '11px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('¥' + value.toFixed(0), padding.left - 8, y + 4);
        }
        
        // Vertical grid lines and X labels
        const numXLines = Math.min(labels.length - 1, 8);
        const xStep = numXLines > 0 ? Math.ceil(labels.length / numXLines) : 1;
        
        for (let i = 0; i < labels.length; i += xStep) {
            const x = padding.left + (chartWidth * i / (labels.length - 1 || 1));
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();
            
            // X-axis labels
            ctx.fillStyle = '#aaa';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], x, height - padding.bottom + 15);
        }
        
        // Draw datasets
        datasets.forEach((dataset, dsIndex) => {
            const data = dataset.data || [];
            if (data.length === 0) return;
            
            const color = dataset.borderColor || '#00d9ff';
            const bgColor = dataset.backgroundColor || 'rgba(0, 217, 255, 0.1)';
            
            // Draw fill
            ctx.beginPath();
            ctx.moveTo(padding.left, height - padding.bottom);
            
            data.forEach((value, i) => {
                const x = padding.left + (chartWidth * i / (data.length - 1 || 1));
                const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue) * chartHeight);
                ctx.lineTo(x, y);
            });
            
            ctx.lineTo(padding.left + chartWidth, height - padding.bottom);
            ctx.closePath();
            ctx.fillStyle = bgColor;
            ctx.fill();
            
            // Draw line
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            
            data.forEach((value, i) => {
                const x = padding.left + (chartWidth * i / (data.length - 1 || 1));
                const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue) * chartHeight);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = color;
            data.forEach((value, i) => {
                const x = padding.left + (chartWidth * i / (data.length - 1 || 1));
                const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue) * chartHeight);
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }
    
    update() {
        this.draw();
    }
    
    destroy() {
        window.removeEventListener('resize', this._resizeHandler);
    }
}

// Export for use
window.Chart = SimpleChart;
