/**
 * 五子棋游戏逻辑
 * @author 球球 🏀
 */

class GobangGame {
    constructor() {
        this.canvas = document.getElementById('board');
        this.ctx = this.canvas.getContext('2d');
        this.statusEl = document.getElementById('status');
        
        // 游戏配置
        this.boardSize = 15;  // 15×15 棋盘
        this.cellSize = 40;   // 每格大小
        this.padding = 20;    // 边距
        
        // 游戏状态
        this.board = [];      // 棋盘状态 0=空，1=黑，2=白
        this.currentPlayer = 1; // 1=黑棋，2=白棋
        this.gameOver = false;
        this.winner = null;
        
        // 初始化
        this.init();
        this.bindEvents();
    }
    
    init() {
        // 初始化棋盘数组
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = 0;
            }
        }
        
        this.currentPlayer = 1;
        this.gameOver = false;
        this.winner = null;
        
        // 设置 Canvas 内部尺寸（逻辑尺寸）
        const logicalSize = this.padding * 2 + (this.boardSize - 1) * this.cellSize;
        this.canvas.width = logicalSize;
        this.canvas.height = logicalSize;
        
        this.updateStatus();
        this.drawBoard();
    }
    
    drawBoard() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 画棋盘背景
        this.ctx.fillStyle = '#dcb35c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 画网格线
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, this.padding + i * this.cellSize);
            this.ctx.lineTo(this.padding + (this.boardSize - 1) * this.cellSize, this.padding + i * this.cellSize);
            this.ctx.stroke();
            
            // 竖线
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding + i * this.cellSize, this.padding);
            this.ctx.lineTo(this.padding + i * this.cellSize, this.padding + (this.boardSize - 1) * this.cellSize);
            this.ctx.stroke();
        }
        
        // 画天元和星位
        this.drawStarPoints();
        
        // 画棋子
        this.drawPieces();
    }
    
    drawStarPoints() {
        const starPoints = [
            [3, 3], [3, 11], [7, 7], [11, 3], [11, 11]
        ];
        
        this.ctx.fillStyle = '#000';
        starPoints.forEach(([x, y]) => {
            this.ctx.beginPath();
            this.ctx.arc(
                this.padding + x * this.cellSize,
                this.padding + y * this.cellSize,
                4, 0, Math.PI * 2
            );
            this.ctx.fill();
        });
    }
    
    drawPieces() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== 0) {
                    this.drawPiece(i, j, this.board[i][j]);
                }
            }
        }
    }
    
    drawPiece(x, y, player) {
        const centerX = this.padding + x * this.cellSize;
        const centerY = this.padding + y * this.cellSize;
        const radius = this.cellSize * 0.4;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        // 创建渐变效果
        const gradient = this.ctx.createRadialGradient(
            centerX - 5, centerY - 5, 0,
            centerX, centerY, radius
        );
        
        if (player === 1) {
            // 黑棋
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
        } else {
            // 白棋
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // 添加阴影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.stroke();
        
        // 重置阴影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            
            // 计算 Canvas 实际显示尺寸与内部尺寸的缩放比例
            // this.canvas.width/height 是 Canvas 的内部像素尺寸（600x600）
            // rect.width/height 是 Canvas 在页面上的实际显示尺寸（可能经过 CSS 缩放）
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            // 将鼠标坐标（相对于视口）转换为 Canvas 内部坐标
            // 考虑可能的滚动偏移（虽然 getBoundingClientRect 已经包含滚动）
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            // 计算点击的是哪个交叉点
            const col = Math.round((x - this.padding) / this.cellSize);
            const row = Math.round((y - this.padding) / this.cellSize);
            
            // 检查是否在有效范围内
            if (col < 0 || col >= this.boardSize || row < 0 || row >= this.boardSize) {
                return;
            }
            
            // 检查该位置是否已有棋子
            if (this.board[row][col] !== 0) {
                return;
            }
            
            // 落子
            this.placePiece(row, col);
        });
    }
    
    placePiece(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.drawBoard();
        
        // 检查胜负
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.updateStatus();
            this.showWinMessage();
            return;
        }
        
        // 检查是否平局
        if (this.checkDraw()) {
            this.gameOver = true;
            this.updateStatus();
            alert('平局！');
            return;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateStatus();
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        
        // 四个方向：横、竖、左斜、右斜
        const directions = [
            [[0, 1], [0, -1]],   // 横向
            [[1, 0], [-1, 0]],   // 竖向
            [[1, 1], [-1, -1]],  // 左斜
            [[1, -1], [-1, 1]]   // 右斜
        ];
        
        for (const [dir1, dir2] of directions) {
            let count = 1; // 当前落子
            
            // 向方向 1 计数
            count += this.countInDirection(row, col, dir1[0], dir1[1], player);
            // 向方向 2 计数
            count += this.countInDirection(row, col, dir2[0], dir2[1], player);
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    countInDirection(row, col, dRow, dCol, player) {
        let count = 0;
        let r = row + dRow;
        let c = col + dCol;
        
        while (
            r >= 0 && r < this.boardSize &&
            c >= 0 && c < this.boardSize &&
            this.board[r][c] === player
        ) {
            count++;
            r += dRow;
            c += dCol;
        }
        
        return count;
    }
    
    checkDraw() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    
    updateStatus() {
        if (this.gameOver && this.winner) {
            const winnerText = this.winner === 1 ? '黑棋' : '白棋';
            this.statusEl.textContent = `🎉 ${winnerText}获胜！`;
            this.statusEl.style.background = '#ffeb3b';
        } else if (this.gameOver) {
            this.statusEl.textContent = '平局！';
            this.statusEl.style.background = '#ffeb3b';
        } else {
            const playerText = this.currentPlayer === 1 ? '黑棋' : '白棋';
            this.statusEl.textContent = `当前：${playerText}`;
            this.statusEl.style.background = '#f0f0f0';
        }
    }
    
    showWinMessage() {
        const winnerText = this.winner === 1 ? '黑棋' : '白棋';
        setTimeout(() => {
            alert(`🎉 恭喜 ${winnerText} 获胜！`);
        }, 100);
    }
    
    restart() {
        this.init();
    }
}

// 启动游戏
const game = new GobangGame();
