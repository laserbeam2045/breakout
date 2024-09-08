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
var SHAKE_TIME      = 150;

var BOARD_SIZE      = SCREEN_WIDTH - BOARD_PADDING * 2;
var BOARD_OFFSET_X  = BOARD_PADDING + BLOCK_SIZE / 2;
var BOARD_OFFSET_Y  = 70;

// アセットの定義を1回で行う
const assets = {
  image: {
    // エジソン
    'background01': 'https://amanaimages.com/pickup/img/historicalfigures/bnr_kagaku_GRA6070701900M.jpg',
    // モーツァルト
    // 'background02': 'https://cdn-blob.austria.info/cms-uploads-prod/default/0002/92/thumb_191548_default_header_big.jpeg',
    // 大谷翔平
    // 'background03': 'https://p.potaufeu.asahi.com/d473-p/picture/27390318/13b16927a46a8b6f7380262da5ec9957_640px.jpg',
    // ピカソ
    // 'background04': 'https://cdn.shopify.com/s/files/1/0554/9057/6433/files/e8131b5f33b316a85a80c11dd0872991_480x480.jpg?v=1713847065',
    // 藤井聡太
    // 'background05': 'https://cdn.mainichi.jp/vol1/2023/05/23/20230523mpj00m040014000p/9.jpg?1',
    // アインシュタイン
    'background06': 'https://i.ytimg.com/vi/YX72DdfSdMU/maxresdefault.jpg',
    // 宇宙
    'background': 'https://preview.redd.it/29zh4v56mo951.jpg?width=640&crop=smart&auto=webp&s=0f3122b8c447cd88c90e825f31f7737c06538693',
    // ドラゴン
    'dragon': './assets/dragon.png',
    // ドラゴン（蒼）
    'dragon2': './assets/dragon2.png',
    // 火の玉
    'fireball': './assets/fireball.png',
  },
  sound: {
    'block_break': 'assets/block_break.mp3',  // サウンドファイルのパス
    'paddle_reflect': 'assets/打撃3.mp3',  // サウンドファイルのパス
    'clear_sound': 'assets/シャキーン3.mp3',  // サウンドファイルのパス
    'decision_sound': 'assets/決定ボタンを押す23.mp3',  // サウンドファイルのパス
    'failed_sound': 'assets/データ表示1.mp3',  // サウンドファイルのパス
    'cursor_sound': 'assets/カーソル移動4.mp3',  // サウンドファイルのパス
    'attack_sound': 'assets/重いパンチ1.mp3',  // サウンドファイルのパス
    'fireball_sound': 'assets/火炎魔法1.mp3',  // サウンドファイルのパス
    'dragon_sound': 'assets/ドラゴンの鳴き声2.mp3',  // サウンドファイルのパス
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
    'dragon2_ss': {
      "frame": {
        "width": 144,  // 各フレームの幅
        "height": 128, // 各フレームの高さ
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
    fireball_ss: {
      frame: {
        width: 512,
        height: 512,
        cols: 6,
        rows: 1,
      },
      animations: {
        fireball: {
          frames: [0, 1, 2, 3, 4, 5],
          frequency: 6,
        }
      },
    },
  },
};

// ステージ数を画像の数に応じて設定
const stageCount = Object.keys(assets.image).length - 4;

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
    this.dragonSound = AssetManager.get('sound', 'dragon_sound');

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
        text: 'ステージ3',
        width: 200,
        height: 80,
      })
      .addChildTo(this)
      .setPosition(startX + 2 * (buttonWidth + buttonSpacingX), startY + 0 * buttonSpacingY)
      .on('push', () => {
        this.dragonSound.play();
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
    this.fireballSound = AssetManager.get('sound', 'fireball_sound');
    this.dragonSound = AssetManager.get('sound', 'dragon_sound');
    this.attackSound.volume = 0.25;
    this.cursorSound.volume = 0.5;
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

        // // 一定確率（20%）で虹色のボールにする
        // // TODO: 移動する
        // if (Math.random() < 0.75) {
        //   ball.isRainbow = true;
        // } else {
        //   ball.isRainbow = false;
        // }

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

  activateInvincibility: function() {
    this.isInvincible = true;
  
    // パドルを虹色にきらめかせる
    this.paddle.tweener.clear()
      // .to({ fill: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)' }, 300)
      .to({ fill: 'rgba(0,0,0,0.5)' }, 300)
      .setLoop(true)
      .to({ alpha: 0.7 }, 500)
      .to({ alpha: 1.0 }, 500);
  
    // 3秒後に無敵を解除
    setTimeout(() => {
      this.isInvincible = false;
      this.paddle.tweener.clear();
      this.paddle.fill = 'white';  // パドルの色を元に戻す
    }, 10000);
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

          // 虹色のボールなら無敵状態にする
          if (ball.isRainbow) {
            this.activateInvincibility();
          }

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
            // this.pauseAllAndShake(ball);
            // setTimeout(() => {
              ball.isPurple = false;
              this.splitBall(ball, 10);
            // }, SHAKE_TIME);
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

  pauseAllAndShake: function(shakeTime = SHAKE_TIME) {
    const scene = this;
    scene.isStopped = true;
  
    // すべてのスプライトの元の状態を保存する配列
    const originalStates = [];

    // すべてのボール、ドラゴン、火の玉などのスプライトを停止させ、状態を保存
    scene.balls.forEach(ball => {
      originalStates.push({
        sprite: ball,
        x: ball.x,
        y: ball.y,
        speed: ball.speed,
        direction: ball.direction.clone(),
      });
      ball.speed = 0;  // ボールを停止
      ball.direction.set(0, 0);  // 移動方向をリセット
    });
    
    if (scene.dragon) {
      originalStates.push({
        sprite: scene.dragon,
        x: scene.dragon.x,
        y: scene.dragon.y,
        speed: scene.dragon.speed,
        direction: scene.dragon.direction,  // ドラゴンの方向も保持
      });
      scene.dragon.speed = 0;  // ドラゴンを停止
    }
  
    scene.fireballs.forEach(fireball => {
      originalStates.push({
        sprite: fireball,
        x: fireball.x,
        y: fireball.y,
        speed: fireball.speed,
      });
      fireball.speed = 0;  // 火の玉を停止
    });

    // すべてのボールの位置、速度、方向を一時的に保存し、ボールを止める
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
    scene.children.forEach(element => {
      if (element.className === 'Ball') return;
      this.shakeElement(element, shakeTime);
    });
    this.paddleReflectSound.play();

    // 一定時間後にすべてのボールの状態を元に戻す
    setTimeout(() => {
      originalStates.forEach(state => {
        const sprite = state.sprite;
        if (!sprite) return;
        sprite.x = state.x;  // 元の位置に戻す
        sprite.y = state.y;
        if (sprite.speed !== undefined) {
          sprite.speed = state.speed;  // 元の速度に戻す
        }
        if (sprite.direction) {
          sprite.direction = state.direction;  // 元の方向に戻す（ボールの場合など）
        }
      });
      // 震動後のスプライトの状態を正常化する処理
      scene.children.forEach(element => {
        if (element.restorePosition) {
          element.restorePosition();  // restorePosition 関数を追加して元の位置に戻す
        }
      });
      // this.splitBall(ball, 10);
      // if (ball) ball.isPurple = false;
      scene.isStopped = false;
    }, shakeTime);
  },
  
  // 特定の要素を震動させる関数
  shakeElement: function(element, shakeTime) {
    const originalPosition = { x: element.x, y: element.y };  // 元の位置を保存
    let shakeDuration = shakeTime;  // 震動時間
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
    this.removeAllBalls();

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
      backgroundImage = 'background06';
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
    if (app.isStopped) return;

    this.time += app.deltaTime;

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
    this.playerHP = 100;  // プレイヤーの初期HP
    this.maxPlayerHP = this.playerHP;
    this.fireballCooldown = 0;  // 火の玉のクールダウンタイマー
    this.fireballs = [];
    this.deadFlags = [false, false];  // 各ドラゴンの状態を管理
  },

  // プレイヤーのHP関連の初期化
  setupPlayer: function() {
    this.playerHP = 100;  // プレイヤーの初期HP
    this.maxPlayerHP = this.playerHP;  // 最大HP

    // プレイヤーHPバー
    this.playerHPGauge = this.createHPGauge(20, SCREEN_HEIGHT - 100, '#555', null, 600).addChildTo(this).setPosition(20, SCREEN_HEIGHT - 100);  // 画面下端に設定

    // プレイヤーHPの数値ラベル
    this.playerHPLabel = this.createHPLabel(this.gridX.center(), SCREEN_HEIGHT - 150, `HP: ${this.playerHP}`);
  },

  setupDragons: function() {
    // ドラゴン1の初期化とHP
    this.dragon1HP = 10000;  // 初期HP
    this.maxDragon1HP = this.dragon1HP;  // 最大HP
    this.dragon1 = Dragon('dragon').addChildTo(this);
    this.dragon1.setSize(256, 256).setPosition(this.gridX.span(3), this.gridY.span(5));  // ドラゴン1の位置調整

    // ドラゴン2の初期化（dragon2を使用）
    this.dragon2HP = 10000;  // 初期HP
    this.maxDragon2HP = this.dragon2HP;  // 最大HP
    this.dragon2 = Dragon('dragon2').addChildTo(this);  // dragon2を使用
    this.dragon2.setSize(256, 256).setPosition(this.gridX.span(10), this.gridY.span(5));  // ドラゴン2の位置調整

    // HPバーの設定（画面左・右に配置）
    this.hpGauge1 = this.createHPGauge(20, this.gridY.span(1), 'red', this.dragon1HP, 300);
    this.hpLabel1 = this.createHPLabel(20 + 150, this.gridY.span(2), '');
    this.hpGauge2 = this.createHPGauge(320, this.gridY.span(1), 'blue', this.dragon2HP, 300);
    this.hpLabel2 = this.createHPLabel(320 + 150, this.gridY.span(2), '');
  },

  createHPGauge: function(x, y, color, hp, width) {
    return RectangleShape({ width: width, height: 20, fill: color, stroke: null, cornerRadius: 10, originX: 0 })
      .addChildTo(this).setPosition(x, y);
  },

  createHPLabel: function(x, y, text) {
    return Label({ text: text, fontSize: 24, fill: 'white' })
      .addChildTo(this).setPosition(x, y);
  },

  // パドル、ボール、ブロックなどの設定
  setupPaddleAndBalls: function() {
    this.paddle = Paddle()
      .addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.span(13)); // バーを少し上に移動
    this.paddle.prevX = this.paddle.x;  // 前フレームの位置を保持
    this.paddleSpeed = 0;  // パドルの速度

    // ボールを3つ作成
    this.balls = [];
    this.createBallsWithDelay(3, 100);  // ボール20個を100msずつ遅らせて発射
    this.paddle.hold(this.balls[0]);
    this.gameStarted = false;
    this.on('pointend', this.startGame.bind(this));
  },

  setupGame: function() {
    this.gameStarted = false;  // ゲーム開始前の状態
    this.isGameOver = false;   // ゲームオーバー状態
    this.clearFlag = false;    // ゲームクリア状態
    this.superInit();
    this.setupPlayer();
    this.setupDragons();
    this.setupPaddleAndBalls();
    // this.group = DisplayElement().addChildTo(this);
  },

  updatePlayerHP: function() {
    this.playerHPLabel.text = `HP: ${this.playerHP}`;
    this.playerHPGauge.width = (this.playerHP / this.maxPlayerHP) * 600;
    this.playerHPGauge.fill = this.getHpColor(this.playerHP / this.maxPlayerHP);
    if (this.playerHP <= 0) {
      this.playerHPGauge.remove();
      this.gameOver();
    }
  },

  updateDragonHP: function() {
    if (!this.clearFlag) {
      if (this.dragon1HP <= 0) {
        this.dragon1HP = 0;
        this.hpGauge1.remove();
      }
      if (this.dragon2HP <= 0) {
        this.dragon2HP = 0;
        this.hpGauge2.remove();
      }
      this.hpLabel1.text = `Red Dragon: ${this.dragon1HP}`;
      this.hpGauge1.width = (this.dragon1HP / this.maxDragon1HP) * 300;
      this.hpLabel2.text = `Blue Dragon: ${this.dragon2HP}`;
      this.hpGauge2.width = (this.dragon2HP / this.maxDragon2HP) * 300;

      if (this.dragon1HP <= 0 && !this.deadFlags[0]) this.handleDragonDeath('dragon1', 0);
      if (this.dragon2HP <= 0 && !this.deadFlags[1]) this.handleDragonDeath('dragon2', 1);

      if (this.dragon1HP <= 0 && this.dragon2HP <= 0) {
        this.clearFlag = true;
        setTimeout(() => this.gameClear(), 1500);
      }
    }
  },

  handleDragonDeath: function(dragonName, index) {
    this.deadFlags[index] = true;
    this.pauseAllAndShake(1500);
    setTimeout(() => {
      if (dragonName === 'dragon1') this.removeDragon('dragon1');
      if (dragonName === 'dragon2') this.removeDragon('dragon2');
    }, 1500);
  },

  updateFireballs: function(app) {
    this.fireballs.forEach((fireball, index) => {
      fireball.move();
      if (fireball.hitTestElement(this.paddle) && !this.isInvincible) {
        if (!(fireball.bottom > this.paddle.top + 50)) return;
        this.pauseAllAndShake();
        this.playerHP -= 10;
        this.playerHPLabel.text = `HP: ${this.playerHP}`;
        fireball.remove();
        this.fireballs.splice(index, 1);
      }
    });
  },

  updateBallsAndPaddle: function(app) {
    if (!this.gameStarted) {
      this.balls.forEach(ball => ball.setPosition(this.paddle.x, this.paddle.top - 20));
      if (app.keyboard.getKeyDown('space')) this.startGame();
    } else {
      // this.balls.forEach(ball => {
      //   ball.move();
      //   this.checkCollisions(ball);
      // });
      this.updatePaddle(app);
    }
  },

  updatePaddle: function(app) {
    this.paddleSpeed = this.paddle.x - this.paddle.prevX;
    this.paddle.prevX = this.paddle.x;
    if (this.isPC) {
      this.movePaddleWithKeyboard(app.keyboard);
    } else {
      this.movePaddle(app.pointer);
    }
  },

  checkCollisions: function(ball) {
    if (!ball.isOnCooldown) {
      this.checkDragonCollision(ball, this.dragon1, 'dragon1');
      this.checkDragonCollision(ball, this.dragon2, 'dragon2');
    }
    this.checkWallCollision(ball);
  },

  checkDragonCollision: function(ball, dragon, dragonName) {
    if (!dragon || this.deadFlags[dragonName === 'dragon1' ? 0 : 1]) return;
    if (ball.hitTestElement(dragon)) {
      ball.reflectY();
      this.reduceDragonHP(dragonName, ball);
    }
  },

  reduceDragonHP: function(dragonName, ball) {
    if (dragonName === 'dragon1') {
      this.dragon1HP -= 10;
    } else if (dragonName === 'dragon2') {
      this.dragon2HP -= 10;
    }
    this.startBallCooldown(ball);
  },

  gameClear: function() {
    this.clearFlag = true;
    this.paddle.remove();
    this.removeAllBalls();
    this.clearSound.play();
    this.removeAllFireballs();
    Label({
      text: 'Game Clear!',
      fontSize: 64,
      fill: 'skyblue',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    Label({
      text: 'Press Space to Retry',
      fontSize: 32,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center() + 100);
  },

  update: function(app) {
    // 共通の操作を実行
    this.superMethod('update', app);
    
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

    if (app.isStopped || app.isGameOver) return;

    this.updatePlayerHP();
    this.updateDragonHP();
    this.updateFireballs(app);
    this.updateBallsAndPaddle(app);

    if (this.gameStarted) {
      this.balls.forEach(ball => {
        ball.move();
        // this.adjustBallAngle(ball);
        this.checkPaddleCollision(ball);  // パドルとの衝突処理を呼び出し
        this.checkCollisions(ball);  // 他の衝突処理（ドラゴンや壁など）
      });

      // パドルの速度を計算
      this.paddleSpeed = this.paddle.x - this.paddle.prevX;  // 前フレームからの移動距離で速度を計算
      this.paddle.prevX = this.paddle.x;  // 現在位置を次フレームに備えて保持
    } else {
      // パドルの移動を有効にする
      this.updatePaddle(app);
      // ゲームが開始されていない間はボールをパドルに追従させる
      this.balls.forEach(ball => {
        ball.setPosition(this.paddle.x, this.paddle.top - 20);  // パドルにボールを追従させる
      });
    }

    // ドラゴンが下を向いている場合にランダムに火の玉を吐く処理
    if (this.dragon1 && this.dragon1.direction === 'down') {
      if (this.isGameOver) return;
      this.fireballCooldown += app.deltaTime;
      if (this.fireballCooldown > Math.random() * 500 + 500) {
        this.fireballCooldown = 0;  // クールダウンをリセット
        this.spawnFireball(this.dragon1);  // 火の玉を発射
      }
    }
    // ドラゴンが下を向いている場合にランダムに火の玉を吐く処理
    if (this.dragon2 && this.dragon2.direction === 'down') {
      if (this.isGameOver) return;
      this.fireballCooldown += app.deltaTime;
      if (this.fireballCooldown > Math.random() * 500 + 500) {
        this.fireballCooldown = 0;  // クールダウンをリセット
        this.spawnFireball(this.dragon2);  // 火の玉を発射
      }
    }

    // // 各火の玉の移動と衝突判定
    // this.fireballs.forEach((fireball, index) => {
    //   fireball.move();
    //   if (fireball.hitTestElement(this.paddle)) {
    //     if (!(fireball.bottom > this.paddle.top + 50)) return;
    //     // console.log(fireball.bottom, this.paddle.top)
    //     this.pauseAllAndShake();
    //     // setTimeout(() => {
    //       this.playerHP -= 10;  // プレイヤーのHPを減らす
    //       this.playerHPLabel.text = `HP: ${this.playerHP}`;
    //       fireball.remove();  // 衝突後火の玉を消す
    //       this.fireballs.splice(index, 1);  // 配列から削除
    //     // }, SHAKE_TIME);
    //   }
    // });

    // // ドラゴン1と2の衝突処理
    // this.balls.forEach(ball => {
    //   // ボールのクールダウンが終了していない場合、判定をスキップ
    //   if (!ball.isOnCooldown) {
    //     this.checkDragonCollision(ball, this.dragon1, 'dragon1');
    //     this.checkDragonCollision(ball, this.dragon2, 'dragon2');
    //   }
    //   // 壁に当たった場合の処理
    //   this.checkWallCollision(ball);
    // });

    // if (this.isGameOver || this.clearFlag) {
    //   this.on('pointend', () => {
    //     if (this.endFlag) this.exit('title');
    //     setTimeout(() => this.endFlag = true, 500);
    //   });
    //   if (app.keyboard.getKeyDown('space')) {
    //     this.exit('title');
    //   }
    //   return;
    // }

    // if (this.gameStarted) {
    //   // 毎フレーム呼ばれる。制限時間のカウントダウンを処理
    //   this.remainingTime -= app.deltaTime / 1000;  // 残り時間を秒単位で減らす

    //   // 画面に制限時間を小数点以下1桁まで表示
    //   // this.timeLabel.text = 'Time: ' + Math.max(0, this.remainingTime).toFixed(1);

    //   // 残り時間が0以下になったらゲームオーバー
    //   if (this.remainingTime <= 0) {
    //     this.gameOver();
    //   }
    // }

    // if (this.isGameOver || this.clearFlag) {
    //   // ゲームオーバーまたはクリア時にボールをすべて消去
    //   this.removeAllBalls();
    // }

    // if (!this.gameStarted && app.keyboard.getKeyDown('space')) {
    //   this.startGame();
    // }

    // // 色付きボールを最後に表示するために再配置
    // this.balls.forEach(ball => {
    //   if (ball.isGolden || ball.isPurple) {
    //     ball.remove();  // 一度削除して
    //     ball.addChildTo(this);  // 最後に再追加
    //   }
    // });

    // if (this.isPC) {
    //   this.movePaddleWithKeyboard(app.keyboard);
    // } else {
    //   this.movePaddle(app.pointer);
    // }

    // // ドラゴンのHPが0になったらゲームクリア
    // if (this.dragon1HP <= 0 && !this.deadFlags[0]) {
    //   this.deadFlags[0] = true;
    //   this.dragon1HP = 0;
    //   this.hpGauge1.remove();
    //   this.pauseAllAndShake(1500);
    //   setTimeout(() => {
    //     this.dragon1.remove();
    //   }, 1500);
    // }
    // // ドラゴンのHPが0になったらゲームクリア
    // if (this.dragon2HP <= 0 && !this.deadFlags[1]) {
    //   this.deadFlags[1] = true;
    //   this.dragon2HP = 0;
    //   this.hpGauge2.remove();
    //   this.pauseAllAndShake(1500);
    //   setTimeout(() => {
    //     this.dragon2.remove();
    //   }, 1500);
    // }
    // if (this.dragon1HP <= 0 && this.dragon2HP <= 0 && !this.clearFlag) {
    //   this.clearFlag = true;
    //   this.fireballs.forEach((fire) => fire.remove());
    //   setTimeout(() => {
    //     this.gameClear();
    //   }, 1500);
    // }
    // プレイヤーのHPが0になったらゲームオーバー
    if (this.playerHP <= 0) {
      this.playerHPGauge.remove();
      this.gameOver();
    }
  },

  // 火の玉を生成する関数
  spawnFireball: function(dragon) {
    if (this.isGameOver || this.clearFlag) return;
    const fireball = Fireball().addChildTo(this);
    fireball.setPosition(dragon.x, dragon.y + dragon.height / 2);
    this.fireballs.push(fireball);
    // this.dragon.addChildTo(this);
    this.fireballSound.play();
  },

  // フィールドに存在するすべての火の玉を消す関数
  removeAllFireballs: function() {
    this.fireballs.forEach(ball => ball.remove());
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

  // 壁との衝突判定
  checkWallCollision: function(ball) {
    this.superMethod('checkWallCollision', ball);
    // 画面の端にボールが当たった場合
    if (ball.left < 0 || ball.right > SCREEN_WIDTH || ball.top < 0 || ball.bottom > SCREEN_HEIGHT) {
      // 壁に当たったらクールダウンを解除
      ball.isOnCooldown = false;
    }
  },

  // ドラゴンとの衝突判定
  checkDragonCollision: function(ball, dragon, dragonName) {
    if (!dragon) return;
    if (this.deadFlags[dragonName === 'dragon1' ? 0 : 1]) return;
    if (ball.hitTestElement(dragon)) {
      // ボールがドラゴンに当たった際の反射処理
      ball.reflectY();

      // ドラゴンのHPを減少
      if (dragonName === 'dragon1') {
        this.dragon1HP -= 10;
        if (this.dragon1HP <= 0) {
          this.deadFlags[dragonName === 'dragon1' ? 0 : 1] = true;
          this.pauseAllAndShake(1500);
          setTimeout(() => {
            this.dragon1HP = 0;
            this.removeDragon('dragon1');
            // this.dragonSound.play();
          }, 1500);
        }
        this.hpLabel1.text = `Red: ${this.dragon1HP}`;
      } else if (dragonName === 'dragon2') {
        this.dragon2HP -= 10;
        if (this.dragon2HP <= 0) {
          this.deadFlags[dragonName === 'dragon1' ? 0 : 1] = true;
          this.pauseAllAndShake(1500);
          setTimeout(() => {
            this.dragon2HP = 0;
            this.removeDragon('dragon2');
          }, 1500);
        }
        this.hpLabel2.text = `Blue: ${this.dragon2HP}`;
      }

      // ボールのクールダウンタイマーを開始
      this.startBallCooldown(ball);

      if (!this.soundCooldown) {
        this.soundCooldown = true;
        setTimeout(() => {
          this.soundCooldown = false;  // 一定時間後に再びサウンドを再生可能にする
        }, this.soundCooldownDuration);
        this.attackSound.play();
      }

      // ボールの分裂処理
      if (this.balls.length === 1) {
        this.splitBall(ball, SPLIT_COUNT_A);
      }

      // ドラゴンが倒れたらゲームクリア
      // if (this.dragon1HP <= 0 && this.dragon2HP <= 0) {
      //   setTimeout(() => {
      //     this.exit('title');  // 次のシーンに遷移
      //   }, 5000);
      // }
    }
  },

  // ボールのクールダウンを開始する関数
  startBallCooldown: function(ball) {
    ball.isOnCooldown = true;  // クールダウンを有効にする
    setTimeout(() => {
      ball.isOnCooldown = false;  // 10ms後にクールダウンを解除
    }, 100);
  },

  // ドラゴンを完全に削除する関数
  removeDragon: function(dragonName) {
    if (dragonName === 'dragon1') {
      if (this.dragon1) {
        this.dragon1.remove();  // 画面から削除
        this.dragon1 = null;    // オブジェクトをnullにする
        this.hpGauge1.remove(); // HPバーも削除
      }
    } else if (dragonName === 'dragon2') {
      if (this.dragon2) {
        this.dragon2.remove();  // 画面から削除
        this.dragon2 = null;    // オブジェクトをnullにする
        this.hpGauge2.remove(); // HPバーも削除
      }
    }
  },

  // ボールを分裂させる関数（紫色のボールを含む）
  splitBall: function(originalBall, count) {
    if (!originalBall) return;
    const angleRange = Math.PI / 3;  // 上方向の30度範囲で発射（約60度）
    const centerX = originalBall.x;
    const centerY = originalBall.y;

    for (let i = 0; i < count; i++) {
      const isGolden = this.balls.length === 1;
      const isPurple = !this.hasPurpleBall() && Math.random() < 1.0;
      const ball = Ball(isGolden, isPurple).addChildTo(this);
      ball.setPosition(centerX, centerY);

      // ボールの進行方向を上方向に少しずつ角度をずらして設定
      const angle = -Math.PI / 2 + (i / (count - 1)) * angleRange - angleRange / 2;  // -90度の範囲で調整
      ball.direction = Vector2(Math.cos(angle), Math.sin(angle)).normalize();  // 角度に基づいた方向ベクトル
      ball.speed = BALL_SPEED;  // ボールの速度を設定

      this.balls.push(ball);  // ボールリストに追加
    }
  },

  gameOver: function() {
    if (!this.isGameOver) {
      this.isGameOver = true;
      if (this.playerHP < 0) this.playerHP = 0;
      this.failedSound.play();
      this.removeAllBalls();
      this.removeAllFireballs();
      this.paddle.remove();
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

  init: function(isGolden, isPurple = false, isRainbow = false) {
    this.superInit({
      radius: BALL_RADIUS,
      fill: isGolden ? 'gold' : isPurple ? 'purple' : isRainbow ? 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)' : 'white',  // 金色のボールかどうかで色を変える
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
    gradient.addColorStop(0, this.isGolden ? 'gold' : this.isPurple ? 'purple' : this.isRainbow ? 'rgba(0, 0, 0, 0.5)' : 'white');  // 中心は白
    gradient.addColorStop(1, '#ccc');   // 外側はグレー (影っぽく見せる)
    // グラデーションで塗りつぶし
    ctx.fillStyle = gradient;
    // ctx.fill = 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)';
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

// 火の玉クラス
phina.define('Fireball', {
  superClass: 'Sprite',

  init: function() {
    this.superInit('fireball');
    this.setOrigin(0.5, 0.5);
    // this.setSize(48, 48);  // 火の玉のサイズを48x48に設定
    // this.scaleX = 0.33;
    // this.scaleY = 0.33;
    this.rotation = 90;  // 火の玉を下向きに回転
    this.speed = 20;
    
    // スプライトシートのアニメーション設定
    this.anim = FrameAnimation('fireball_ss').attachTo(this);
    this.anim.gotoAndPlay('fireball');
    this.anim.fit = false;
    this.setSize(192, 192);
  },

  move: function() {
    this.y += this.speed;  // 火の玉は下方向に移動
    if (this.y > SCREEN_HEIGHT) {
      this.remove();  // 画面外に出たら火の玉を削除
    }
  },
});

phina.define('Dragon', {
  superClass: 'Sprite',

  init: function(name) {
    this.superInit(name);
    this.setOrigin(0.5, 0.5);
    this.scaleX = 2;
    this.scaleY = 2;
    this.direction = 'up';  // 初期方向
    this.speed = 3;  // 移動速度を設定
    this.changeDirectionTime = 0;  // ランダムに方向を変更するためのタイマー
    this.randomChangeInterval = 2000;  // ランダムに方向を変える間隔（ミリ秒）
    
    // スプライトシートのアニメーション設定
    this.anim = FrameAnimation(name === 'dragon' ? 'dragon_ss' : 'dragon2_ss').attachTo(this);
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
    if (this.y >= SCREEN_HEIGHT - this.height / 2 - 500) {
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
