export const config = {
  screen: {
    width: 640,
    height: 1024,
    backgroundColor: '#444',
  },
  scene: {
    title: {
    },
    main: {
      padding: 50,
      timeLimit: 40,
      block: {
        rows: 10,
        cols: 10,
        size: 26.75,
      },
    },
    boss: {
      attack: {
        speed: 12,
      },
    },
  },
  ball: {
    initCount: 3,
    initSpeed: 12,
    maxSpeed: 24,
    radius: 14,
    normal: {
      splitCount: 3,
      color: 'white',
    },
    golden: {
      splitCount: 3,
      color: 'gold',
    },
    purple: {
      splitCount: 10,
      color: 'purple',
    },
  },
  paddle: {
    width: 150,
    height: 32,
    speed: 10,
    color: 'blue',
  },
  dragon: {
    hp: 100,
    attackPower: 20,
    shakeTime: 500,
  },
  game: {
    shakeTime: 150,
    maxLevel: 10,
  },
  button: {
    width: 180,
    height: 80,
    fontSize: 30,
  },
  hitStop: {
    small: {
      stopDuration: 0,
      shakeDuration: 100,
      shakeStrength: 10,
    },
    large: {
      stopDuration: 500,
      shakeDuration: 2000,
      shakeStrength: 25,
    },
  },
  // パラメータ内での計算や参照
  get combinedSpeed() {
    return this.paddle.speed + this.ball.speed;
  },
};