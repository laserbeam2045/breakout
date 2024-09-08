phina.globalize();

// 変数の定義
var SCREEN_WIDTH    = 640;
var SCREEN_HEIGHT   = 1024;
var MAX_PER_LINE    = 20;
var BLOCK_NUM       = MAX_PER_LINE * 20;
var BLOCK_SIZE      = 26.75;
var BOARD_PADDING   = 50;
var PADDLE_WIDTH    = 150;
var PADDLE_HEIGHT   = 32;
var BALL_RADIUS     = 14;
var BALL_SPEED      = 12;  // ボールのスピードを少し上げる
var MAX_BALL_SPEED  = 24;
var BALL_NUMBER     = 5;  // ボールの数
var SPLIT_COUNT_A   = 3;  // 分裂する数
var SPLIT_COUNT_B   = 3;  // 分裂する数
var TIME_LIMIT      = 40; // 制限時間

var BOARD_SIZE      = SCREEN_WIDTH - BOARD_PADDING * 2;
var BOARD_OFFSET_X  = BOARD_PADDING + BLOCK_SIZE / 2;
var BOARD_OFFSET_Y  = 70;

// アセットの定義を1回で行う
const assets = {
  image: {
    // エジソン
    'background01': 'https://amanaimages.com/pickup/img/historicalfigures/bnr_kagaku_GRA6070701900M.jpg',
    // モーツァルト
    'background02': 'https://cdn-blob.austria.info/cms-uploads-prod/default/0002/92/thumb_191548_default_header_big.jpeg',
    // 大谷翔平
    'background03': 'https://p.potaufeu.asahi.com/d473-p/picture/27390318/13b16927a46a8b6f7380262da5ec9957_640px.jpg',
    // ピカソ
    'background04': 'https://cdn.shopify.com/s/files/1/0554/9057/6433/files/e8131b5f33b316a85a80c11dd0872991_480x480.jpg?v=1713847065',
    // 藤井聡太
    'background05': 'https://cdn.mainichi.jp/vol1/2023/05/23/20230523mpj00m040014000p/9.jpg?1',
    // アインシュタイン
    'background06': 'https://i.ytimg.com/vi/YX72DdfSdMU/maxresdefault.jpg',
    // 宇宙
    'background': 'https://preview.redd.it/29zh4v56mo951.jpg?width=640&crop=smart&auto=webp&s=0f3122b8c447cd88c90e825f31f7737c06538693',
    // ドラゴン
    'dragon': './assets/dragon.png',
  },
  sound: {
    'block_break': 'assets/block_break.mp3',  // サウンドファイルのパス
    'paddle_reflect': 'assets/打撃3.mp3',  // サウンドファイルのパス
    'clear_sound': 'assets/シャキーン3.mp3',  // サウンドファイルのパス
    'decision_sound': 'assets/決定ボタンを押す23.mp3',  // サウンドファイルのパス
    'failed_sound': 'assets/データ表示1.mp3',  // サウンドファイルのパス
    'cursor_sound': 'assets/カーソル移動4.mp3',  // サウンドファイルのパス
    'attack_sound': 'assets/重いパンチ1.mp3',  // サウンドファイルのパス
    // 'ball_return': 'assets/ball_return.mp3',  // サウンドファイルのパス
    // 'heaven_and_hell': 'assets/heaven_and_hell.wav',  // サウンドファイルのパス
  },
  spritesheet: {
    'dragon_ss': {
      "frame": {
        "width": 191,  // 各フレームの幅
        "height": 161, // 各フレームの高さ
        "cols": 3,    // スプライトシートの列数
        "rows": 4,    // スプライトシートの行数
      },
      "animations": {
        "fly1": {
          "frames": [0, 1, 2],
          "next": "fly1",
          "frequency": 4,
        },
        "fly2": {
          "frames": [3, 4, 5],
          "next": "fly2",
          "frequency": 4,
        },
        "fly3": {
          "frames": [6, 7, 8],
          "next": "fly3",
          "frequency": 4,
        },
        "fly4": {
          "frames": [9, 10, 11],
          "next": "fly4",
          "frequency": 4,
        },
      },
    },
  },
};

// ステージ数を画像の数に応じて設定
const stageCount = Object.keys(assets.image).length - 2;

phina.define('AllScene', {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    this.backgroundImage = Sprite('background')
    .addChildTo(this)
    .setSize(SCREEN_WIDTH + 200, SCREEN_HEIGHT + 200)
    .setPosition(SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2 - 100);
  },
});

phina.define("TitleScene", {
  superClass: 'AllScene',

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

    this.decisionSound = AssetManager.get('sound', 'decision_sound');

    for (let i = 0; i < stageCount; i++) {
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
        this.decisionSound.play();
        this.exit('main', { stage: i + 1 });
      });

      // ステージ7を選択した場合にStage7Sceneに遷移
      Button({
        text: 'ドラゴン',
        width: 200,
        height: 80,
      })
      .addChildTo(this)
      .setPosition(startX + 1 * (buttonWidth + buttonSpacingX), startY + 2 * buttonSpacingY)
      .on('push', () => {
        this.decisionSound.play();
        this.exit('BossScene');  // Stage7Sceneへ遷移
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

phina.define('BaseGameScene', {
  superClass: 'AllScene',

  init: function() {
    this.superInit();

    // ゲーム開始・終了フラグ
    this.gameStarted = false;
    this.isGameOver = false;

    // デバイスがPCかどうかを判定
    this.isPC = !phina.isMobile();

    // サウンドの読み込み
    this.blockBreakSound = AssetManager.get('sound', 'block_break');
    this.paddleReflectSound = AssetManager.get('sound', 'paddle_reflect');
    this.clearSound = AssetManager.get('sound', 'clear_sound');
    this.failedSound = AssetManager.get('sound', 'failed_sound');
    this.cursorSound = AssetManager.get('sound', 'cursor_sound');
    this.attackSound = AssetManager.get('sound', 'attack_sound');
    this.attackSound.volume = 0.25;
  },

  update: function(app) {
    // console.log(app)
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
        const isGolden = i === 0 && count === SPLIT_COUNT_A;
        let ball = Ball(isGolden).addChildTo(this);
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

  // playBGM: function() {
  //   // BGMをSoundオブジェクトでロード
  //   this.bgm = Sound();
  //   // Audioオブジェクトを使ってBGMを再生
  //   this.bgm = new Audio('assets/heaven_and_hell.wav');
  //   this.bgm.volume = 0.33;  // 音量を50%に設定

  //   this.bgm.playbackRate = 1.5;  // 再生速度を1.2倍に設定
  //   this.bgm.currentTime = 10;
  //   this.bgm.play();  // BGMを再生
  // },

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
      // const isBonusBlock = bonusCount < bonusMaxCount && Math.random() < 0.01 && (bonusCount += 1);
      const isBonusBlock = false;

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
    if (this.isStopped) return;

    if (ball.hitTestElement(this.paddle)) {
      // パドルの上に当たった場合
      if (ball.x >= this.paddle.left && ball.x <= this.paddle.right) {
        if (ball.bottom >= this.paddle.top) {
          // ボールの下側をパドルの上に移動させる
          ball.bottom = this.paddle.top;
          // X方向の反射（左右反転）
          ball.reflectY();  // Y方向の反射

          // パドルの速度に基づいてスピンを加える
          const spinFactor = 0.1;  // スピンの強さを調整する係数
          ball.direction.x += this.paddleSpeed * spinFactor;  // パドルの速度に応じてボールのX方向のスピンを加える

          // ボールの速度を保つために正規化
          ball.direction.normalize();

          // 金色のボールの場合は再度分裂
          if (ball.isGolden) {
            // ball.isGolden = false;
            this.cursorSound.play();
            this.splitBall(ball, SPLIT_COUNT_A);  // 金色のボールが再度3つに分裂
          }

          // 紫色のボールの場合は再度分裂
          if (ball.isPurple) {
            this.pauseBallAndShake(ball);
          }

          // ボールが1つだけの場合に分裂させる
          if (this.balls.length === 1 && Math.random() < 1.0) {
            this.splitBall(ball, SPLIT_COUNT_A);
          }
        }
      }
      // // ボールの側面がパドルの側面に当たった場合
      // else if (!ball.isFallen) {
      //   console.log(ball)
      //   // X方向の反射のみを行う
      //   // ball.reflectX();
      //   ball.isFallen = true;
      //   ball.isGolden = false;
      //   ball.isPurple = false;
      // }
    }
  },

  pauseBallAndShake: function(ball) {
    const scene = this;
    scene.isStopped = true;
  
    // ボールの状態を保存する配列
    const originalStates = [];
  
    // すべてのボールの位置、速度、方向を一時的に保存し、ボールを止める
    if (scene.balls && scene.balls.length > 0) {  // ballsが存在し、要素があることを確認
      scene.balls.forEach(ball => {
        originalStates.push({
          x: ball.x,  // 元のX位置
          y: ball.y,  // 元のY位置
          speed: ball.speed,  // 元の速度
          direction: ball.direction.clone(),  // 元の進行方向
        });
  
        // ボールの移動を完全に停止
        ball.speed = 0;
        ball.direction.set(0, 0);  // 移動方向もリセット
      });
  
      // 画面を震動させる
      scene.children.forEach(element => this.shakeElement(element));

      // 一定時間後にすべてのボールの状態を元に戻す
      setTimeout(() => {
        scene.balls.forEach((ball, index) => {
          // 元の状態を復元
          const state = originalStates[index];
          if (!state) return;
          ball.x = state.x;  // 元の位置に戻す
          ball.y = state.y;
          ball.speed = state.speed;  // 元の速度に戻す
          ball.direction = state.direction;  // 元の方向に戻す
        });
        this.splitBall(ball, 10);
        ball.isPurple = false;
        scene.isStopped = false;
        this.paddleReflectSound.play();
      }, 150);
    } else {
      console.error('No balls found or balls array is undefined.');
    }
  },
  
  // 特定の要素を震動させる関数
  shakeElement: function(element) {
    const originalPosition = { x: element.x, y: element.y };  // 元の位置を保存
    let shakeDuration = 150;  // 震動時間
    let shakeStrength = 10;   // 震動の強さ
    let startTime = Date.now();  // 開始時刻

    const shake = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < shakeDuration) {
        // ランダムに要素をシェイク
        let shakeX = (Math.random() - 0.5) * shakeStrength;
        let shakeY = (Math.random() - 0.5) * shakeStrength;
  
        // 要素の位置をシェイク
        element.x = originalPosition.x + shakeX;
        element.y = originalPosition.y + shakeY;
  
        // 次のフレームで再度シェイクを呼び出す
        requestAnimationFrame(shake);
      } else {
        // シェイク終了後、位置を元に戻す
        element.x = originalPosition.x;
        element.y = originalPosition.y;
      }
    };
  
    // シェイクを開始
    shake();
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
  
    // if (!ball.isGolden) {
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
    // }
  
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

  hasGoldenBall: function() {
    return this.balls.some(ball => ball.isGolden)
  },

  hasPurpleBall: function() {
    return this.balls.some(ball => ball.isPurple)
  },

  // ボールを指定した数に分裂させる関数
  splitBall: function(originalBall, count) {
    const goldenBallIndex = Math.floor(Math.random() * (count - 1))
    for (let i = 0; i < count - 1; i++) {
      const isGolden = i === goldenBallIndex && !this.hasGoldenBall();
      const isPurple = !isGolden && count === SPLIT_COUNT_A && !this.hasPurpleBall() && Math.random() < 1;
      let newBall = Ball(isGolden, isPurple).addChildTo(this);
      newBall.setPosition(originalBall.x, originalBall.y);

      // ランダムな角度で射出
      newBall.direction = Vector2(Math.random() * 2 - 1, -1).normalize();
      this.balls.push(newBall);
    }
  },

  gameClear: function() {
    this.clearFlag = true;
    this.removeAllBalls();
    this.clearSound.play();

    this.score += Math.floor(this.remainingTime * 100);

    Label({
      text: 'Game Clear!\n' + (this.score ? 'Score: ' + this.score : ''),
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
    this.failedSound.play();

    this.score += Math.floor(this.remainingTime * 100);

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

phina.define("MainScene", {
  superClass: 'BaseGameScene',

  init: function(options) {
    this.superInit(options);

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

    // this.backgroundImage = Sprite('background').addChildTo(this).setPosition(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2).setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    // 背景画像の上半分を表示
    this.backgroundSprite = Sprite(backgroundImage).addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center(-3) - 70) // 画面上部に配置
      .setSize(SCREEN_WIDTH - 100, SCREEN_HEIGHT / 2 - 150); // 高さを画面の半分に設定

    // 制限時間（秒単位で設定）
    this.timeLimit = TIME_LIMIT;
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
    }).addChildTo(this).setPosition(SCREEN_WIDTH - 30, 30);  // 画面右上に配置

    // パドル、ボール、ブロックなどの設定
    this.paddle = Paddle().addChildTo(this);
    this.paddle.setPosition(this.gridX.center(), this.gridY.span(13)); // バーを少し上に移動
    this.paddle.prevX = this.paddle.x;  // 前フレームの位置を保持
    this.paddleSpeed = 0;  // パドルの速度

    // ボールを3つ作成
    this.balls = [];
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

    if (this.group.children.length <= 0) {
      this.gameClear();
    }
  },
});

phina.define('BossScene', {
  superClass: 'BaseGameScene',

  init: function(options) {
    this.superInit(options);
    this.setupGame();
    this.soundCooldown = false;  // サウンド再生クールダウンフラグ
    this.soundCooldownDuration = 100;  // サウンドが鳴った後に再度鳴るまでの待機時間（ミリ秒）
  },

  setupGame: function() {
    // ゲームの初期設定やオブジェクト配置などをここで行う

    // ドラゴンの初期化
    this.dragon = Dragon().addChildTo(this);
    this.dragon
      .setSize(256, 256)
      .setPosition(this.gridX.center(), this.gridY.span(5));  // ドラゴンの位置調整

    // ドラゴンのHP
    this.dragonHP = 20000;  // 初期HP
    this.maxDragonHP = this.dragonHP;  // 最大HP

    // HPバーの背景（薄い灰色）
    this.hpGaugeBackground = RectangleShape({
      width: 600,
      height: 20,
      fill: '#eee',  // 背景は薄い灰色
      stroke: null,
      cornerRadius: 10,
      originX: 0,  // 左端を固定
    }).addChildTo(this).setPosition(20, this.gridY.span(1));

    // HPゲージ（動的に減少する部分、初期は緑）
    this.hpGauge = RectangleShape({
      width: 600,
      height: 20,
      fill: 'green',  // 初期は緑
      stroke: null,
      cornerRadius: 10,
      originX: 0,  // 左端を固定
    }).addChildTo(this).setPosition(20, this.gridY.span(1));  // 左端に固定

    // HP表示用のラベル（数値）
    this.hpLabel = Label({
      text: `Dragon HP: ${this.dragonHP}`,
      fontSize: 24,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(2));

    this.score = 0;

    this.group = DisplayElement().addChildTo(this);

    // パドル、ボール、ブロックなどの設定
    this.paddle = Paddle().addChildTo(this);
    this.paddle.setPosition(this.gridX.center(), this.gridY.span(13)); // バーを少し上に移動
    this.paddle.prevX = this.paddle.x;  // 前フレームの位置を保持
    this.paddleSpeed = 0;  // パドルの速度

    // ボールを3つ作成
    this.balls = [];
    this.createBallsWithDelay(3, 100);  // ボール20個を100msずつ遅らせて発射

    this.paddle.hold(this.balls[0]);

    this.gameStarted = false;
    this.on('pointend', this.startGame.bind(this));

    this.time = 0;
  },

  update: function(app) {
    // 共通の操作を実行
    this.superMethod('update', app);
    // 各ボールに対してドラゴンとの衝突判定を実行
    this.balls.forEach(ball => {
      this.checkDragonCollision(ball);
    });

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
      // this.timeLabel.text = 'Time: ' + Math.max(0, this.remainingTime).toFixed(1);

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

    if (this.dragonHP < 0) this.dragonHP = 0;

    // ドラゴンのHP表示を更新
    this.hpLabel.text = `Dragon HP: ${this.dragonHP}`;

    // HPゲージの幅と色を更新
    this.hpGauge.width = (this.dragonHP / this.maxDragonHP) * 600;  // HPに比例してゲージの幅を調整
    this.hpGauge.fill = this.getHpColor(this.dragonHP / this.maxDragonHP);  // HPに応じて色を変更

    // ドラゴンの向きをHPの割合に応じて変更
    // const hpPercentage = this.dragonHP / this.maxDragonHP;
    // if (hpPercentage > 0.75) {
    //   if (this.dragon.direction !== 'up') this.dragon.fly1();  // HPが75%以上
    // } else if (hpPercentage > 0.5) {
    //   if (this.dragon.direction !== 'up') this.dragon.fly2();  // HPが50%以上
    // } else if (hpPercentage > 0.25) {
    //   if (this.dragon.direction !== 'up') this.dragon.fly4();  // HPが25%以上
    // } else if (hpPercentage <= 0.25) {
    //   if (this.dragon.direction !== 'up') this.dragon.fly3();  // HPが25%未満
    // }

    // ドラゴンのHPが0になったらゲームクリア
    if (this.dragonHP <= 0) {
      this.dragon.remove();
      this.hpGauge.remove();
      this.gameClear();
    }
  },

  // HPに応じたゲージの色を取得する関数（緑から赤に変化）
  getHpColor: function(percentage) {
    if (percentage > 0.5) {
      return 'green';  // HPが50%以上なら緑
    } else if (percentage > 0.2) {
      return 'yellow';  // HPが20%から50%なら黄色
    } else {
      return 'red';  // HPが20%以下なら赤
    }
  },

  // ドラゴンとの衝突判定
  checkDragonCollision: function(ball) {
    if (ball.hitTestElement(this.dragon)) {
      // ボールがドラゴンに当たった際の反射処理
      ball.reflectY();

      if (!this.soundCooldown) {
        this.soundCooldown = true;
        setTimeout(() => {
          this.soundCooldown = false;  // 一定時間後に再びサウンドを再生可能にする
        }, this.soundCooldownDuration);
        this.attackSound.play();
      }

      // ドラゴンのHPを減少
      this.dragonHP -= 10;
      this.hpLabel.text = `Dragon HP: ${this.dragonHP}`;

      // ボールの分裂処理
      if (this.balls.length === 1) {
        this.splitBall(ball, SPLIT_COUNT_A);
      }

      // ドラゴンが倒れたらゲームクリア
      if (this.dragonHP <= 0) {
        this.dragon.fly1();  // ドラゴンの死亡アニメーションを再生
        setTimeout(() => {
          this.exit('title');  // 次のシーンに遷移
        }, 5000);
      }
    }
  },

  // ボールを分裂させる関数（紫色のボールを含む）
  splitBall: function(originalBall, count) {
    const angleRange = Math.PI / 3;  // 上方向の30度範囲で発射（約60度）
    const centerX = originalBall.x;
    const centerY = originalBall.y;

    for (let i = 0; i < count; i++) {
      const isGolden = this.balls.length === 1;
      const isPurple = originalBall.isGolden && !this.hasPurpleBall() && Math.random() < 1.0;
      const ball = Ball(isGolden, isPurple).addChildTo(this);
      ball.setPosition(centerX, centerY);

      // ボールの進行方向を上方向に少しずつ角度をずらして設定
      const angle = -Math.PI / 2 + (i / (count - 1)) * angleRange - angleRange / 2;  // -90度の範囲で調整
      ball.direction = Vector2(Math.cos(angle), Math.sin(angle)).normalize();  // 角度に基づいた方向ベクトル
      ball.speed = BALL_SPEED;  // ボールの速度を設定

      this.balls.push(ball);  // ボールリストに追加
    }
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

  init: function(isGolden, isPurple = false) {
    this.superInit({
      radius: BALL_RADIUS,
      fill: isGolden ? 'gold' : isPurple ? 'purple' : 'white',  // 金色のボールかどうかで色を変える
      stroke: null,
    });

    this.speed = BALL_SPEED;
    this.isFallen = false;
    this.direction = Vector2(1, -1).normalize();
    this.isGolden = isGolden || false;  // 金色かどうかのフラグ
    this.isPurple = isPurple || false;  // 金色かどうかのフラグ

    // 色付きのボールは常に最前面に表示されるように zIndex を設定
    if (this.isGolden || this.isPurple) {
      this.zIndex = 100;  // 高い値に設定
    } else {
      this.zIndex = 1;  // 通常のボール
    }
  },

  // update: function() {
  //   if (this.paddle && this.bottom > this.paddle.bottom) {
  //     ball.isFallen = true;
  //     ball.isGolden = false;
  //     ball.isPurple = false;
  //   }
  // },

  // 内側に影を描画するためのカスタム描画
  draw: function(canvas) {
    var ctx = canvas.context;

    // グラデーションの作成 (内側から外側に向けて影)
    var gradient = ctx.createRadialGradient(0, 0, this.radius * 0.1, 0, 0, this.radius);
    gradient.addColorStop(0, this.isGolden ? 'gold' : this.isPurple ? 'purple' : 'white');  // 中心は白
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
    const newSpeed = Math.min(this.speed + 0.5, MAX_BALL_SPEED);  // 最大スピードを設定
    this.speed = newSpeed;
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

phina.define('Dragon', {
  superClass: 'Sprite',

  init: function() {
    this.superInit('dragon');
    this.setOrigin(0.5, 0.5);
    this.scaleX = 2;
    this.scaleY = 2;
    this.direction = 'up';  // 初期方向
    this.speed = 3;  // 移動速度を設定
    this.changeDirectionTime = 0;  // ランダムに方向を変更するためのタイマー
    this.randomChangeInterval = 2000;  // ランダムに方向を変える間隔（ミリ秒）
    
    // スプライトシートのアニメーション設定
    this.anim = FrameAnimation('dragon_ss').attachTo(this);
    this.fly1();
  },

  update: function(app) {
    // ランダムな方向転換の処理
    this.changeDirectionTime += app.deltaTime;
    if (this.changeDirectionTime > this.randomChangeInterval) {
      this.changeDirectionRandomly();  // ランダムな方向転換
      this.changeDirectionTime = 0;  // タイマーをリセット
    }

    // 現在の方向に応じて移動と方向変更を処理
    switch (this.direction) {
      case 'right':
        this.moveRight();
        break;
      case 'left':
        this.moveLeft();
        break;
      case 'up':
        this.moveUp();
        break;
      case 'down':
        this.moveDown();
        break;
    }

    // 端に到達したら方向を変える
    this.checkBoundaries();
  },

  // 端に到達したかどうかをチェックし、方向を変える
  checkBoundaries: function() {
    if (this.x >= SCREEN_WIDTH - this.width / 2) {
      this.direction = 'left';  // 右端に到達したら左に移動
      this.fly4();  // 左向きのアニメーションに変更
    }
    if (this.x <= this.width / 2) {
      this.direction = 'right';  // 左端に到達したら右に移動
      this.fly2();  // 右向きのアニメーションに変更
    }
    if (this.y >= SCREEN_HEIGHT - this.height / 3) {
      this.direction = 'up';  // 下端に到達したら上に移動
      this.fly1();  // 上向きのアニメーションに変更
    }
    if (this.y <= this.height / 2) {
      this.direction = 'down';  // 上端に到達したら下に移動
      this.fly3();  // 下向きのアニメーションに変更
    }
  },

  // ランダムに方向を変える関数
  changeDirectionRandomly: function() {
    const directions = ['right', 'left', 'up', 'down'];
    const randomIndex = Math.floor(Math.random() * directions.length);  // ランダムに方向を選択
    this.direction = directions[randomIndex];

    // 選ばれた方向に応じたアニメーションを再生
    switch (this.direction) {
      case 'right':
        this.fly2();
        break;
      case 'left':
        this.fly4();
        break;
      case 'up':
        this.fly1();
        break;
      case 'down':
        this.fly3();
        break;
    }
  },

  // 上に移動するアニメーション
  fly1: function() {
    this.direction = 'up';
    this.anim.gotoAndPlay('fly1');
  },

  // 右に移動する歩行アニメーション
  fly2: function() {
    this.direction = 'right';
    this.anim.gotoAndPlay('fly2');
  },

  // 下に移動する歩行アニメーション
  fly3: function() {
    this.direction = 'down';
    this.anim.gotoAndPlay('fly3');
  },

  // 左に移動する歩行アニメーション
  fly4: function() {
    this.direction = 'left';
    this.anim.gotoAndPlay('fly4');
  },

  // 右に移動する処理
  moveRight: function() {
    this.x += this.speed;
    // 画面右端を超えないように制限
    if (this.x > SCREEN_WIDTH - this.width / 2) {
      this.x = SCREEN_WIDTH - this.width / 2;
    }
  },

  // 下に移動する処理
  moveDown: function() {
    this.y += this.speed;
    // 画面下端を超えないように制限
    if (this.y > SCREEN_HEIGHT - this.height / 2) {
      this.y = SCREEN_HEIGHT - this.height / 2;
    }
  },

  // 左に移動する処理
  moveLeft: function() {
    this.x -= this.speed;
    // 画面左端を超えないように制限
    if (this.x < this.width / 2) {
      this.x = this.width / 2;
    }
  },

  // 上に移動する処理（必要なら追加）
  moveUp: function() {
    this.y -= this.speed;
    // 画面上端を超えないように制限
    if (this.y < this.height / 2) {
      this.y = this.height / 2;
    }
  },
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
    assets,
    // シーンを明示的に登録
    scenes: [
      { label: 'title', className: 'TitleScene' },
      { label: 'main', className: 'MainScene' },
      { label: 'BossScene', className: 'BossScene' },  // BossSceneを登録
    ],
  });

  // 正しいシーン名を設定してシーン遷移を管理
  app.on('enterframe', function() {
    if (app.currentScene.label === 'BossScene') {
      app.replaceScene(BossScene());  // BossSceneへ遷移
    } else if (app.currentScene.label === 'main') {
      app.replaceScene(MainScene());  // 通常のメインシーンに遷移
    }
  });

  app.run();
});
