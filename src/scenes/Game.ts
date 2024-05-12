import { Scene } from 'phaser'
import { Icon } from '../entities/Icon'
import { AntiVirus } from '../entities/AntiVirus'

import { PaintWindow } from '../entities/PaintWindow'
import { x, y, w, h } from '../constants'

export class Game extends Scene {
  antivirus: AntiVirus
  paint: PaintWindow
  text: Phaser.GameObjects.BitmapText
  constructor() {
    super('Game')
  }

  create() {
    this.cameras.main.setRoundPixels(false)
    this.text = this.add.bitmapText(260, 180, 'clarity', 'Welcome', 8)
    this.data.set('wave', 0)
    this.data.set('level', 0)
    this.createAnimations()

    new Icon(this, 5, 5, () => {
      new PaintWindow(this, x, y, w, h)
    })
    new Icon(this, 5, 25, () => {
      // TODO: why do i need to open a paint window here?
      new PaintWindow(this, x, y, w, h)
      this.antivirus = new AntiVirus(this)
    })
  }

  createAnimations() {
    for (let i = 1; i < 8; i++) {
      this.anims.create({
        key: `enemy${i - 1}`,
        frameRate: 2,
        repeat: -1,
        frames: this.anims.generateFrameNumbers('enemies', {
          frames: [i * 2 - 2, i * 2 - 1],
        }),
      })
    }

    this.anims.create({
      key: `explode`,
      frames: this.anims.generateFrameNumbers('enemies', {
        frames: [14, 15],
      }),
      frameRate: 5,
    })
  }

  update() {
    this.antivirus?.update()
    this.paint?.update()
  }
}
