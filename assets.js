export const assets = {
  image: {
    // 宇宙
    'background': 'https://preview.redd.it/29zh4v56mo951.jpg?width=640&crop=smart&auto=webp&s=0f3122b8c447cd88c90e825f31f7737c06538693',
    // ドラゴン
    'RedDragon': './assets/dragon.png',
    // ドラゴン（蒼）
    'BlueDragon': './assets/dragon2.png',
    // 火の玉
    'fireball': './assets/fireball3.png',
    // 氷の玉
    'iceball': './assets/iceball.png',
    // エジソン
    'background01': 'https://amanaimages.com/pickup/img/historicalfigures/bnr_kagaku_GRA6070701900M.jpg',
    // アインシュタイン
    'background02': 'https://i.ytimg.com/vi/YX72DdfSdMU/maxresdefault.jpg',
    // 大谷翔平
    // 'background03': 'https://p.potaufeu.asahi.com/d473-p/picture/27390318/13b16927a46a8b6f7380262da5ec9957_640px.jpg',
    // ピカソ
    // 'background04': 'https://cdn.shopify.com/s/files/1/0554/9057/6433/files/e8131b5f33b316a85a80c11dd0872991_480x480.jpg?v=1713847065',
    // 藤井聡太
    // 'background05': 'https://cdn.mainichi.jp/vol1/2023/05/23/20230523mpj00m040014000p/9.jpg?1',
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
    'iceball_sound': 'assets/氷魔法で凍結.mp3',  // サウンドファイルのパス
    // 'ball_return': 'assets/ball_return.mp3',  // サウンドファイルのパス
    // 'heaven_and_hell': 'assets/heaven_and_hell.wav',  // サウンドファイルのパス
  },
  spritesheet: {
    'RedDragonSS': {
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
    'BlueDragonSS': {
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
    // fireball_ss: {
    //   frame: {
    //     width: 512,
    //     height: 512,
    //     cols: 6,
    //     rows: 1,
    //   },
    //   animations: {
    //     fireball: {
    //       frames: [0, 1, 2, 3, 4, 5],
    //       frequency: 6,
    //     }
    //   },
    // },
    fireball_ss: {
      frame: {
        width: 192,
        height: 192,
        cols: 5,
        rows: 6,
      },
      animations: {
        fireball: {
          frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
          frequency: 3,
        }
      },
    },
    iceball_ss: {
      frame: {
        width: 192,
        height: 192,
        cols: 5,
        rows: 2,
      },
      animations: {
        iceball: {
          frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          frequency: 5,
        }
      },
    },
  },
};