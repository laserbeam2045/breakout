import { config } from '../config.js';
import { assets } from '../assets.js';

const sleep = time => new Promise((resolve) => setTimeout(resolve, time))

phina.define('StopScene', {
  superClass: 'DisplayScene',

  init: function(stopDuration) {
    this.superInit()
    this.setInteractive(false)
    this.backgroundColor = 'rgba(0, 0, 0, 0)';
    setTimeout(() => {
      this.setInteractive(true)
      this.exit()
    }, stopDuration)
  },
})

phina.define('BaseScene', {
  superClass: 'GeneralScene',

  init: function(options) {
    this.superInit(options);

    // ゲーム開始・終了などのフラグ
    this.isGameStarted = false; // ゲーム開始フラグ
    this.isGameOver = false;    // ゲーム終了フラグ
    this.isClear = false;       // ゲームクリアフラグ
    this.isShaking = false;     // 震動中フラグ

    this.group = DisplayElement().addChildTo(this);

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
    this.iceballSound = AssetManager.get('sound', 'iceball_sound');
    this.dragonSound.volume = 0.5;
    this.fireballSound.volume = 0.5;
    this.iceballSound.volume = 0.5;
    this.attackSound.volume = 0.25;
    this.cursorSound.volume = 0.5;
  },

  update: function(app) {
    // console.log(app)
  },

  startGame: function() {
    if (!this.isGameStarted) {
      this.isGameStarted = true;
      this.paddle.release();

      // ボールを全て発射する（上方向に斜めに飛ばす）
      const angleRange = Math.PI / 3;  // 上方向の30度範囲で発射（約60度）
      for (let i = 0; i < this.balls.length; i++) {
        const ball = this.balls[i];
        const angle = -Math.PI / 2 + (i / (this.balls.length - 1)) * angleRange - angleRange / 2;  // -90度の範囲で調整
        ball.direction = Vector2(Math.cos(angle), Math.sin(angle)).normalize();  // 角度に基づいた方向ベクトル
        ball.speed = config.ball.initSpeed;  // ボールの速度を設定
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
        const isGolden = i === 0 && count === config.ball.normal.splitCount;
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
        ball.speed = config.ball.initSpeed;  // ボールの速度を設定

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
    const { rows, cols } = config.scene.main.block;
    const blockNum = rows * cols;

    this.blocks = DisplayElement().addChildTo(this);

    (blockNum).times(function(i) {
      var xIndex = i % cols;
      var yIndex = Math.floor(i / cols);
      var colorAngle = (360 / blockNum) * i;

      Block(colorAngle).addChildTo(this.blocks).setPosition(
        gridX.span(xIndex) + config.scene.main.padding + config.scene.main.block.size / 2,
        gridY.span(yIndex) + 70,
      );
    }, this);
  },

  movePaddle: function(pointer) {
    var targetX = pointer.x.clamp(this.paddle.width / 2, this.gridX.width - this.paddle.width / 2);
    this.paddle.x += (targetX - this.paddle.x) * 0.2;
  },

  movePaddleWithKeyboard: function(keyboard) {
    const initSpeed = 30  // パドルの初速
    const maxSpeed = 60;  // パドルの最大速度
    const acceleration = 5.0;  // 加速度
    const deceleration = 0.5;  // 減速率

    // キーボード入力に応じて速度を変更
    if (keyboard.getKey('left')) {
      if (this.paddleSpeed > -initSpeed) {
        // 初速を持たせる
        this.paddleSpeed = -initSpeed;
      } else {
        this.paddleSpeed -= acceleration;  // 左キーでさらに加速
      }
    } else if (keyboard.getKey('right')) {
      if (this.paddleSpeed < initSpeed) {
        // 初速を持たせる
        this.paddleSpeed = initSpeed;
      } else {
        this.paddleSpeed += acceleration;  // 右キーでさらに加速
      }
    } else {
      this.paddleSpeed *= deceleration;  // キーが押されていないときは減速
    }

    // 速度が最大値を超えないように制限
    this.paddleSpeed = this.paddleSpeed.clamp(-maxSpeed, maxSpeed);

    // パドルの位置を更新
    this.paddle.x += this.paddleSpeed;

    // パドルが画面外に出ないように制限
    const targetX = this.paddle.x.clamp(this.paddle.width / 2, this.gridX.width - this.paddle.width / 2);
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
    if (this.isShaking) return;

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
            this.splitBall(ball, config.ball.normal.splitCount);  // 金色のボールが再度3つに分裂
          }

          // 紫色のボールの場合は再度分裂
          if (ball.isPurple) {
            ball.isPurple = false;
            this.splitBall(ball, 10);
          }

          // ボールが1つだけの場合に分裂させる
          if (this.balls.length === 1 && Math.random() < 1.0) {
            this.splitBall(ball, config.ball.normal.splitCount);
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

  pause: function(stopDuration) {
    this.isStopping = true

    // シーンを追加することで動きを止める
    this.app.pushScene(StopScene(stopDuration))

    return new Promise((resolve) => setTimeout(() => {
      this.isStopping = false
      resolve()
    }, stopDuration))
  },

  shake: async function(shakeDuration, shakeStrength) {
    const scene = this;

    scene.isShaking = true

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
      this.shakeElement(element, shakeDuration, shakeStrength);
    });

    // 一定時間後にすべてのボールの状態を元に戻す
    setTimeout(() => {
      originalStates.forEach(state => {
        const sprite = state.sprite;
        if (!sprite) {
          return;
        }
        sprite.x = state.x;  // 元の位置に戻す
        sprite.y = state.y;
        if (sprite.speed !== undefined) {
          sprite.speed = state.speed;  // 元の速度に戻す
        }
        if (sprite.direction) {
          sprite.direction = state.direction.clone();  // 元の方向に戻す（ボールの場合など）
        }
      });
      // 震動後のスプライトの状態を正常化する処理
      scene.children.forEach(element => {
        if (element.restorePosition) {
          element.restorePosition();  // restorePosition 関数を追加して元の位置に戻す
        }
      });
    }, shakeDuration);

    return new Promise((resolve) => setTimeout(() => {
      scene.isShaking = false
      resolve()
    }, shakeDuration))
  },
  
  // 特定の要素を震動させる関数
  shakeElement: function(element, shakeDuration, shakeStrength) {
    const originalPosition = { x: element.x, y: element.y };  // 元の位置を保存
    let startTime = Date.now();  // 開始時刻

    const shake = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < shakeDuration) {
        // ランダムに要素をシェイク
        const strengthFactor = 1 - (elapsedTime / shakeDuration); // 時間に応じて強度を減少させる
        const currentStrength = shakeStrength * strengthFactor;

        // ランダムに要素をシェイク
        let shakeX = (Math.random() - 0.5) * currentStrength;
        let shakeY = (Math.random() - 0.5) * currentStrength;
  
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
    this.blocks.children.clone().some(function(block) {
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

    // スコアを加算 (例えばブロック1つあたり100点)
    this.score += 100;

    // サウンドを再生
    this.blockBreakSound.play();
  
    // ボールが1つだけの場合に分裂させる
    if (this.balls.length === 1 && Math.random() < 1.0) {
      this.splitBall(ball, config.ball.normal.splitCount);
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
      const isPurple = !isGolden && count === config.ball.normal.splitCount && !this.hasPurpleBall() && Math.random() < 1;
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

// 通常のブロック
phina.define('Block', {
  superClass: 'RectangleShape',

  init: function(angle) {
    this.superInit({
      width: config.scene.main.block.size,
      height: config.scene.main.block.size,
      fill: 'hsl({0}, 80%, 60%)'.format(angle || 0),
      stroke: null,
      cornerRadius: 3,
    });
    this.isBonusBlock = false;  // 通常のブロックはボーナスブロックではない
  },
});

phina.define('Ball', {
  superClass: 'CircleShape',

  init: function(isGolden, isPurple = false, isRainbow = false) {
    this.superInit({
      radius: config.ball.radius,
      fill: isGolden ? 'gold' : isPurple ? 'purple' : isRainbow ? 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)' : 'white',  // 金色のボールかどうかで色を変える
      stroke: null,
    });

    this.speed = config.ball.initSpeed;
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
    const newSpeed = Math.min(this.speed + 0.5, config.ball.maxSpeed);
    this.speed = newSpeed;
  },
});

phina.define('Paddle', {
  superClass: 'RectangleShape',
  init: function() {
    this.superInit({
      width: config.paddle.width,
      height: config.paddle.height,
      fill: '#eee',
      stroke: null,
      cornerRadius: 8,
    });
  },

  update: function() {
    if (this.ball) {
      this.ball.x = this.x;
      this.ball.y = this.top - this.ball.radius;
    }
  },

  hold: function(ball) {
    this.ball = ball;
  },

  release: function() {
    this.ball = null;
  },
});