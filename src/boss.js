import { config } from '../config.js?version=1.0.1';

phina.define('BossScene', {
  superClass: 'BaseScene',

  init: function(options) {
    this.superInit(options);
    this.setupGame();
  },

  setupGame: function() {
    this.soundCooldown = false;  // サウンド再生クールダウンフラグ
    this.soundCooldownDuration = 100;  // サウンドが鳴った後に再度鳴るまでの待機時間（ミリ秒）
    this.fireballCooldown = 0;  // 火の玉のクールダウンタイマー
    this.fireballs = [];
    this.setupPlayer();
    this.setupDragons();
    this.setupPaddle();
    this.setupBalls();
  },

  update: function(app) {
    // 共通の操作を実行
    this.superMethod('update', app);

    // 震動中はここでストップ
    if (this.isHitStop) {
      return;
    }

    // クリアした状態ならここでreturnする
    if (this.isGameEnd || this.isGameOver) {
      this.on('pointend', () => this.exit('title'));
      if (app.keyboard.getKeyDown('space')) this.exit('title');
      return;
    }

    if (this.isGameClear) return

    // ドラゴンが倒れたらゲームクリア
    if (this.isDragonsDead()) {
      this.gameClear()
    }

    // プレイヤーのHPが0になったらゲームオーバー
    if (this.player.HP.value <= 0) {
      this.gameOver();
    }

    this.updateFireballs(app);
    this.updateBallsAndPaddle(app);

    if (this.isGameStarted) {
      this.balls.forEach(ball => {
        if (this.isHitStop) {
          return;
        }
        ball.move();
        this.checkPaddleCollision(ball);  // パドルとの衝突処理を呼び出し
        this.checkCollisions(ball);  // 他の衝突処理（ドラゴンや壁など）
      });
    } else {
      // パドルの移動を有効にする
      this.updatePaddle(app);
      // ゲームが開始されていない間はボールをパドルに追従させる
      this.balls.forEach(ball => {
        ball.setPosition(this.paddle.x, this.paddle.top - 20);
      });
    }

    // ドラゴンが下を向いている場合にランダムに火の玉を吐く処理
    this.dragons.forEach(dragon => {
      if (dragon?.direction === 'down') {
        this.fireballCooldown += app.deltaTime;
        if (this.fireballCooldown > Math.random() * 1000 + 1000) {
          this.fireballCooldown = 0;
          this.spawnFireball(dragon, dragon.name === 'RedDragon' ? 'fireball' : 'iceball');
        }
      }
    })
  },

  // プレイヤーの初期化
  setupPlayer: function() {
    this.player = {
      HP: {
        value: 50,
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
    .setPosition(320, config.screen.height - 50)
    .addChildTo(this)
  },

  // ドラゴン（複数体）の初期化
  setupDragons: function() {
    this.dragons = [
      Dragon({ HP: 2000, size: 256, name: 'RedDragon', color: 'red' }),
      Dragon({ HP: 3000, size: 256, name: 'BlueDragon', color: 'blue' }),
    ];

    this.dragons.forEach((dragon, idx) => {
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

      const x = this.gridX.span(Math.floor(Math.random() * 3) + 1);
      const y = this.gridX.span(Math.floor(Math.random() * 3) + 1);
      dragon.setPosition(x, y)
    });

    this.dragons.forEach(dragon => {
      // 手前に表示したいのでここで追加
      dragon.addChildTo(this)
    })
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

  updateFireballs: async function(app) {
    this.fireballs.forEach(async (fireball, index) => {
      fireball.move();
      if (fireball.hitTestElement(this.paddle) && !this.isInvincible) {
        if (!(fireball.bottom > this.paddle.top + 20)) return;
        const { stopDuration, shakeDuration, shakeStrength } = config.hitStop.small
        this.player.HP.value -= 10;
        this.paddleReflectSound.play();
        this.isHitStop = true
        await this.pause(stopDuration)
        fireball.remove();
        this.fireballs.splice(index, 1);
        await this.shake(shakeDuration, shakeStrength);
        this.isHitStop = false
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
      this.dragons.forEach(async (dragon, idx) => {
        if (this.isHitStop) return
        if (!dragon) return
        if (this.checkDragonCollision(ball, dragon)) {
          const { stopDuration, shakeDuration, shakeStrength } = config.hitStop.small
          this.dragonSound.play()
          await this.pause(stopDuration)
          dragon.remove();
          this.dragons[idx] = null;
          await this.shake(shakeDuration, shakeStrength);
        }
      })
    }
    this.checkWallCollision(ball);
  },

  gameClear: async function() {
    const { stopDuration, shakeDuration, shakeStrength } = config.hitStop.large

    // TODO: ロジックを変える必要がある
    this.isGameClear = true

    this.dragonSound.play()
    await this.pause(stopDuration)
    await this.shake(shakeDuration, shakeStrength);
    this.clearSound.play();
    this.paddle.remove();
    this.removeAllBalls();
    this.removeAllFireballs();

    // TODO: ロジックを変える必要がある
    this.isGameEnd = true
    this.isGameOver = true

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
  isDragonsDead: function() {
    if (this.dragons.every(dragon => (dragon?.HP.value ?? 0) <= 0)) return true

    return false
  },

  // 火の玉を生成する関数
  spawnFireball: function(dragon, skillName) {
    if (this.isGameOver) return;
    const fireball = Fireball(skillName).addChildTo(this);
    fireball.setPosition(dragon.x, dragon.y + dragon.height / 2);
    this.fireballs.push(fireball);
    switch(skillName) {
      case 'fireball': this.fireballSound.play(); break
      case 'iceball': this.iceballSound.play(); break
    }
  },

  // フィールドに存在するすべての火の玉を消す関数
  removeAllFireballs: function() {
    this.fireballs.forEach(ball => ball.remove());
  },

  // 壁との衝突判定
  checkWallCollision: function(ball) {
    this.superMethod('checkWallCollision', ball);
    if (ball.left < 0 || ball.right > config.screen.width || ball.top < 0 || ball.bottom > config.screen.height) {
      ball.isOnCooldown = false;
    }
  },

  // ドラゴンとの衝突判定
  checkDragonCollision: function(ball, dragon) {
    if (ball.hitTestElement(dragon)) {
      // ボールがドラゴンに当たった際の反射処理
      ball.reflectY();

      // ボールのクールダウンタイマーを開始
      this.startBallCooldown(ball);

      // 一定時間後に再びサウンドを再生可能にする
      if (!this.soundCooldown) {
        this.soundCooldown = true;
        setTimeout(() => {
          this.soundCooldown = false;
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
    this.speed = config.scene.boss.attack.speed;
    this.anim = FrameAnimation(`${skillName}_ss`).attachTo(this);
    this.anim.gotoAndPlay(skillName);
    this.anim.fit = false;
    this.setSize(192, 192);

    // 当たり判定のサイズ（スプライトサイズより小さく設定）
    this.hitAreaRadius = 50;  // ここで当たり判定の大きさを設定
  },

  move: function() {
    this.y += this.speed;  // 火の玉は下方向に移動
    if (this.y > config.screen.height) {
      this.remove();  // 画面外に出たら火の玉を削除
    }
  },

  // カスタムの当たり判定メソッド
  hitTestElement: function(target) {
    // スプライトの見た目の大きさではなく、カスタムの判定範囲を使用
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.hitAreaRadius + target.width / 2;
  },
});

phina.define('Dragon', {
  superClass: 'Sprite',

  init: function({
    HP = 1000,
    size = 512,
    name = 'RedDragon',
    color = 'red',
    direction = 'up',
    speed = 3,
  }){
    this.superInit(name);
    this.setOrigin(0.5, 0.5);
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
    this.anim.fit = false;
    this.setSize(size, size);

    // 当たり判定のサイズ（スプライトサイズより小さく設定）
    this.hitAreaRadius = 200;  // ここで当たり判定の大きさを設定
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
    if (this.y >= config.screen.height - this.height / 2 - 300) {
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
      case 'up': this.fly1(); break;
      case 'down': this.fly3(); break;
      case 'left': this.fly4(); break;
      case 'right': this.fly2(); break;
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

  // カスタムの当たり判定メソッド
  hitTestElement: function(target) {
    // スプライトの見た目の大きさではなく、カスタムの判定範囲を使用
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.hitAreaRadius + target.width / 2;
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

  // 値をmin, maxの範囲内に収めるメソッド
  _clamp: function(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
});
