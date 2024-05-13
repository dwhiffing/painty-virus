import { Scene } from 'phaser'

export class Boot extends Scene {
  constructor() {
    super('Boot')
  }

  init() {
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff)

    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff)

    this.load.on('progress', (progress: number) => {
      bar.width = 4 + 460 * progress
    })
  }

  preload() {
    this.load.image('icon', 'favicon.png')
    this.load.setPath('assets')

    this.load.audio('startup', 'startup.wav')
    this.load.audio('alert', 'sfx/alert.wav')
    this.load.audio('bsod', 'sfx/bsod.wav')
    this.load.audio('mouse-click', 'sfx/mouse-click.wav')
    this.load.audio('shutdown', 'sfx/shutdown.wav')
    this.load.audio('talk', 'sfx/talk.wav')

    this.load.image('goat', 'goat.png')
    this.load.image('alert', 'alert.png')
    this.load.image('title', 'title.png')
    this.load.image('painty', 'painty.png')
    this.load.image('help', 'help.png')
    this.load.spritesheet('tacky', 'tacky.png', {
      frameHeight: 40,
      frameWidth: 30,
    })
    this.load.spritesheet('icons', 'icons.png', {
      frameHeight: 16,
      frameWidth: 16,
    })
    this.load.spritesheet('enemies', 'enemies.png', {
      frameHeight: 32,
      frameWidth: 32,
    })
    this.load.bitmapFont('clarity', 'clarity.png', 'clarity.xml')
  }

  create() {
    // this.scene.start('Menu')
    this.scene.start('Game')
  }
}
