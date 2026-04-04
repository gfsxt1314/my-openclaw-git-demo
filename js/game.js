/**
 * 五子棋游戏逻辑
 * @author 球球 🏀
 */

class GobangGame {
    constructor() {
        this.canvas = document.getElementById('board');
        this.ctx = this.canvas.getContext('2d');
        this.statusEl = document.getElementById('status');

        // 游戏配置（逻辑坐标）
        this.boardSize = 15;  // 15×15 棋盘
        this.cellSize = 40;   // 每格大小（逻辑像素）
        this.padding = 20;    // 边距（逻辑像素）

        // 计算逻辑尺寸
        this.logicalSize = this.padding * 2 + (this.boardSize - 1) * this.cellSize;

        // 游戏状态
        this.board = [];      // 棋盘状态 0=空，1=黑，2=白
        this.currentPlayer = 1; // 1=黑棋，2=白棋
        this.gameOver = false;
        this.winner = null;

        // 缩放比例（初始化为1，setupCanvas会更新）
        this.displayScale = 1;
        this.displaySize = this.logicalSize;
        this.dpr = 1;

        // 初始化
        this.init();
        this.bindEvents();

        // 监听窗口大小变化
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

        // 设置 Canvas 尺寸
        this.setupCanvas();

        this.updateStatus();
        this.drawBoard();
    }

    setupCanvas() {
        // 获取设备像素比
        this.dpr = window.devicePixelRatio || 1;

        // 获取 Canvas 的 CSS 显示尺寸
        const rect = this.canvas.getBoundingClientRect();
        let displaySize = rect.width;

        // 如果 getBoundingClientRect 返回 0，延迟初始化
        if (displaySize === 0) {
            requestAnimationFrame(() => this.setupCanvas());
            return;
        }

        // 确保 Canvas 是正方形（使用宽度作为基准）
        this.displaySize = displaySize;

        // 计算缩放比例：显示尺寸 / 逻辑尺寸
        this.displayScale = displaySize / this.logicalSize;

        // 设置 Canvas 内部像素尺寸（高分辨率）
        this.canvas.width = displaySize * this.dpr;
        this.canvas.height = displaySize * this.dpr;

        // 使用 setTransform 设置变换矩阵
        // 参数：水平缩放, 垂直缩放, 水平倾斜, 垂直倾斜, 水平偏移, 垂直偏移
        // dpr 缩放用于高分辨率，displayScale 用于将逻辑坐标映射到显示坐标
        this.ctx.setTransform(this.dpr * this.displayScale, 0, 0, this.dpr * this.displayScale, 0, 0);

        console.log('Canvas 初始化:', {
            logicalSize: this.logicalSize,
            displaySize: this.displaySize,
            displayScale: this.displayScale,
            dpr: this.dpr,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height
        });
    }

    handleResize() {
        const rect = this.canvas.getBoundingClientRect();

        if (rect.width > 0) {
            this.displaySize = rect.width;
            this.displayScale = this.displaySize / this.logicalSize;

            // 更新 Canvas 内部像素尺寸
            this.canvas.width = this.displaySize * this.dpr;
            this.canvas.height = this.displaySize * this.dpr;

            // 重置变换矩阵
            this.ctx.setTransform(this.dpr * this.displayScale, 0, 0, this.dpr * this.displayScale, 0, 0);

            console.log('Canvas resize:', {
                displaySize: this.displaySize,
                displayScale: this.displayScale
            });

            // 重绘棋盘
            this.drawBoard();
        }
    }

    drawBoard() {
        // 清空画布（使用逻辑尺寸，因为变换矩阵已处理缩放）
        this.ctx.clearRect(0, 0, this.logicalSize, this.logicalSize);

        // 画棋盘背景
        this.ctx.fillStyle = '#dcb35c';
        this.ctx.fillRect(0, 0, this.logicalSize, this.logicalSize);

        // 画网格线（使用逻辑坐标）
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
                    // i=行(y), j=列(x)，drawPiece 参数顺序是 (x, y, player)
                    this.drawPiece(j, i, this.board[i][j]);
                }
            }
        }
    }

    drawPiece(col, row, player) {
        // col = 列 = x 坐标，row = 行 = y 坐标
        const centerX = this.padding + col * this.cellSize;
        const centerY = this.padding + row * this.cellSize;
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

        // 获取点击/触摸坐标（相对于视口）
        const clientX = e.clientX !== undefined ? e.clientX : e.pageX - window.scrollX;
        const clientY = e.clientY !== undefined ? e.clientY : e.pageY - window.scrollY;

        // 计算相对于 Canvas 的坐标（CSS 显示像素）
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;

        // 转换为逻辑坐标
        // displayScale = displaySize / logicalSize
        // 所以 logicalX = displayX / displayScale
        const logicalX = canvasX / this.displayScale;
        const logicalY = canvasY / this.displayScale;

        // 计算点击的是哪个交叉点
        const col = Math.round((logicalX - this.padding) / this.cellSize);
        const row = Math.round((logicalY - this.padding) / this.cellSize);

        // 调试日志
        console.log('点击调试:', {
            // 原始坐标
            clientX, clientY,
            // Canvas 相对坐标
            canvasX, canvasY,
            // 显示尺寸和缩放
            displaySize: this.displaySize,
            displayScale: this.displayScale,
            // 逻辑坐标
            logicalX, logicalY,
            // 计算的行列
            row, col,
            // 验证：该行列在显示坐标中的位置
            expectedDisplayX: (this.padding + col * this.cellSize) * this.displayScale,
            expectedDisplayY: (this.padding + row * this.cellSize) * this.displayScale
        });

        // 检查是否在有效范围内
        if (col < 0 || col >= this.boardSize || row < 0 || row >= this.boardSize) {
            console.log('点击超出棋盘范围:', row, col);
            return;
        }

        // 检查该位置是否已有棋子
        if (this.board[row][col] !== 0) {
            console.log('位置已有棋子:', row, col);
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
