import { Scene } from 'phaser'
import { Icon } from '../entities/Icon'
import { AntiVirus } from '../entities/AntiVirus'

import { PaintWindow } from '../entities/PaintWindow'
import { x, y, w, h } from '../constants'
import { Tacky } from '../entities/Tacky'
import { Alert } from '../entities/Alert'

const DEBUG = true
const TIMESCALE = 1

export class Game extends Scene {
  antivirus: AntiVirus
  paint: PaintWindow
  virusAlert: Alert
  aboutAlert: Alert
  tacky: Tacky

  constructor() {
    super('Game')
  }

  create() {
    this.cameras.main.setRoundPixels(false)

    this.data.set('wave', 0)
    this.data.set('level', 0)
    this.createAnimations()

    this.virusAlert = new Alert(this, 'virus')
    this.aboutAlert = new Alert(this, 'about')

    const title = this.add.image(160, 100, 'title').setAlpha(0)

    this.time.addEvent({
      delay: 500,
      repeat: -1,
      callback: () => {
        if (this.scale.zoom !== this.scale.getMaxZoom())
          this.scale.setZoom(this.scale.getMaxZoom())
      },
    })

    this.tweens.timeScale = TIMESCALE
    this.time.timeScale = TIMESCALE

    if (DEBUG) {
      this.showDesktop()
    } else {
      this.tweens.addCounter({
        from: 0,
        to: 10,
        delay: 500,
        ease: Phaser.Math.Easing.Quadratic.In,
        duration: 2000,
        onUpdate: (_, b) => {
          title.setAlpha(Math.floor(b.value) / 10)
        },
        onComplete: () => {
          this.tweens.addCounter({
            from: 10,
            to: 0,
            delay: 1000,
            ease: Phaser.Math.Easing.Quadratic.In,
            duration: 2000,
            onUpdate: (_, b) => {
              title.setAlpha(Math.floor(b.value) / 10)
            },
            onComplete: () => {
              this.showDesktop()
            },
          })
        },
      })
    }
  }

  async showDesktop() {
    new Icon(this, 5, 2, 'help', 'about', () => {
      this.aboutAlert.show()
    })

    if (!DEBUG)
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))

    new Icon(this, 5, 55, 'painty', 'painty', () => {
      if (!this.aboutAlert.open) {
        this.paint = new PaintWindow(this, x, y, w, h)
        this.events.emit('paintopened')
      }
    })

    if (!DEBUG)
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))

    this.tacky = new Tacky(this)

    if (!DEBUG)
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))

    this.runIntro()
  }

  async runIntro() {
    if (!DEBUG) {
      await this.tacky.say('Welcome!')
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))
      await this.tacky.say('Open paint and draw me a picture!')

      if (!this.paint) {
        await new Promise((resolve) => {
          this.events.once('paintopened', resolve)
        })
      }

      await new Promise((resolve) => this.time.delayedCall(30000, resolve))

      this.virusAlert.show()

      await this.tacky.say('Oh, looks like we need to remove some viruses')
      await this.tacky.say(
        'Are you surprised? This is blundersoft painty-virus!',
      )
      await this.tacky.say('Its supposed to do that!')

      this.events.emit('virusalertshowbutton')

      await new Promise((resolve) => {
        this.events.once('virusokclicked', resolve)
      })
    }

    if (!this.paint) {
      this.paint = new PaintWindow(this, x, y, w, h)
    }

    this.antivirus = new AntiVirus(this)
    this.paint.clear()
  }

  createAnimations() {
    if (this.anims.exists('tacky')) return

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
