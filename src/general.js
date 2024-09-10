import { config } from '../config.js';
import { assets } from '../assets.js';

phina.globalize();

// 全シーン共通の処理
phina.define('GeneralScene', {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    // 震動した時に画面外が見えないようにするための余白
    const backgroundPadding = 100;

    this.backgroundImage = Sprite('background')
      .addChildTo(this)
      .setSize(config.screen.width + backgroundPadding * 2, config.screen.height + backgroundPadding * 2)
      .setPosition(config.screen.width / 2 - backgroundPadding, config.screen.height / 2 - backgroundPadding);

    this.sounds = {
      decision: AssetManager.get('sound', 'decision_sound'),
    };
  },
});