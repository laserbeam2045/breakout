phina.globalize();

// 変数の定義
var SCREEN_WIDTH    = 640;
var SCREEN_HEIGHT   = 960;
var MAX_PER_LINE    = 25;
var BLOCK_NUM       = MAX_PER_LINE * 25;
var BLOCK_SIZE      = 21.5;
var BOARD_PADDING   = 50;
var PADDLE_WIDTH    = 150;
var PADDLE_HEIGHT   = 32;
var BALL_RADIUS     = 16;
var BALL_SPEED      = 16;  // ボールのスピードを少し上げる
var MAX_BALL_SPEED  = 24;
var BALL_NUMBER     = 5;  // ボールの数
var SPLIT_COUNT_A   = 3;  // 分裂する数
var SPLIT_COUNT_B   = 5;  // 分裂する数

var BOARD_SIZE      = SCREEN_WIDTH - BOARD_PADDING * 2;
var BOARD_OFFSET_X  = BOARD_PADDING + BLOCK_SIZE / 2;
var BOARD_OFFSET_Y  = 70;

phina.define("TitleScene", {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    // タイトル表示
    Label({
      text: '何の写真か当てるげーむ',
      fontSize: 50,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), 100);

    // ステージ選択のタイトル
    Label({
      text: 'ステージを選択してください',
      fontSize: 40,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(3));

    // ステージボタンの設定 (3列×4行で表示)
    const stages = 5;  // 12種類のステージ
    const buttonWidth = 180;
    const buttonHeight = 80;
    const buttonSpacingX = (SCREEN_WIDTH - buttonWidth * 3) / 4;  // 3列の間隔
    const buttonSpacingY = 120;  // 各行のボタン間隔

    // ボタンを配置する開始位置（少し上に配置）
    const startX = buttonSpacingX + buttonWidth / 2;
    const startY = 300;

    // ボタンの色を変化させるための色相の開始値と変化量
    const hueStart = 0;  // 色相の開始値 (赤)
    const hueStep = 30;  // 各ボタンごとに色相を30度ずつ変化させる

    for (let i = 0; i < stages; i++) {
      const col = i % 3;  // 列
      const row = Math.floor(i / 3);  // 行

      // 各ボタンに対して色相を少しずつ変更する (HSL形式)
      const hue = (hueStart + i * hueStep) % 360;  // 色相が360度を超えたらリセット
      const color = `hsl(${hue}, 80%, 70%)`;  // 彩度80%, 明度70%で色を設定

      Button({
        text: `ステージ ${i + 1}`,
        width: buttonWidth,
        height: buttonHeight,
        fontSize: 30,
        fill: color,  // 色を行ごとに変更
      })
      .addChildTo(this)
      .setPosition(startX + col * (buttonWidth + buttonSpacingX), startY + row * buttonSpacingY)
      .on('push', () => {
        this.exit('main', { stage: i + 1 });
      });
    }
  },
});

// phina.define("TitleScene", {
//   superClass: 'DisplayScene',

//   init: function(options) {
//     this.superInit(options);

//     Label({
//       text: 'Press Space to Start',
//       fontSize: 32,
//       fill: 'white',
//     }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() + 100);
//   },

//   update: function(app) {
//     this.on('pointend', () => {
//       this.exit('main');  // メインシーンに移動
//     });
//     if (app.keyboard.getKeyDown('space')) {
//       this.exit('main');  // メインシーンに移動
//     }
//   },
// });

phina.define("MainScene", {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    // ゲームオーバーフラグ
    this.isGameOver = false;

    // デバイスがPCかどうかを判定
    this.isPC = !phina.isMobile();

    // サウンドの読み込み
    this.blockBreakSound = AssetManager.get('sound', 'block_break');
    this.ballReturnSound = AssetManager.get('sound', 'ball_return');
    // this.BGM = AssetManager.get('sound', 'heaven_and_hell');

    // 制限時間（秒単位で設定）
    this.timeLimit = 60;  // 60秒の制限時間
    this.remainingTime = this.timeLimit;  // 残り時間を初期化

    // 制限時間表示用のラベルを左上に追加
    this.timeLabel = Label({
      text: 'Time: ' + this.remainingTime,
      fontSize: 30,
      fill: 'white',
      align: 'left',  // 左寄せ
    }).addChildTo(this).setPosition(20, 20);  // 画面左上に配置

    // ステージに応じた背景画像のみを設定
    let backgroundImage;
    if (options.stage === 1) {
      backgroundImage = 'background01';
    } else if (options.stage === 2) {
      backgroundImage = 'background02';
    } else if (options.stage === 3) {
      backgroundImage = 'background03';
    } else if (options.stage === 4) {
      backgroundImage = 'background04';
    } else if (options.stage === 5) {
      backgroundImage = 'background05';
    } else if (options.stage === 6) {
      backgroundImage = 'background06';
    } else if (options.stage === 7) {
      backgroundImage = 'background07';
    } else if (options.stage === 8) {
      backgroundImage = 'background08';
    } else if (options.stage === 9) {
      backgroundImage = 'background09';
    } else if (options.stage === 10) {
      backgroundImage = 'background10';
    } else if (options.stage === 11) {
      backgroundImage = 'background11';
    } else if (options.stage === 12) {
      backgroundImage = 'background12';
    }

    // 背景画像の上半分を表示
    this.backgroundSprite = Sprite(backgroundImage).addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center(-3) - 70) // 画面上部に配置
      .setSize(SCREEN_WIDTH - 100, SCREEN_HEIGHT / 2 - 150); // 高さを画面の半分に設定

    // ゲームの設定やスコア表示
    this.setupGame();
  },

  setupGame: function() {
    // ゲームの初期設定やオブジェクト配置などをここで行う
    this.score = 0;

    // this.scoreLabel = Label({
    //   text: 'Score: 0',
    //   fontSize: 40,
    //   fill: 'white',
    // }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(2));

    this.group = DisplayElement().addChildTo(this);
    var gridX = Grid(BOARD_SIZE, MAX_PER_LINE);
    var gridY = Grid(BOARD_SIZE, MAX_PER_LINE);

    this.createBlocks(gridX, gridY);

    this.remainingBlocks = BLOCK_NUM;

    // 残りブロック数の表示用ラベル
    this.remainingBlocksLabel = Label({
      text: 'Blocks: ' + this.remainingBlocks,
      fontSize: 30,
      fill: 'white',
      align: 'right',  // 右寄せ
    }).addChildTo(this).setPosition(SCREEN_WIDTH - 30, 20);  // 画面右上に配置

    // パドル、ボール、ブロックなどの設定
    this.paddle = Paddle().addChildTo(this);
    this.paddle.setPosition(this.gridX.center(), this.gridY.span(13)); // バーを少し上に移動
    this.paddle.prevX = this.paddle.x;  // 前フレームの位置を保持
    this.paddleSpeed = 0;  // パドルの速度

    // ボールを3つ作成
    this.balls = [];
    // for (let i = 0; i < BALL_NUMBER; i++) {
    //   let ball = Ball().addChildTo(this);
    //   ball.setPosition(this.paddle.x, this.paddle.top - ball.radius);  // バドルの上にボールを配置
    //   this.balls.push(ball);
    // }
    // ボールを上方向に斜めにタイミングをずらして発射
    this.createBallsWithDelay(3, 100);  // ボール20個を100msずつ遅らせて発射

    this.paddle.hold(this.balls[0]);

    this.gameStarted = false;
    this.on('pointend', this.startGame.bind(this));

    this.time = 0;
  },

  update: function(app) {
    this.time += app.deltaTime;

    if (this.isGameOver || this.clearFlag) {
      // if (this.isGameOver) {
      //   this.backgroundSprite.remove();
      // }
      this.on('pointend', () => {
        if (this.endFlag) this.exit('title');
        setTimeout(() => this.endFlag = true, 500);
      });
      if (app.keyboard.getKeyDown('space')) {
        this.exit('title');
      }
      return;
    }

    // ゲームが開始されていない間はボールをパドルに追従させる
    if (!this.gameStarted) {
      this.balls.forEach(ball => {
        ball.setPosition(this.paddle.x, this.paddle.top - 20);  // パドルにボールを追従させる
      });
    }

    if (this.gameStarted) {
      // 毎フレーム呼ばれる。制限時間のカウントダウンを処理
      this.remainingTime -= app.deltaTime / 1000;  // 残り時間を秒単位で減らす

      // 画面に制限時間を小数点以下1桁まで表示
      this.timeLabel.text = 'Time: ' + Math.max(0, this.remainingTime).toFixed(1);

      // 残り時間が0以下になったらゲームオーバー
      if (this.remainingTime <= 0) {
        this.gameOver();
      }
    }

    if (this.isGameOver || this.clearFlag) {
      // ゲームオーバーまたはクリア時にボールをすべて消去
      this.removeAllBalls();
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

      // パドルの速度を計算
      this.paddleSpeed = this.paddle.x - this.paddle.prevX;  // 前フレームからの移動距離で速度を計算
      this.paddle.prevX = this.paddle.x;  // 現在位置を次フレームに備えて保持
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

      // ボールを全て発射する（上方向に斜めに飛ばす）
      const angleRange = Math.PI / 3;  // 上方向の30度範囲で発射（約60度）
      for (let i = 0; i < this.balls.length; i++) {
        const ball = this.balls[i];
        const angle = -Math.PI / 2 + (i / (this.balls.length - 1)) * angleRange - angleRange / 2;  // -90度の範囲で調整
        ball.direction = Vector2(Math.cos(angle), Math.sin(angle)).normalize();  // 角度に基づいた方向ベクトル
        ball.speed = BALL_SPEED;  // ボールの速度を設定
      }

      // this.playBGM();
    }
  },

  // ボールを作成し、上方向に斜めにタイミングをずらして発射する
  createBallsWithDelay: function(count, delay) {
    const angleRange = Math.PI / 3;  // 上方向の30度範囲で発射（約60度）
    const centerX = this.paddle.x;
    const centerY = this.paddle.top - 20;  // パドルの上から少し離れた位置

    for (let i = 0; i < count; i++) {
      // タイミングをずらしてボールを発射
      setTimeout(() => {
        let ball = Ball().addChildTo(this);
        ball.setPosition(centerX, centerY);  // ボールをパドルの上に配置

        // ボールの進行方向を上方向に少しずつ角度をずらして設定
        const angle = -Math.PI / 2 + (i / (count - 1)) * angleRange - angleRange / 2;  // -90度の範囲で調整
        ball.direction = Vector2(Math.cos(angle), Math.sin(angle)).normalize();  // 角度に基づいた方向ベクトル
        ball.speed = BALL_SPEED;  // ボールの速度を設定

        this.balls.push(ball);  // ボールリストに追加
      }, i * delay);  // i * delay ミリ秒後に発射
    }
  },

  // ボールを全て消す関数
  removeAllBalls: function() {
    this.balls.forEach(ball => {
      ball.remove();  // シーンからボールを削除
    });
    this.balls = [];  // ボール配列を空にする
  },

  playBGM: function() {
    // BGMをSoundオブジェクトでロード
    this.bgm = Sound();
    // Audioオブジェクトを使ってBGMを再生
    this.bgm = new Audio('assets/heaven_and_hell.wav');
    this.bgm.volume = 0.33;  // 音量を50%に設定

    this.bgm.playbackRate = 1.5;  // 再生速度を1.2倍に設定
    this.bgm.currentTime = 10;
    this.bgm.play();  // BGMを再生
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
    let bonusCount = 0;
    const bonusMaxCount = 21;

    (BLOCK_NUM).times(function(i) {
      var xIndex = i % MAX_PER_LINE;
      var yIndex = Math.floor(i / MAX_PER_LINE);
      var colorAngle = (360 / BLOCK_NUM) * i;

      // 低確率でボーナスブロック（5%の確率）
      const isBonusBlock = bonusCount < bonusMaxCount && Math.random() < 0.01 && (bonusCount += 1);

      if (isBonusBlock) {
        block = BonusBlock().addChildTo(this.group).setPosition(
          gridX.span(xIndex) + BOARD_OFFSET_X,
          gridY.span(yIndex) + BOARD_OFFSET_Y
        );
      } else {
        block = Block(colorAngle).addChildTo(this.group).setPosition(
          gridX.span(xIndex) + BOARD_OFFSET_X,
          gridY.span(yIndex) + BOARD_OFFSET_Y
        );
      }
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

      // パドルの速度に基づいてスピンを加える
      const spinFactor = 0.1;  // スピンの強さを調整する係数
      ball.direction.x += this.paddleSpeed * spinFactor;  // パドルの速度に応じてボールのX方向のスピンを加える

      // ボールの速度を保つために正規化
      ball.direction.normalize();

      // サウンドをプレイ
      // this.ballReturnSound.play();
  
      // ボールが1つだけの場合に分裂させる
      if (this.balls.length === 1 && Math.random() < 1.0) {
        this.splitBall(ball, SPLIT_COUNT_A);
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

    // 残りブロック数を減らす
    this.remainingBlocks--;

    // ラベルを更新
    this.remainingBlocksLabel.text = 'Blocks: ' + this.remainingBlocks;

    // ボーナスブロックだった場合、ボールを100個に分裂
    if (block.isBonusBlock) {
      this.splitBall(ball, SPLIT_COUNT_B);
    }

    // スコアを加算 (例えばブロック1つあたり100点)
    this.score += 100;

    // サウンドを再生
    this.blockBreakSound.play();
  
    // ボールが1つだけの場合に分裂させる
    if (this.balls.length === 1 && Math.random() < 1.0) {
      this.splitBall(ball, SPLIT_COUNT_A);
    }
  },

  // ボールを指定した数に分裂させる関数
  splitBall: function(originalBall, count) {
    for (let i = 0; i < count; i++) {
      let newBall = Ball().addChildTo(this);
      newBall.setPosition(originalBall.x, originalBall.y);

      // 角度をランダムに設定して射出
      newBall.direction = Vector2(Math.random() * 2 - 1, -1).normalize();

      this.balls.push(newBall);  // 新しいボールをボールリストに追加
    }
  },

  gameClear: function() {
    this.clearFlag = true;
    this.removeAllBalls();

    Label({
      text: 'Game Clear!\nScore: ' + this.score,
      fontSize: 64,
      fill: 'skyblue',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    Label({
      text: 'Press Space to Retry',
      fontSize: 32,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() + 100);
  },

  gameOver: function() {
    this.isGameOver = true;
    // this.bgm.pause();  // BGMを停止

    Label({
      text: 'Game Over\nScore: ' + this.score,
      fontSize: 64,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    Label({
      text: 'Press Space to Retry',
      fontSize: 32,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() + 100);
  },
});

// 通常のブロック
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
    this.isBonusBlock = false;  // 通常のブロックはボーナスブロックではない
  },
});

// ボーナスブロック（低確率で出現）
phina.define('BonusBlock', {
  superClass: 'RectangleShape',

  init: function() {
    this.superInit({
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      fill: 'gold',  // 金色のボーナスブロック
      stroke: null,
      cornerRadius: 3,
    });
    this.isBonusBlock = true;  // ボーナスブロックであることを示す
  },
});

phina.define('Ball', {
  superClass: 'CircleShape',

  init: function() {
    this.superInit({
      radius: BALL_RADIUS,
      fill: 'white',
      stroke: null,
    });

    this.speed = BALL_SPEED;  // 初期スピードを定義
    this.direction = Vector2(1, -1).normalize();
  },

  // 内側に影を描画するためのカスタム描画
  draw: function(canvas) {
    var ctx = canvas.context;

    // グラデーションの作成 (内側から外側に向けて影)
    var gradient = ctx.createRadialGradient(0, 0, this.radius * 0.1, 0, 0, this.radius);
    gradient.addColorStop(0, 'white');  // 中心は白
    gradient.addColorStop(1, '#ccc');   // 外側はグレー (影っぽく見せる)

    // グラデーションで塗りつぶし
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
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
    this.speed = Math.min(this.speed + 0.1, MAX_BALL_SPEED);  // 最大スピードを設定
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
      // image: {
      //   'background01': 'https://amanaimages.com/pickup/img/historicalfigures/bnr_kagaku_GRA6070701900M.jpg',
      //   'background02': 'https://amanaimages.com/pickup/img/historicalfigures/bnr_TOP6051300000M.jpg',
      //   'background03': 'https://amanaimages.com/pickup/img/historicalfigures/bnr_painter_BMN7062200002M.jpg',
      //   'background04': 'https://p.potaufeu.asahi.com/d473-p/picture/27390318/13b16927a46a8b6f7380262da5ec9957_640px.jpg',
      //   'background05': 'https://p.potaufeu.asahi.com/599f-p/picture/27390317/3dc18d38ffe4d63531a93868d68ab0f0_640px.jpg',
      //   'background06': 'https://yuraku-group.jp/wp-content/uploads/2021/08/2021.08.20_shinden_blog_2.jpg',
      //   'background07': 'https://p.potaufeu.asahi.com/db98-p/picture/26727803/9c47f9cf8fe6ba7683abf0f26355cfe4_640px.jpg',
      //   'background08': 'https://jprime.ismcdn.jp/mwimgs/b/a/620mw/img_badbd8482db20075cf5e713a3493301b1755033.png',
      //   'background09': 'https://jprime.ismcdn.jp/mwimgs/7/9/620mw/img_797f78fe641735b2a478271b2638d6d81978401.png',
      //   'background10': 'https://renote.net/files/blobs/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NzQ1MDM3MiwicHVyIjoiYmxvYl9pZCJ9fQ==--ee97d92891c4bad1ab1f1deeaa0bcd5e82e6eeda/7bc70217.jpg',
      //   'background11': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Raffael_058.jpg/400px-Raffael_058.jpg',
      //   'background12': 'https://qdojo.jp/wp-content/uploads/2021/06/movie-141-thumbnail.webp',
      // },
      image: {
        'background01': './assets/image01.png?version=0.1',
        'background02': './assets/image02.png',
        'background03': './assets/image03.png',
        'background04': './assets/image04.png',
        'background05': './assets/image05.png',
        'background06': 'https://pbs.twimg.com/media/FbeRJM9VsAEw4tS.jpg',
        'background07': 'https://p.potaufeu.asahi.com/db98-p/picture/26727803/9c47f9cf8fe6ba7683abf0f26355cfe4_640px.jpg',
        'background08': 'https://jprime.ismcdn.jp/mwimgs/b/a/620mw/img_badbd8482db20075cf5e713a3493301b1755033.png',
        'background09': 'https://jprime.ismcdn.jp/mwimgs/7/9/620mw/img_797f78fe641735b2a478271b2638d6d81978401.png',
        'background10': 'https://renote.net/files/blobs/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NzQ1MDM3MiwicHVyIjoiYmxvYl9pZCJ9fQ==--ee97d92891c4bad1ab1f1deeaa0bcd5e82e6eeda/7bc70217.jpg',
        'background11': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Raffael_058.jpg/400px-Raffael_058.jpg',
        'background12': 'https://qdojo.jp/wp-content/uploads/2021/06/movie-141-thumbnail.webp',
      },
      sound: {
        'block_break': 'assets/block_break.mp3',  // サウンドファイルのパス
        'ball_return': 'assets/ball_return.mp3',  // サウンドファイルのパス
        // 'heaven_and_hell': 'assets/heaven_and_hell.wav',  // サウンドファイルのパス
      },
    },
  });

  app.run();
});
