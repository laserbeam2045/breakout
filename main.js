phina.globalize();

var SCREEN_WIDTH    = 640;
var SCREEN_HEIGHT   = 960;
var MAX_PER_LINE    = 8;
var BLOCK_NUM       = MAX_PER_LINE * 5;
var BLOCK_SIZE      = 66;
var BOARD_PADDING   = 50;
var PADDLE_WIDTH    = 150;
var PADDLE_HEIGHT   = 32;
var BALL_RADIUS     = 16;
var BALL_SPEED      = 16;

var BOARD_SIZE      = SCREEN_WIDTH - BOARD_PADDING * 2;
var BOARD_OFFSET_X  = BOARD_PADDING + BLOCK_SIZE / 2;
var BOARD_OFFSET_Y  = 100;

phina.define("TitleScene", {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    // タイトル表示
    Label({
      text: '誰の写真か当てろげーむ',
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

    // // 背景テキスト
    // this.backgroundLabel = Label({
    //   text: '「口」  「岡」  「？？」',
    //   fill: 'rgba(255, 255, 255, 0.4)',  // 背景に馴染むように透明度を設定
    //   fontSize: 48,
    //   fontWeight: 'bold',
    // }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() - 300);

    // this.backgroundLabel = Label({
    //   text: '「富」  「梨」  「形」',
    //   fill: 'rgba(255, 255, 255, 0.4)',  // 背景に馴染むように透明度を設定
    //   fontSize: 48,
    //   fontWeight: 'bold',
    // }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() - 200);

    // デバイスがPCかどうかを判定
    this.isPC = !phina.isMobile();

    // 背景画像の上半分を表示
    var backgroundSprite = Sprite('background').addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center(-3) - 70) // 画面上部に配置
      .setSize(SCREEN_WIDTH - 100, SCREEN_HEIGHT / 2 - 150); // 高さを画面の半分に設定

    // グループ
    this.group = DisplayElement().addChildTo(this);

    var gridX = Grid(BOARD_SIZE, MAX_PER_LINE);
    var gridY = Grid(BOARD_SIZE, MAX_PER_LINE);

    this.createBlocks(gridX, gridY);

    // ボール
    this.ball = Ball().addChildTo(this);

    // パドル
    this.paddle = Paddle().addChildTo(this);
    this.paddle.setPosition(this.gridX.center(), this.gridY.span(13));
    this.paddle.hold(this.ball);

    // タッチまたはスペースキーでゲーム開始
    this.gameStarted = false;
    this.on('pointend', this.startGame.bind(this));

    // 時間
    this.time = 0;
  },

  update: function(app) {
    // タイムを加算
    this.time += app.deltaTime;

    // ゲームオーバー時には更新処理を停止
    if (this.isGameOver || this.clearFlag) {
      this.on('pointend', () => {
        if (this.endFlag) this.exit('main');  // スペースキーでシーンをリセットまたはタイトルに戻る
        setTimeout(() => this.endFlag = true, 500)
      });
      if (app.keyboard.getKeyDown('space')) {
        this.exit('main');  // スペースキーでシーンをリセットまたはタイトルに戻る
      }
      return;
    }

    // スペースキーでゲーム開始
    if (!this.gameStarted && app.keyboard.getKeyDown('space')) {
      this.startGame();
    }

    if (this.gameStarted) {
      var steps = Math.ceil(this.ballSpeed);
      (steps).times(function() {
        this.ball.move();
        this.checkCollisions();
        this.adjustBallAngle();
      }, this);
    }

    if (this.isPC) {
      // PCの場合はキーボード操作のみ
      this.movePaddleWithKeyboard(app.keyboard);
    } else {
      // モバイルの場合はタッチ操作
      this.movePaddle(app.pointer);
    }

    // スピードに基づいたフレームレート調整
    var steps = Math.ceil(this.ballSpeed);

    // スピードの数分、移動と衝突判定を繰り返す
    (steps).times(function() {
      this.ball.move();
      this.checkCollisions();
      this.adjustBallAngle(); // ボールが移動するたびに角度を調整
    }, this);

    // ブロックがすべてなくなったらクリア
    if (this.group.children.length <= 0) {
      this.gameClear();
    }
  },

  gameOver: function() {
    this.isGameOver = true;

    // 「Game Over」の表示
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

  startGame: function() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.paddle.release();
      this.ballSpeed = BALL_SPEED;
      this.ball.direction = Vector2(1, -Math.random()).normalize(); // 初期のボールの角度をランダムに調整
      this.adjustBallAngle(); // 初期角度も調整
    }
  },

  adjustBallAngle: function() {
    var minAngle = 0.3; // 最小の傾き（ラジアン）
    var maxAngle = 1.2; // 最大の傾き（ラジアン）

    if (Math.abs(this.ball.direction.x) < minAngle) {
      this.ball.direction.x = Math.sign(this.ball.direction.x) * minAngle;
      this.ball.direction.normalize();
    }

    if (Math.abs(this.ball.direction.y) < minAngle) {
      this.ball.direction.y = Math.sign(this.ball.direction.y) * minAngle;
      this.ball.direction.normalize();
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
    this.paddle.x += (targetX - this.paddle.x) * 0.2; // スムーズな移動
  },

  movePaddleWithKeyboard: function(keyboard) {
    var speed = 35; // キーボードでの移動速度

    if (keyboard.getKey('left')) {
      this.paddle.x -= speed;
    }
    if (keyboard.getKey('right')) {
      this.paddle.x += speed;
    }

    var targetX = this.paddle.x.clamp(this.paddle.width / 2, this.gridX.width - this.paddle.width / 2);
    this.paddle.x += (targetX - this.paddle.x) * 0.2; // スムーズな移動
  },

  checkCollisions: function() {
    this.checkWallCollision();
    this.checkPaddleCollision();
    this.checkBlockCollisions();
  },

  checkWallCollision: function() {
    var ball = this.ball;

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
      ball.bottom = this.gridY.width;
      ball.reflectY();
      this.gameOver();  // ゲームオーバー処理を呼び出す
    }
  },

  checkPaddleCollision: function() {
    var ball = this.ball;
  
    if (ball.hitTestElement(this.paddle)) {
      ball.bottom = this.paddle.top;
    
      var dx = ball.x - this.paddle.x;
      ball.direction.x = dx / (this.paddle.width / 2); // パドル全体の幅に基づいた反射角度の調整
      ball.direction.y = -Math.abs(ball.direction.x); // 反射角度を考慮してY方向の速度を調整
      ball.direction.normalize();
    
      this.ballSpeed = Math.min(this.ballSpeed + (0.1 * this.time / 1000), 20);
    }
  },

  checkBlockCollisions: function() {
    var ball = this.ball;
  
    this.group.children.clone().some(function(block) {
      if (ball.hitTestElement(block)) {
        this.handleBlockCollision(block);
        return true;
      }
    }, this);
  },

  handleBlockCollision: function(block) {
    var ball = this.ball;
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
  },

  gameClear: function() {
    this.clearFlag = true

    // 「Game Over」の表示
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
});

phina.define("GameOverScene", {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    // ゲームオーバー表示
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

  update: function(app) {
    if (app.keyboard.getKeyDown('space')) {
      this.exit();  // タイトルシーンに戻るか、再挑戦シーンに移動
    }
  },
});

phina.define("ClearScene", {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    // ゲームオーバー表示
    Label({
      text: 'Clear Over',
      fontSize: 64,
      fill: 'red',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    Label({
      text: 'Press Space to Retry',
      fontSize: 32,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() + 100);
  },

  update: function(app) {
    if (app.keyboard.getKeyDown('space')) {
      this.exit();  // タイトルシーンに戻るか、再挑戦シーンに移動
    }
  },
});

/*
 * ブロック
 */
phina.define('Block', {
  superClass: 'RectangleShape',

  init: function(angle) {
    this.superInit({
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      fill: 'hsl({0}, 80%, 60%)'.format(angle || 0),
      stroke: null,
      cornerRadius: 4,
    });
  },
});

/*
 * ボール
 */
phina.define('Ball', {
  superClass: 'CircleShape',

  init: function() {
    this.superInit({
      radius: BALL_RADIUS,
      fill: '#eee',
      stroke: null,
      cornerRadius: 8,
    });

    this.speed = 0;
    this.direction = Vector2(1, -1).normalize();
  },

  move: function() {
    this.x += this.direction.x;
    this.y += this.direction.y;
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
    this.speed = Math.min(this.speed + 0.5, 28); // 最大スピードを設定
  },
});

/*
 * パドル
 */
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

  // app.enableStats();
  app.run();
});
