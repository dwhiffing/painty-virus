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

    this.load.audio('startup', 'sfx/startup.mp3')
    this.load.audio('alert', 'sfx/alert.wav')
    this.load.audio('bsod', 'sfx/bsod.mp3')
    this.load.audio('mouse-click', 'sfx/mouse-click.wav')
    this.load.audio('enemy-spawn', 'sfx/enemy-spawn.wav')
    this.load.audio('enemy-spawn2', 'sfx/enemy-spawn2.wav')
    this.load.audio('shutdown', 'sfx/shutdown.wav')
    this.load.audio('talk', 'sfx/talk.wav')
    this.load.audio('boss-spawn', 'sfx/boss-spawn.wav')
    this.load.audio('boss-dead', 'sfx/boss-dead.wav')
    this.load.audio('enemy-spawn3', 'sfx/enemy-spawn3.wav')
    this.load.audio('shoot-bucket', 'sfx/bucket-shoot.wav')
    this.load.audio('disabled', 'sfx/click-disabled.wav')
    this.load.audio('enemy-dead', 'sfx/enemy-dead.wav')
    this.load.audio('enemy-hit', 'sfx/enemy-hit.wav')
    this.load.audio('shoot-line', 'sfx/shoot-line.wav')
    this.load.audio('bullet-explode', 'sfx/bullet-explode.wav')
    this.load.audio('shoot-eraser', 'sfx/shoot-eraser.wav')
    this.load.audio('mine-place', 'sfx/mine-place.wav')
    this.load.audio('mine-explode', 'sfx/mine-explode.wav')
    this.load.audio('lose-life', 'sfx/lose-life.wav')
    this.load.audio('next-level', 'sfx/next-level.wav')

    this.load.image('goat', 'goat.png')
    this.load.image('pixel', 'pixel.png')
    this.load.image('alert', 'alert.png')
    this.load.image('spray', 'spray.png')
    this.load.image('spray-top', 'spray-top.png')
    this.load.image('mine', 'mine.png')
    this.load.image('mine-outline', 'mine-outline.png')
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
    this.load.spritesheet('splats', 'splats.png', {
      frameHeight: 25,
      frameWidth: 25,
    })
    this.load.bitmapFont('clarity', 'clarity.png', 'clarity.xml')
  }

  create() {
    // this.scene.start('Menu')
    this.scene.start('Game')
  }
}
