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
        
        // 监听窗口大小变化，重新调整 Canvas
        window.addEventListener('resize', () => this.handleResize());
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
        
        // 设置 Canvas 尺寸（考虑 devicePixelRatio）
        this.setupCanvas();
        
        this.updateStatus();
        this.drawBoard();
    }
    
    setupCanvas() {
        // 计算逻辑尺寸
        const logicalSize = this.padding * 2 + (this.boardSize - 1) * this.cellSize;
        
        // 获取设备像素比（Retina 屏幕通常是 2 或 3）
        const dpr = window.devicePixelRatio || 1;
        
        // 获取 Canvas 的显示尺寸（CSS 设置的尺寸）
        const rect = this.canvas.getBoundingClientRect();
        const displayWidth = rect.width || logicalSize;
        const displayHeight = rect.height || logicalSize;
        
        // 设置 Canvas 内部像素尺寸（高分辨率）
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;
        
        // 设置 CSS 显示尺寸
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        
        // 缩放上下文以匹配设备像素比
        this.ctx.scale(dpr, dpr);
        
        // 保存缩放比例，用于点击坐标转换
        this.scaleX = logicalSize / displayWidth;
        this.scaleY = logicalSize / displayHeight;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.dpr = dpr;
    }
    
    handleResize() {
        // 重新设置 Canvas 尺寸
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        if (rect.width > 0 && rect.height > 0) {
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            
            this.scaleX = (this.padding * 2 + (this.boardSize - 1) * this.cellSize) / rect.width;
            this.scaleY = this.scaleX; // 保持宽高一致
            this.displayWidth = rect.width;
            this.displayHeight = rect.height;
            
            // 重绘棋盘
            this.drawBoard();
        }
    }
    
    drawBoard() {
        // 计算逻辑尺寸
        const logicalSize = this.padding * 2 + (this.boardSize - 1) * this.cellSize;
        
        // 清空画布（使用显示尺寸）
        this.ctx.clearRect(0, 0, this.displayWidth || logicalSize, this.displayHeight || logicalSize);
        
        // 画棋盘背景
        this.ctx.fillStyle = '#dcb35c';
        this.ctx.fillRect(0, 0, this.displayWidth || logicalSize, this.displayHeight || logicalSize);
        
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
        // 使用 touch-action 防止触摸滚动
        this.canvas.style.touchAction = 'none';
        
        // 鼠标点击
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // 触摸支持
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 防止滚动和缩放
            const touch = e.touches[0];
            this.handleClick(touch);
        }, { passive: false });
    }
    
    handleClick(e) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        
        // 获取点击/触摸坐标
        const clientX = e.clientX !== undefined ? e.clientX : e.pageX - window.scrollX;
        const clientY = e.clientY !== undefined ? e.clientY : e.pageY - window.scrollY;
        
        // 计算相对于 Canvas 的坐标
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;
        
        // 转换为游戏逻辑坐标
        // 考虑 CSS 缩放和设备像素比
        const x = canvasX * this.scaleX;
        const y = canvasY * this.scaleY;
        
        // 计算点击的是哪个交叉点
        const col = Math.round((x - this.padding) / this.cellSize);
        const row = Math.round((y - this.padding) / this.cellSize);
        
        // 调试日志（可在浏览器控制台查看）
        console.log('点击坐标:', { canvasX, canvasY, x, y, row, col, scaleX: this.scaleX });
        
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
