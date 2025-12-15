// Game state variables
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // Player is X, AI is O
let gameActive = true;
let scores = { X: 0, O: 0, draws: 0 };
let gamesPlayed = 0;
let aiThinking = false;
let aiDifficulty = 'medium';

// DOM elements
const gameBoard = document.getElementById('game-board');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-btn');
const playerXElement = document.getElementById('player-x');
const playerOElement = document.getElementById('player-o');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const aiDifficultySelect = document.getElementById('ai-difficulty');
const aiThinkingElement = document.getElementById('ai-thinking');
const gamesPlayedElement = document.getElementById('games-played');
const playerWinsElement = document.getElementById('player-wins');
const aiWinsElement = document.getElementById('ai-wins');
const drawsElement = document.getElementById('draws');

// Winning combinations
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
];

// Initialize the game
function initGame() {
    createBoard();
    updateStatus();
    updatePlayerDisplay();
    updateStats();
    createParticles();
    
    // Event listeners
    resetButton.addEventListener('click', resetGame);
    aiDifficultySelect.addEventListener('change', function() {
        aiDifficulty = this.value;
        resetGame();
    });
}

// Create the game board
function createBoard() {
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => handleCellClick(i));
        gameBoard.appendChild(cell);
    }
}

// Handle cell click
function handleCellClick(index) {
    // Ignore if game is not active, cell is already filled, or AI is thinking
    if (!gameActive || board[index] !== '' || aiThinking || currentPlayer !== 'X') {
        return;
    }
    
    // Make the player's move
    makeMove(index, 'X');
    
    // Check if game is over
    if (checkGameOver()) return;
    
    // Switch to AI's turn
    currentPlayer = 'O';
    updatePlayerDisplay();
    updateStatus();
    
    // AI makes a move after a short delay
    aiThinking = true;
    showAIThinking(true);
    
    setTimeout(() => {
        makeAIMove();
        aiThinking = false;
        showAIThinking(false);
        
        // Check if game is over after AI move
        checkGameOver();
        
        // Switch back to player's turn
        currentPlayer = 'X';
        updatePlayerDisplay();
        updateStatus();
    }, 600);
}

// Make a move on the board
function makeMove(index, player) {
    // Update board array
    board[index] = player;
    
    // Update UI
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    
    // Add animation
    cell.style.transform = 'scale(0)';
    setTimeout(() => {
        cell.style.transform = 'scale(1)';
    }, 10);
}

// AI makes a move based on selected difficulty
function makeAIMove() {
    let availableMoves = board
        .map((cell, index) => cell === '' ? index : null)
        .filter(cell => cell !== null);
    
    if (availableMoves.length === 0) return;
    
    let move;
    
    switch(aiDifficulty) {
        case 'easy':
            // Random moves
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            break;
            
        case 'medium':
            // 70% chance of smart move, 30% chance of random move
            if (Math.random() < 0.7) {
                move = getBestMove();
            } else {
                move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
            break;
            
        case 'hard':
            // 90% chance of smart move
            if (Math.random() < 0.9) {
                move = getBestMove();
            } else {
                move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
            break;
            
        case 'impossible':
            // Always optimal move (minimax algorithm)
            move = getBestMove();
            break;
            
        default:
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    makeMove(move, 'O');
}

// Get the best move using Minimax algorithm
function getBestMove() {
    // Simple AI logic - not full minimax for brevity, but good enough
    // First, check if AI can win in the next move
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            if (checkWin('O')) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    
    // Check if player can win in the next move and block it
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'X';
            if (checkWin('X')) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    
    // Try to take the center if available
    if (board[4] === '') return 4;
    
    // Try to take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => board[i] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available edge
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(i => board[i] === '');
    if (availableEdges.length > 0) {
        return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }
    
    // Fallback - should not happen if game is not over
    const availableMoves = board
        .map((cell, index) => cell === '' ? index : null)
        .filter(cell => cell !== null);
    return availableMoves[0];
}

// Check if a player has won
function checkWin(player) {
    return winConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}

// Check if the game is over
function checkGameOver() {
    let roundWon = false;
    let winner = null;
    
    // Check for win
    if (checkWin('X')) {
        roundWon = true;
        winner = 'X';
    } else if (checkWin('O')) {
        roundWon = true;
        winner = 'O';
    }
    
    // Handle win
    if (roundWon) {
        gameActive = false;
        statusDisplay.textContent = winner === 'X' ? 'Congratulations! You won!' : 'AI wins! Try again!';
        statusDisplay.classList.add('win');
        
        // Update scores
        scores[winner]++;
        gamesPlayed++;
        
        // Highlight winning cells
        highlightWinningCells(winner);
        
        updateStats();
        return true;
    }
    
    // Check for draw
    if (!board.includes('')) {
        gameActive = false;
        statusDisplay.textContent = 'Game ended in a draw!';
        statusDisplay.classList.add('draw');
        
        // Update scores
        scores.draws++;
        gamesPlayed++;
        
        updateStats();
        return true;
    }
    
    return false;
}

// Highlight winning cells
function highlightWinningCells(winner) {
    // Find the winning combination
    let winningCombo = null;
    
    for (const condition of winConditions) {
        if (condition.every(index => board[index] === winner)) {
            winningCombo = condition;
            break;
        }
    }
    
    if (!winningCombo) return;
    
    // Highlight each winning cell
    winningCombo.forEach(index => {
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        cell.classList.add('winner');
    });
    
    // Draw a line through the winning cells
    drawWinningLine(winningCombo);
}

// Draw a line through winning cells
function drawWinningLine(winningCombo) {
    // Get the positions of the winning cells
    const cells = winningCombo.map(index => 
        document.querySelector(`.cell[data-index="${index}"]`)
    );
    
    // Calculate line position and dimensions
    const firstCell = cells[0].getBoundingClientRect();
    const lastCell = cells[2].getBoundingClientRect();
    const boardRect = gameBoard.getBoundingClientRect();
    
    const line = document.createElement('div');
    line.classList.add('winning-line');
    
    // Set line position and dimensions based on winning combination
    if (winningCombo[0] === 0 && winningCombo[2] === 8) {
        // Diagonal from top-left to bottom-right
        line.style.width = `${Math.sqrt(Math.pow(lastCell.right - firstCell.left, 2) + Math.pow(lastCell.bottom - firstCell.top, 2))}px`;
        line.style.transform = 'rotate(45deg)';
        line.style.left = `${firstCell.left - boardRect.left + firstCell.width/2}px`;
        line.style.top = `${firstCell.top - boardRect.top + firstCell.height/2}px`;
    } else if (winningCombo[0] === 2 && winningCombo[2] === 6) {
        // Diagonal from top-right to bottom-left
        line.style.width = `${Math.sqrt(Math.pow(lastCell.left - firstCell.right, 2) + Math.pow(lastCell.bottom - firstCell.top, 2))}px`;
        line.style.transform = 'rotate(-45deg)';
        line.style.left = `${firstCell.right - boardRect.left - firstCell.width/2}px`;
        line.style.top = `${firstCell.top - boardRect.top + firstCell.height/2}px`;
    } else if (winningCombo[0] === 0 && winningCombo[2] === 2 || 
               winningCombo[0] === 3 && winningCombo[2] === 5 || 
               winningCombo[0] === 6 && winningCombo[2] === 8) {
        // Horizontal lines
        line.style.width = `${lastCell.right - firstCell.left}px`;
        line.style.height = '6px';
        line.style.left = `${firstCell.left - boardRect.left}px`;
        line.style.top = `${firstCell.top - boardRect.top + firstCell.height/2 - 3}px`;
    } else {
        // Vertical lines
        line.style.height = `${lastCell.bottom - firstCell.top}px`;
        line.style.width = '6px';
        line.style.left = `${firstCell.left - boardRect.left + firstCell.width/2 - 3}px`;
        line.style.top = `${firstCell.top - boardRect.top}px`;
    }
    
    gameBoard.appendChild(line);
}

// Update game status
function updateStatus() {
    if (!gameActive) return;
    
    if (currentPlayer === 'X') {
        statusDisplay.textContent = 'Your turn! Place an X on the board';
        statusDisplay.classList.remove('win', 'draw');
    } else {
        statusDisplay.textContent = 'AI is thinking...';
        statusDisplay.classList.remove('win', 'draw');
    }
}

// Update player display
function updatePlayerDisplay() {
    if (currentPlayer === 'X') {
        playerXElement.classList.add('active');
        playerOElement.classList.remove('active');
    } else {
        playerOElement.classList.add('active');
        playerXElement.classList.remove('active');
    }
    
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
}

// Show AI thinking indicator
function showAIThinking(show) {
    if (show) {
        aiThinkingElement.innerHTML = '<div class="thinking-dots">AI thinking<span>.</span><span>.</span><span>.</span></div>';
    } else {
        aiThinkingElement.innerHTML = '';
    }
}

// Update game statistics
function updateStats() {
    gamesPlayedElement.textContent = gamesPlayed;
    playerWinsElement.textContent = scores.X;
    aiWinsElement.textContent = scores.O;
    drawsElement.textContent = scores.draws;
}

// Reset the game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    aiThinking = false;
    
    // Clear the board
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner');
    });
    
    // Remove winning line
    const lines = document.querySelectorAll('.winning-line');
    lines.forEach(line => line.remove());
    
    // Reset status
    statusDisplay.textContent = 'Your turn! Place an X on the board';
    statusDisplay.classList.remove('win', 'draw');
    
    // Update displays
    updatePlayerDisplay();
    showAIThinking(false);
}

// Create floating particles for background effect
function createParticles() {
    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size and position
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random color
        const colors = ['#00dbde', '#fc00ff', '#ffffff'];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random animation duration and delay
        particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize the game when page loads
window.addEventListener('DOMContentLoaded', initGame);
