import { config } from '../config.js';
import { assets } from '../assets.js';

// ステージ選択画面
phina.define("TitleScene", {
  superClass: 'GeneralScene',

  init: function(options) {
    this.superInit(options);

    const { screen, button } = config;

    // 1行にボタンを何個配置するか
    const buttonRows = 3;

    // タイトル表示
    Label({
      text: 'Breakout',
      fontSize: 50,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), 100);

    // ステージ選択のタイトル
    Label({
      text: 'ステージを選択してください',
      fontSize: 40,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(3));

    // ステージボタンの設定
    const buttonSpacingX = (screen.width - button.width * buttonRows) / (buttonRows + 1);
    const buttonSpacingY = button.height;

    // ボタンを配置する開始位置
    const startX = buttonSpacingX + button.width / 2;
    const startY = 300;

    // ボタンの色を変化させるための色相の開始値と変化量
    const hueStart = 0;  // 色相の開始値 (赤)
    const hueStep = 30;  // 各ボタンごとに色相を30度ずつ変化させる

    // 画像の数に応じてステージ数を決める
    const stageCount = Object.keys(assets.image).length - 4;

    for (let i = 0; i < stageCount; i++) {
      const col = i % buttonRows;
      const row = Math.floor(i / buttonRows);

      // 各ボタンに対して色相を少しずつ変更する (HSL形式)
      const hue = (hueStart + i * hueStep) % 360; // 色相が360度を超えたらリセット
      const color = `hsl(${hue}, 80%, 70%)`;  // 彩度80%, 明度70%で色を設定

      const sceneName = i !== (stageCount - 1) ? 'main' : 'boss';
      const sceneParams = { stage: i + 1 };
      const buttonX = startX + col * (button.width + buttonSpacingX);
      const buttonY = startY + row * buttonSpacingY

      Button({
        text: `ステージ ${i + 1}`,
        width: button.width,
        height: button.height,
        fontSize: button.fontSize,
        fill: color,
      })
      .addChildTo(this)
      .setPosition(buttonX, buttonY)
      .on('push', () => {
        this.sounds.decision.play();
        this.exit(sceneName, sceneParams);
      });
    }
  },
});