import { Scene } from 'phaser'
import { Icon } from '../entities/Icon'
import { AntiVirus } from '../entities/AntiVirus'

import { PaintWindow } from '../entities/PaintWindow'
import { x, y, w, h } from '../constants'
import { Tacky } from '../entities/Tacky'

export class Game extends Scene {
  antivirus: AntiVirus
  paint: PaintWindow
  tacky: Tacky

  constructor() {
    super('Game')
  }

  create() {
    this.cameras.main.setRoundPixels(false)

    this.data.set('wave', 0)
    this.data.set('level', 0)
    this.createAnimations()

    this.tacky = new Tacky(this)

    new Icon(this, 5, 5, () => {
      new PaintWindow(this, x, y, w, h)
    })

    new Icon(this, 5, 25, () => {
      // TODO: why do i need to open a paint window here?
      new PaintWindow(this, x, y, w, h)
      this.antivirus = new AntiVirus(this)
    })

    this.runIntro()
  }

  async runIntro() {
    await this.tacky.say('Welcome!')
    await new Promise((resolve) => this.time.delayedCall(1000, resolve))
    await this.tacky.say('Open paint and draw me a picture!')
    // clippy says "Welcome"
    // clippy says "Open paint and draw me a picture!"
    // clippy waits until you open paint
    // clippy waits 90 seconds
    // alert opens, says "Last PaintUI Virus scan was 90 days ago"
    // clippy says "its supposed to do that!"
    // clippy waits until player clicks "Delete viruses"
    // Game switches to anti virus mode
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
      key: `tacky`,
      frameRate: 2,
      repeat: -1,
      frames: this.anims.generateFrameNumbers('tacky', {
        frames: [0, 1],
      }),
    })

    this.anims.create({
      key: `tacky-idle`,
      frameRate: 2,
      repeat: -1,
      frames: this.anims.generateFrameNumbers('tacky', {
        frames: [0],
      }),
    })

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
