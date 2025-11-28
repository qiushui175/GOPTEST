// Game State
let gameState = {
    initialPrice: 100,
    gameDays: 30,
    initialFunds: 10000,
    riseProbability: 50,
    currentDay: 1,
    currentPrice: 100,
    priceHistory: [],
    players: [
        { cash: 10000, shares: 0, totalHistory: [] },
        { cash: 10000, shares: 0, totalHistory: [] }
    ],
    gameOver: false
};

// Charts
let stockChart = null;
let player1Chart = null;
let player2Chart = null;

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('next-day-btn').addEventListener('click', nextDay);
});

function startGame() {
    // Get setup values
    gameState.initialPrice = parseFloat(document.getElementById('initial-price').value) || 100;
    gameState.gameDays = parseInt(document.getElementById('game-days').value) || 30;
    gameState.initialFunds = parseFloat(document.getElementById('initial-funds').value) || 10000;
    gameState.riseProbability = parseFloat(document.getElementById('rise-probability').value) || 50;

    // Validate inputs
    if (gameState.initialPrice <= 0 || gameState.gameDays <= 0 || gameState.initialFunds <= 0) {
        showToast('请输入有效的正数值', 'error');
        return;
    }

    if (gameState.riseProbability < 0 || gameState.riseProbability > 100) {
        showToast('上涨概率必须在0-100之间', 'error');
        return;
    }

    // Initialize game state
    gameState.currentDay = 1;
    gameState.currentPrice = gameState.initialPrice;
    gameState.priceHistory = [gameState.initialPrice];
    gameState.gameOver = false;
    gameState.players = [
        { cash: gameState.initialFunds, shares: 0, totalHistory: [gameState.initialFunds] },
        { cash: gameState.initialFunds, shares: 0, totalHistory: [gameState.initialFunds] }
    ];

    // Switch screens
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');

    // Initialize UI
    updateUI();
    initCharts();
}

function initCharts() {
    // Destroy existing charts
    if (stockChart) stockChart.destroy();
    if (player1Chart) player1Chart.destroy();
    if (player2Chart) player2Chart.destroy();

    // Stock price chart
    const stockCanvas = document.getElementById('stock-chart');
    stockChart = new Chart(stockCanvas, {
        type: 'line',
        data: {
            labels: generateDayLabels(),
            datasets: [{
                label: '股价',
                data: gameState.priceHistory,
                borderColor: '#00d9ff',
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: getChartOptions('股票价格走势')
    });

    // Player 1 chart
    const player1Canvas = document.getElementById('player1-chart');
    player1Chart = new Chart(player1Canvas, {
        type: 'line',
        data: {
            labels: generateDayLabels(),
            datasets: [{
                label: '总资产',
                data: gameState.players[0].totalHistory,
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: getChartOptions('玩家1资产变化', true)
    });

    // Player 2 chart
    const player2Canvas = document.getElementById('player2-chart');
    player2Chart = new Chart(player2Canvas, {
        type: 'line',
        data: {
            labels: generateDayLabels(),
            datasets: [{
                label: '总资产',
                data: gameState.players[1].totalHistory,
                borderColor: '#ff9900',
                backgroundColor: 'rgba(255, 153, 0, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: getChartOptions('玩家2资产变化', true)
    });
}

function getChartOptions(title, compact = false) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: !compact,
                text: title,
                color: '#fff'
            },
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#aaa',
                    maxTicksLimit: compact ? 5 : 10
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#aaa',
                    callback: function(value) {
                        return '¥' + value.toFixed(0);
                    }
                }
            }
        }
    };
}

function generateDayLabels() {
    return gameState.priceHistory.map((_, index) => `第${index + 1}天`);
}

function nextDay() {
    if (gameState.gameOver) return;

    // Calculate price change
    const isRise = Math.random() * 100 < gameState.riseProbability;
    const changePercent = isRise ? 0.10 : -0.10;
    const oldPrice = gameState.currentPrice;
    gameState.currentPrice = Math.max(0.01, gameState.currentPrice * (1 + changePercent));
    gameState.currentPrice = Math.round(gameState.currentPrice * 100) / 100;

    // Add to history
    gameState.priceHistory.push(gameState.currentPrice);

    // Update player totals
    gameState.players.forEach(player => {
        const total = player.cash + player.shares * gameState.currentPrice;
        player.totalHistory.push(Math.round(total * 100) / 100);
    });

    // Increment day
    gameState.currentDay++;

    // Update UI
    updateUI();
    updateCharts();

    // Check if game is over
    if (gameState.currentDay > gameState.gameDays) {
        endGame();
    }
}

function updateUI() {
    // Update day info
    document.getElementById('current-day').textContent = `第 ${gameState.currentDay} 天`;
    document.getElementById('days-remaining').textContent = `剩余 ${Math.max(0, gameState.gameDays - gameState.currentDay + 1)} 天`;

    // Update stock price
    document.getElementById('stock-price').textContent = `¥${gameState.currentPrice.toFixed(2)}`;
    
    // Update price change indicator
    const priceChangeEl = document.getElementById('price-change');
    if (gameState.priceHistory.length > 1) {
        const prevPrice = gameState.priceHistory[gameState.priceHistory.length - 2];
        const change = gameState.currentPrice - prevPrice;
        const changePercent = (change / prevPrice * 100).toFixed(1);
        if (change > 0) {
            priceChangeEl.textContent = `+${changePercent}%`;
            priceChangeEl.className = 'change up';
        } else if (change < 0) {
            priceChangeEl.textContent = `${changePercent}%`;
            priceChangeEl.className = 'change down';
        } else {
            priceChangeEl.textContent = '0%';
            priceChangeEl.className = 'change';
        }
    } else {
        priceChangeEl.textContent = '';
    }

    // Update player info
    for (let i = 0; i < 2; i++) {
        const player = gameState.players[i];
        const total = player.cash + player.shares * gameState.currentPrice;
        document.getElementById(`player${i + 1}-cash`).textContent = `¥${player.cash.toFixed(2)}`;
        document.getElementById(`player${i + 1}-shares`).textContent = `${player.shares} 股`;
        document.getElementById(`player${i + 1}-total`).textContent = `¥${total.toFixed(2)}`;
    }

    // Enable/disable next day button
    document.getElementById('next-day-btn').disabled = gameState.gameOver;
}

function updateCharts() {
    const labels = generateDayLabels();
    
    // Update stock chart
    stockChart.data.labels = labels;
    stockChart.data.datasets[0].data = gameState.priceHistory;
    stockChart.update();

    // Update player charts
    player1Chart.data.labels = labels;
    player1Chart.data.datasets[0].data = gameState.players[0].totalHistory;
    player1Chart.update();

    player2Chart.data.labels = labels;
    player2Chart.data.datasets[0].data = gameState.players[1].totalHistory;
    player2Chart.update();
}

function executeTrade(playerNum, action) {
    if (gameState.gameOver) return;

    const playerIndex = playerNum - 1;
    const player = gameState.players[playerIndex];
    const tradeType = document.getElementById(`player${playerNum}-trade-type`).value;
    const tradeValue = parseFloat(document.getElementById(`player${playerNum}-trade-value`).value) || 0;

    if (tradeValue <= 0) {
        showToast('请输入有效的交易数量', 'error');
        return;
    }

    let shares;
    if (tradeType === 'shares') {
        shares = Math.floor(tradeValue);
    } else {
        // Calculate shares from amount
        shares = Math.floor(tradeValue / gameState.currentPrice);
    }

    if (shares <= 0) {
        showToast('交易数量不足', 'error');
        return;
    }

    if (action === 'buy') {
        const cost = shares * gameState.currentPrice;
        if (cost > player.cash) {
            // Calculate max affordable shares
            shares = Math.floor(player.cash / gameState.currentPrice);
            if (shares <= 0) {
                showToast('资金不足', 'error');
                return;
            }
        }
        const finalCost = shares * gameState.currentPrice;
        player.cash -= finalCost;
        player.shares += shares;
        showToast(`玩家${playerNum} 买入 ${shares} 股，花费 ¥${finalCost.toFixed(2)}`, 'success');
    } else {
        // Sell
        if (shares > player.shares) {
            shares = player.shares;
            if (shares <= 0) {
                showToast('没有可卖出的股票', 'error');
                return;
            }
        }
        const revenue = shares * gameState.currentPrice;
        player.cash += revenue;
        player.shares -= shares;
        showToast(`玩家${playerNum} 卖出 ${shares} 股，获得 ¥${revenue.toFixed(2)}`, 'success');
    }

    // Round cash to avoid floating point issues
    player.cash = Math.round(player.cash * 100) / 100;

    // Update current day's total in history
    const total = player.cash + player.shares * gameState.currentPrice;
    player.totalHistory[player.totalHistory.length - 1] = Math.round(total * 100) / 100;

    // Reset trade input
    document.getElementById(`player${playerNum}-trade-value`).value = 0;

    // Update UI
    updateUI();
    updateCharts();
}

function endGame() {
    gameState.gameOver = true;
    
    // Calculate final totals
    const totals = gameState.players.map(player => 
        player.cash + player.shares * gameState.currentPrice
    );

    // Determine winner
    let winner;
    if (totals[0] > totals[1]) {
        winner = 0;
    } else if (totals[1] > totals[0]) {
        winner = 1;
    } else {
        winner = -1; // Tie
    }

    // Show results
    const resultsHtml = `
        <div class="result-item ${winner === 0 ? 'winner' : ''}">
            <div class="player-name">玩家 1 ${winner === 0 ? '🏆' : ''}</div>
            <div class="player-total">¥${totals[0].toFixed(2)}</div>
        </div>
        <div class="result-item ${winner === 1 ? 'winner' : ''}">
            <div class="player-name">玩家 2 ${winner === 1 ? '🏆' : ''}</div>
            <div class="player-total">¥${totals[1].toFixed(2)}</div>
        </div>
        ${winner === -1 ? '<p style="margin-top: 15px; color: #00d9ff;">平局!</p>' : ''}
    `;

    document.getElementById('final-results').innerHTML = resultsHtml;
    document.getElementById('game-over').classList.remove('hidden');
}

function restartGame() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
}

function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove after animation
    setTimeout(() => {
        toast.remove();
    }, 2000);
}
