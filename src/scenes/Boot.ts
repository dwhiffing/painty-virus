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
    this.load.spritesheet('icons', 'icons.png', {
      frameHeight: 16,
      frameWidth: 16,
    })
    this.load.bitmapFont('clarity', 'clarity.png', 'clarity.xml')
  }

  create() {
    // this.scene.start('Menu')
    this.scene.start('Game')
  }
}
