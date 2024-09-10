import { config } from '../config.js';

phina.define('BossScene', {
  superClass: 'BaseScene',

  init: function(options) {
    this.superInit(options);
    this.setupGame();
    this.soundCooldown = false;  // サウンド再生クールダウンフラグ
    this.soundCooldownDuration = 100;  // サウンドが鳴った後に再度鳴るまでの待機時間（ミリ秒）
    this.fireballCooldown = 0;  // 火の玉のクールダウンタイマー
    this.fireballs = [];
    this.deadFlags = [false, false];  // 各ドラゴンの状態を管理
  },

  setupGame: function() {
    this.setupPlayer();
    this.setupDragons();
    this.setupPaddle();
    this.setupBalls();
  },

  // プレイヤーの初期化
  setupPlayer: function() {
    this.player = {
      HP: {
        value: 100,
      },
    };

    // プレイヤーHPバーと数値ラベル(画面下端に表示)
    Gauge({
      width: 600,
      height: 20,
      maxValue: this.player.HP.value,
      valueObject: this.player.HP,
      fillColor: 'green',
      backGroundColor: 'darkred',
      labelText: 'Player: ',
    })
    .setPosition(320, config.screen.height - 100)
    .addChildTo(this)
  },

  // ドラゴン（複数体）の初期化
  setupDragons: function() {
    this.dragons = [
      Dragon({ HP: 50, size: 256, name: 'RedDragon', color: 'red' }),
      Dragon({ HP: 100, size: 256, name: 'BlueDragon', color: 'blue' }),
    ];

    this.dragons.forEach((dragon, idx) => {
      const x = this.gridX.span(Math.floor(Math.random() * 3) + 1);
      const y = this.gridX.span(Math.floor(Math.random() * 3) + 1);
      dragon.setPosition(x, y).addChildTo(this);

      // HPバーの設定（画面左・右に配置）
      Gauge({
        width: 300,
        height: 20,
        maxValue: dragon.HP.value,
        valueObject: dragon.HP,
        fillColor: dragon.color,
        backGroundColor: 'darkred',
        labelText: `${dragon.name}: `,
      })
      .setPosition(170 + 300 * idx, this.gridY.span(2))
      .addChildTo(this);
    });
  },

  // パドルの初期化
  setupPaddle: function() {
    this.paddle = Paddle()
      .addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.span(13));
    this.paddle.prevX = this.paddle.x;  // 前フレームの位置を保持
    this.paddleSpeed = 0;  // パドルの速度
  },

  // ボールの初期化
  setupBalls: function() {
    // ボールを3つ作成
    this.balls = [];
    this.createBallsWithDelay(3, 100);  // ボール20個を100msずつ遅らせて発射
    this.paddle.hold(this.balls[0]);
    this.on('pointend', this.startGame.bind(this));
  },

  // updateDragonHP: function() {
  //   if (!this.clearFlag) {
  //     if (this.dragon1HP <= 0) {
  //       this.dragon1HP = 0;
  //       this.hpGauge1.remove();
  //     }
  //     if (this.dragon2HP <= 0) {
  //       this.dragon2HP = 0;
  //       this.hpGauge2.remove();
  //     }
  //     this.hpLabel1.text = `Red Dragon: ${this.dragon1HP}`;
  //     this.hpGauge1.width = (this.dragon1HP / this.maxDragon1HP) * 300;
  //     this.hpLabel2.text = `Blue Dragon: ${this.dragon2HP}`;
  //     this.hpGauge2.width = (this.dragon2HP / this.maxDragon2HP) * 300;

  //     if (this.dragon1HP <= 0 && !this.deadFlags[0]) this.handleDragonDeath('dragon1', 0);
  //     if (this.dragon2HP <= 0 && !this.deadFlags[1]) this.handleDragonDeath('dragon2', 1);

  //     if (this.dragon1HP <= 0 && this.dragon2HP <= 0) {
  //       this.clearFlag = true;
  //       setTimeout(() => this.gameClear(), 1500);
  //     }
  //   }
  // },

  updateFireballs: function(app) {
    this.fireballs.forEach((fireball, index) => {
      fireball.move();
      if (fireball.hitTestElement(this.paddle) && !this.isInvincible) {
        if (!(fireball.bottom > this.paddle.top + 50)) return;
        this.pauseAllAndShake();
        this.player.HP -= 10;
        fireball.remove();
        this.fireballs.splice(index, 1);
      }
    });
  },

  updateBallsAndPaddle: function(app) {
    if (!this.isGameStarted) {
      this.balls.forEach(ball => ball.setPosition(this.paddle.x, this.paddle.top - 20));
      if (app.keyboard.getKeyDown('space')) this.startGame();
    } else {
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
      this.dragons.forEach((dragon, idx) => {
        if (!dragon) return
        if (this.checkDragonCollision(ball, dragon)) {
          dragon.remove();
          this.dragons[idx] = null;
        }
      })
    }
    this.checkWallCollision(ball);
  },

  gameClear: function() {
    this.isGameOver = true;
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

  // ドラゴンが全て死んだときに呼ぶとtrueが返る
  isGameClear: function() {
    if (this.dragons.every(dragon => {
      return (dragon?.HP.value ?? 0) <= 0
    })) return true

    return false
  },

  update: function(app) {
    // 共通の操作を実行
    this.superMethod('update', app);

    if (this.isGameOver) {
      this.on('pointend', () => {
        this.exit('title');
      });
      if (app.keyboard.getKeyDown('space')) {
        this.exit('title');
      }
      return;
    }

    // ドラゴンが倒れたらゲームクリア
    if (this.isGameClear()) {
      this.gameClear()
    }

    // パドルの速度を計算
    // this.paddleSpeed = this.paddle.x - this.paddle.prevX;  // 前フレームからの移動距離で速度を計算
    // this.paddle.prevX = this.paddle.x;  // 現在位置を次フレームに備えて保持

    if (app.isStopped || app.isGameOver) return;

    if (this.player.HP.value <= 0) {
      this.gameOver();
    }
    // this.updateDragonHP();
    this.updateFireballs(app);
    this.updateBallsAndPaddle(app);

    if (this.isGameStarted) {
      this.balls.forEach(ball => {
        ball.move();
        // this.adjustBallAngle(ball);
        this.checkPaddleCollision(ball);  // パドルとの衝突処理を呼び出し
        this.checkCollisions(ball);  // 他の衝突処理（ドラゴンや壁など）
      });
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
      if (this.fireballCooldown > Math.random() * 1000 + 1000) {
        this.fireballCooldown = 0;  // クールダウンをリセット
        this.spawnFireball(this.dragon1, 'fireball');  // 火の玉を発射
      }
    }
    // ドラゴンが下を向いている場合にランダムに火の玉を吐く処理
    if (this.dragon2 && this.dragon2.direction === 'down') {
      if (this.isGameOver) return;
      this.fireballCooldown += app.deltaTime;
      if (this.fireballCooldown > Math.random() * 500 + 500) {
        this.fireballCooldown = 0;  // クールダウンをリセット
        this.spawnFireball(this.dragon2, 'iceball');  // 火の玉を発射
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
    //       this.player.HP -= 10;  // プレイヤーのHPを減らす
    //       this.playerHPLabel.text = `HP: ${this.player.HP}`;
    //       fireball.remove();  // 衝突後火の玉を消す
    //       this.fireballs.splice(index, 1);  // 配列から削除
    //     // }, SHAKE_TIME);
    //   }
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

    // if (this.isGameStarted) {
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

    // if (!this.isGameStarted && app.keyboard.getKeyDown('space')) {
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
    if (this.player.HP <= 0) {
      this.playerHPGauge.remove();
      this.gameOver();
    }
  },

  // 火の玉を生成する関数
  spawnFireball: function(dragon, skillName) {
    if (this.isGameOver) return;
    const fireball = Fireball(skillName).addChildTo(this);
    fireball.setPosition(dragon.x, dragon.y + dragon.height / 2);
    this.fireballs.push(fireball);
    // this.dragon.addChildTo(this);
    if (skillName === 'fireball') {
      this.fireballSound.play();
    }
    if (skillName === 'iceball') {
      this.iceballSound.play();
    }
  },

  // フィールドに存在するすべての火の玉を消す関数
  removeAllFireballs: function() {
    this.fireballs.forEach(ball => ball.remove());
  },

  // 壁との衝突判定
  checkWallCollision: function(ball) {
    this.superMethod('checkWallCollision', ball);
    // 画面の端にボールが当たった場合
    if (ball.left < 0 || ball.right > config.screen.width || ball.top < 0 || ball.bottom > config.screen.height) {
      // 壁に当たったらクールダウンを解除
      ball.isOnCooldown = false;
    }
  },

  // ドラゴンとの衝突判定
  checkDragonCollision: function(ball, dragon) {
    // if (!dragon) return;
    // if (this.deadFlags[dragonName === 'dragon1' ? 0 : 1]) return;
    if (ball.hitTestElement(dragon)) {
      // ボールがドラゴンに当たった際の反射処理
      ball.reflectY();

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
        this.splitBall(ball, config.ball.normal.splitCount);
      }

      // ドラゴンのHPを減少
      dragon.HP.value -= 10
      if (dragon.HP.value <= 0) {
        return true;  // 死んだってこと
      }
    }
  },

  // ボールのクールダウンを開始する関数
  startBallCooldown: function(ball) {
    ball.isOnCooldown = true;  // クールダウンを有効にする
    setTimeout(() => {
      ball.isOnCooldown = false;  // 10ms後にクールダウンを解除
    }, 100);
  },

  gameOver: function() {
    if (!this.isGameOver) {
      this.isGameOver = true;
      if (this.player.HP < 0) this.player.HP = 0;
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

// 火の玉クラス
phina.define('Fireball', {
  superClass: 'Sprite',

  init: function(skillName = 'iceball') {
    this.superInit(skillName);
    this.setOrigin(0.5, 0.5);
    // this.setSize(48, 48);  // 火の玉のサイズを48x48に設定
    // this.scaleX = 0.33;
    // this.scaleY = 0.33;
    // this.rotation = 90;  // 火の玉を下向きに回転
    this.speed = 12;
    // スプライトシートのアニメーション設定
    this.anim = FrameAnimation(`${skillName}_ss`).attachTo(this);
    this.anim.gotoAndPlay(skillName);
    this.anim.fit = false;
    this.setSize(192, 192);
  },

  move: function() {
    this.y += this.speed;  // 火の玉は下方向に移動
    if (this.y > config.screen.height) {
      this.remove();  // 画面外に出たら火の玉を削除
    }
  },
});

phina.define('Dragon', {
  superClass: 'Sprite',

  init: function({
    HP = 1000,
    size = 256,
    name = 'RedDragon',
    color = 'red',
    direction = 'up',
    speed = 3,
  }){
    this.superInit(name);
    this.setOrigin(0.5, 0.5);
    this.setSize(size, size);
    this.HP = { value: HP };
    this.name = name;
    this.color = color;
    this.direction = direction;
    this.speed = speed;
    this.changeDirectionTime = 0;  // ランダムに方向を変更するためのタイマー
    this.randomChangeInterval = 2000;  // ランダムに方向を変える間隔（ミリ秒）

    const animation = `${name}SS`;
    
    // スプライトシートのアニメーション設定
    this.anim = FrameAnimation(animation).attachTo(this);
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
    if (this.x >= config.screen.width - this.width / 2) {
      this.direction = 'left';  // 右端に到達したら左に移動
      this.fly4();  // 左向きのアニメーションに変更
    }
    if (this.x <= this.width / 2) {
      this.direction = 'right';  // 左端に到達したら右に移動
      this.fly2();  // 右向きのアニメーションに変更
    }
    if (this.y >= config.screen.height - this.height / 2 - 500) {
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
    if (this.x > config.screen.width - this.width / 2) {
      this.x = config.screen.width - this.width / 2;
    }
  },

  // 下に移動する処理
  moveDown: function() {
    this.y += this.speed;
    // 画面下端を超えないように制限
    if (this.y > config.screen.height - this.height / 2) {
      this.y = config.screen.height - this.height / 2;
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

// HPなどのゲージを表示するためのクラス
phina.define('Gauge', {
  superClass: 'DisplayElement',

  init: function(options) {
    this.superInit(options);

    // オプションにデフォルト値を設定
    const defaults = {
      width: 200,
      height: 20,
      maxValue: 100,
      valueObject: { value: 100 },  // オブジェクトで値を渡す
      backgroundColor: 'gray',
      fillColor: 'green',
      labelText: 'HP',
      fontSize: 16,
      labelColor: 'white',
    };

    // デフォルト値とオプションをマージ
    this.options = Object.assign({}, defaults, options);

    // ゲージの背景（RectangleShape）
    this.background = RectangleShape({
      width: this.options.width,
      height: this.options.height,
      fill: this.options.backgroundColor,
      stroke: null,
    }).addChildTo(this);

    // ゲージのメイン部分（現在の値を表示）
    this.bar = RectangleShape({
      width: this._getBarWidth(),  // 現在の値に基づいて幅を決定
      height: this.options.height,
      fill: this.options.fillColor,
      stroke: null,
      originX: 0,  // 左寄せ
    }).addChildTo(this);
    this.bar.setPosition(-this.options.width / 2, 0);  // 背景と揃える

    // ラベル（HPなどの名前）
    this.label = Label({
      text: this.options.labelText,
      fontSize: this.options.fontSize,
      fill: this.options.labelColor,
    }).addChildTo(this);
    this.label.setPosition(0, -this.options.height);  // ゲージの上に表示
  },

  // フレームごとに値を自動更新
  update: function() {
    this.bar.width = this._getBarWidth();
    this.label.text = `${this.options.labelText}${this.options.valueObject.value}`
  },

  // ゲージの幅を現在のオブジェクトの値に基づいて計算
  _getBarWidth: function() {
    const value = this.options.valueObject.value;  // オブジェクトから値を取得
    return (this.options.width * this._clamp(value, 0, this.options.maxValue)) / this.options.maxValue;
  },

  // クランプ関数を独自に実装
  _clamp: function(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
});
