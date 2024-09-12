import { config } from '../config.js?version=1.1.1';
import { assets } from '../assets.js';

phina.define("MainScene", {
  superClass: 'BaseScene',

  init: function(options) {
    this.superInit(options);

    this.stage = options.stage

    // 背景画像の上半分を表示
    this.backgroundSprite = Sprite(`background0${options.stage}`).addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center(-3) - 70)
      .setSize(config.screen.width - 100, config.screen.height / 2 - 150);

    // 制限時間（秒単位で設定）
    this.timeLimit = config.scene.main.timeLimit;
    this.remainingTime = this.timeLimit;  // 残り時間を初期化

    // 制限時間表示用のラベルを左上に追加
    this.timeLabel = Label({
      text: 'Time: ' + this.remainingTime,
      fontSize: 30,
      fill: 'white',
      align: 'left',  // 左寄せ
    }).addChildTo(this).setPosition(20, 30);  // 画面左上に配置

    // ゲームの設定やスコア表示
    this.setupGame();
  },

  setupGame: function() {
    // ゲームの初期設定やオブジェクト配置などをここで行う
    this.score = 0;

    this.group = DisplayElement().addChildTo(this);
    var gridX = Grid(config.screen.width - config.scene.main.padding * 2, config.scene.main.block.cols * this.stage);
    var gridY = Grid(config.screen.width - config.scene.main.padding * 2, config.scene.main.block.rows * this.stage);

    this.createBlocks(gridX, gridY);

    // パドル、ボール、ブロックなどの設定
    this.paddle = Paddle().addChildTo(this);
    this.paddle.setPosition(this.gridX.center(), this.gridY.span(13)); // バーを少し上に移動
    this.paddle.prevX = this.paddle.x;  // 前フレームの位置を保持
    this.paddleSpeed = 0;  // パドルの速度

    // ボールを3つ作成
    this.balls = [];
    this.createBallsWithDelay(3, 100);  // ボール20個を100msずつ遅らせて発射

    this.paddle.hold(this.balls[0]);

    // 残りブロック数の表示用ラベル
    this.remainingBlocksLabel = Label({
      text: `Blocks: ${this.blocks.children.length}`,
      fontSize: 30,
      fill: 'white',
      align: 'right',  // 右寄せ
    }).addChildTo(this).setPosition(config.screen.width - 30, 30);  // 画面右上に配置

    this.isGameStarted = false;
    this.on('pointend', this.startGame.bind(this));

    this.time = 0;
  },

  update: function(app) {
    if (app.isShaking) return;

    this.time += app.deltaTime;

    this.remainingBlocksLabel.text = `Blocks: ${this.blocks.children.length}`

    if (this.isGameOver || this.clearFlag) {
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
    if (!this.isGameStarted) {
      this.balls.forEach(ball => {
        ball.setPosition(this.paddle.x, this.paddle.top - 20);  // パドルにボールを追従させる
      });
    }

    if (this.isGameStarted) {
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

    if (!this.isGameStarted && app.keyboard.getKeyDown('space')) {
      this.startGame();
    }

    if (this.isGameStarted) {
      this.balls.forEach(ball => {
        ball.move();
        this.checkCollisions(ball);
        this.adjustBallAngle(ball);
      });

      // パドルの速度を計算
      this.paddleSpeed = this.paddle.x - this.paddle.prevX;  // 前フレームからの移動距離で速度を計算
      this.paddle.prevX = this.paddle.x;  // 現在位置を次フレームに備えて保持
    }

    // 色付きボールを最後に表示するために再配置
    this.balls.forEach(ball => {
      if (ball.isGolden || ball.isPurple) {
        ball.remove();  // 一度削除して
        ball.addChildTo(this);  // 最後に再追加
      }
    });

    if (this.isPC) {
      this.movePaddleWithKeyboard(app.keyboard);
    } else {
      this.movePaddle(app.pointer);
    }

    if (this.blocks.children.length <= 0) {
      this.gameClear();
    }
  },
});

phina.main(function() {
  var app = GameApp({
    title: 'Breakout',
    startLabel: 'title',  // タイトルシーンから開始
    width: config.screen.width,
    height: config.screen.height,
    backgroundColor: '#444',
    autoPause: true,
    debug: false,
    assets,
    // シーンを明示的に登録
    scenes: [
      { label: 'title', className: 'TitleScene' },
      { label: 'main', className: 'MainScene' },
      { label: 'boss', className: 'BossScene' },
      { label: 'stop', className: 'StopScene' },
    ],
  });

  app.run();
});
