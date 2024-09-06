phina.globalize();

// 変数の定義
var SCREEN_WIDTH    = 640;
var SCREEN_HEIGHT   = 960;
var MAX_PER_LINE    = 20;
var BLOCK_NUM       = MAX_PER_LINE * 15;
var BLOCK_SIZE      = 26.5;
var BOARD_PADDING   = 50;
var PADDLE_WIDTH    = 150;
var PADDLE_HEIGHT   = 32;
var BALL_RADIUS     = 16;
var BALL_SPEED      = 24;  // ボールのスピードを少し上げる
var BALL_NUMBER     = 5;  // ボールの数

var BOARD_SIZE      = SCREEN_WIDTH - BOARD_PADDING * 2;
var BOARD_OFFSET_X  = BOARD_PADDING + BLOCK_SIZE / 2;
var BOARD_OFFSET_Y  = 80;

phina.define("TitleScene", {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    // タイトル表示
    Label({
      text: '誰の写真か当てるげーむ',
      fontSize: 50,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    Label({
      text: 'Press Space to Start',
      fontSize: 32,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() + 100);
  },

  update: function(app) {
    this.on('pointend', () => {
      this.exit('main');  // メインシーンに移動
    });
    if (app.keyboard.getKeyDown('space')) {
      this.exit('main');  // メインシーンに移動
    }
  },
});

phina.define("MainScene", {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    // ゲームオーバーフラグ
    this.isGameOver = false;

    // デバイスがPCかどうかを判定
    this.isPC = !phina.isMobile();

    // 背景画像の上半分を表示
    var backgroundSprite = Sprite('background').addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center(-3) - 70) // 画面上部に配置
      .setSize(SCREEN_WIDTH - 100, SCREEN_HEIGHT / 2 - 150); // 高さを画面の半分に設定

    this.group = DisplayElement().addChildTo(this);
    var gridX = Grid(BOARD_SIZE, MAX_PER_LINE);
    var gridY = Grid(BOARD_SIZE, MAX_PER_LINE);

    this.createBlocks(gridX, gridY);

    this.paddle = Paddle().addChildTo(this);
    this.paddle.setPosition(this.gridX.center(), this.gridY.span(13)); // バーを少し上に移動

    // ボールを3つ作成
    this.balls = [];
    for (let i = 0; i < BALL_NUMBER; i++) {
      let ball = Ball().addChildTo(this);
      ball.setPosition(this.paddle.x, this.paddle.top - ball.radius);  // バドルの上にボールを配置
      this.balls.push(ball);
    }

    this.paddle.hold(this.balls[0]);

    this.gameStarted = false;
    this.on('pointend', this.startGame.bind(this));

    this.time = 0;
  },

  update: function(app) {
    this.time += app.deltaTime;

    if (this.isGameOver || this.clearFlag) {
      this.on('pointend', () => {
        if (this.endFlag) this.exit('main');
        setTimeout(() => this.endFlag = true, 500);
      });
      if (app.keyboard.getKeyDown('space')) {
        this.exit('main');
      }
      return;
    }

    if (!this.gameStarted && app.keyboard.getKeyDown('space')) {
      this.startGame();
    }

    if (this.gameStarted) {
      this.balls.forEach(ball => {
        ball.move();
        this.checkCollisions(ball);
        this.adjustBallAngle(ball);
      });
    }

    if (this.isPC) {
      this.movePaddleWithKeyboard(app.keyboard);
    } else {
      this.movePaddle(app.pointer);
    }

    if (this.group.children.length <= 0) {
      this.gameClear();
    }
  },

  startGame: function() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.paddle.release();

      // ボールごとに速度と初期角度を設定
      this.balls.forEach(ball => {
        ball.speed = BALL_SPEED; // ボールのスピードを設定
        ball.direction = Vector2(1, -Math.random()).normalize();
      });
    }
  },

  adjustBallAngle: function(ball) {
    var minAngle = 0.3;
    var maxAngle = 1.2;

    if (Math.abs(ball.direction.x) < minAngle) {
      ball.direction.x = Math.sign(ball.direction.x) * minAngle;
      ball.direction.normalize();
    }

    if (Math.abs(ball.direction.y) < minAngle) {
      ball.direction.y = Math.sign(ball.direction.y) * minAngle;
      ball.direction.normalize();
    }
  },

  createBlocks: function(gridX, gridY) {
    (BLOCK_NUM).times(function(i) {
      var xIndex = i % MAX_PER_LINE;
      var yIndex = Math.floor(i / MAX_PER_LINE);
      var colorAngle = (360 / BLOCK_NUM) * i;
      var block = Block(colorAngle).addChildTo(this.group).setPosition(
        gridX.span(xIndex) + BOARD_OFFSET_X,
        gridY.span(yIndex) + BOARD_OFFSET_Y
      );
    }, this);
  },

  movePaddle: function(pointer) {
    var targetX = pointer.x.clamp(this.paddle.width / 2, this.gridX.width - this.paddle.width / 2);
    this.paddle.x += (targetX - this.paddle.x) * 0.2;
  },

  movePaddleWithKeyboard: function(keyboard) {
    var speed = 50;

    if (keyboard.getKey('left')) {
      this.paddle.x -= speed;
    }
    if (keyboard.getKey('right')) {
      this.paddle.x += speed;
    }

    var targetX = this.paddle.x.clamp(this.paddle.width / 2, this.gridX.width - this.paddle.width / 2);
    this.paddle.x += (targetX - this.paddle.x) * 0.2;
  },

  checkCollisions: function(ball) {
    this.checkWallCollision(ball);
    this.checkPaddleCollision(ball);
    this.checkBlockCollisions(ball);
  },

  checkWallCollision: function(ball) {
    if (ball.left < 0) {
      ball.left = 0;
      ball.reflectX();
    }
    if (ball.right > this.gridX.width) {
      ball.right = this.gridX.width;
      ball.reflectX();
    }
    if (ball.top < 0) {
      ball.top = 0;
      ball.reflectY();
    }
    if (ball.bottom > this.gridY.width) {
      // ボールが画面の下に出た場合、ボールを削除
      this.balls.splice(this.balls.indexOf(ball), 1);
      ball.remove();
  
      // すべてのボールがなくなったらゲームオーバー
      if (this.balls.length === 0) {
        this.gameOver();
      }
    }
  },  

  checkPaddleCollision: function(ball) {
    if (ball.hitTestElement(this.paddle)) {
      // ボールの下側をパドルの上に移動させる
      ball.bottom = this.paddle.top;
  
      // X方向の反射（左右反転）
      ball.reflectY();  // Y方向の反射
      
      // ボールの速度を保つために正規化
      ball.direction.normalize();
  
      // ボールが1つだけの場合に分裂させる
      if (this.balls.length === 1 && Math.random() < 0.5) {
        this.splitBall(ball);
      }
    }
  },

  checkBlockCollisions: function(ball) {
    this.group.children.clone().some(function(block) {
      if (ball.hitTestElement(block)) {
        this.handleBlockCollision(block, ball);
        return true;
      }
    }, this);
  },

  handleBlockCollision: function(block, ball) {
    var dq = Vector2.sub(ball, block);
  
    if (Math.abs(dq.x) < Math.abs(dq.y)) {
      ball.reflectY();
      if (dq.y >= 0) {
        ball.top = block.bottom;
      } else {
        ball.bottom = block.top;
      }
    } else {
      ball.reflectX();
      if (dq.x >= 0) {
        ball.left = block.right;
      } else {
        ball.right = block.left;
      }
    }
  
    block.remove();
  
    // ボールが1つだけの場合に分裂させる
    if (this.balls.length === 1 && Math.random() < 0.333) {
      this.splitBall(ball);
    }
  },

  // ボールを3つに分裂させる関数
  splitBall: function(originalBall) {
    for (let i = 0; i < 2; i++) {
      // 新しいボールを作成
      let newBall = Ball().addChildTo(this);
      
      // 元のボールの位置に新しいボールを配置
      newBall.setPosition(originalBall.x, originalBall.y);
      
      // 新しい角度で射出 (少し角度を変える)
      newBall.direction = Vector2(Math.random() * 2 - 1, -1).normalize();
      
      // 新しいボールをボールリストに追加
      this.balls.push(newBall);
    }
  },

  gameClear: function() {
    this.clearFlag = true;

    Label({
      text: 'Game Clear',
      fontSize: 64,
      fill: 'red',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    Label({
      text: 'Press Space to Retry',
      fontSize: 32,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() + 100);
  },

  gameOver: function() {
    this.isGameOver = true;

    Label({
      text: 'Game Over',
      fontSize: 64,
      fill: 'red',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    Label({
      text: 'Press Space to Retry',
      fontSize: 32,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() + 100);
  },
});

phina.define('Block', {
  superClass: 'RectangleShape',

  init: function(angle) {
    this.superInit({
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      fill: 'hsl({0}, 80%, 60%)'.format(angle || 0),
      stroke: null,
      cornerRadius: 3,
    });
  },
});

phina.define('Ball', {
  superClass: 'CircleShape',

  init: function() {
    this.superInit({
      radius: BALL_RADIUS,
      fill: '#eee',
      stroke: null,
      cornerRadius: 8,
    });

    this.speed = BALL_SPEED;  // 初期スピードを定義
    this.direction = Vector2(1, -1).normalize();
  },

  move: function() {
    this.x += this.direction.x * this.speed;  // スピードを反映させる
    this.y += this.direction.y * this.speed;  // スピードを反映させる
  },

  reflectX: function() {
    this.direction.x *= -1;
    this.speedUp();
  },

  reflectY: function() {
    this.direction.y *= -1;
    this.speedUp();
  },

  speedUp: function() {
    this.speed = Math.min(this.speed + 0.5, 32);  // 最大スピードを設定
  },
});

phina.define('Paddle', {
  superClass: 'RectangleShape',
  init: function() {
    this.superInit({
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      fill: '#eee',
      stroke: null,
      cornerRadius: 8,
    });
  },

  hold: function(ball) {
    this.ball = ball;
  },

  release: function() {
    this.ball = null;
  },

  update: function() {
    if (this.ball) {
      this.ball.x = this.x;
      this.ball.y = this.top - this.ball.radius;
    }
  }
});

phina.main(function() {
  var app = GameApp({
    title: 'Breakout',
    startLabel: 'title',  // タイトルシーンから開始
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#444',
    autoPause: true,
    debug: false,
    assets: {
      image: {
        'background': 'https://amanaimages.com/pickup/img/historicalfigures/bnr_kagaku_GRA6070701900M.jpg',
      },
    },
  });

  app.run();
});
