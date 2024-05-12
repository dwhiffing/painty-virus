import { Scene } from 'phaser'
import { Icon } from '../entities/Icon'
import { AntiVirus } from '../entities/AntiVirus'

import { PaintWindow } from '../entities/PaintWindow'
import { x, y, w, h } from '../constants'
import { Tacky } from '../entities/Tacky'
import { Alert } from '../entities/Alert'

const DEBUG = false
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

    this.data.set('gameovered', false)
    this.data.set('wave', 0)
    this.data.set('level', 0)
    this.data.set('lives', 3)

    this.input.keyboard?.on('keydown', (e: any) => {
      if (typeof +e.key === 'number' && +e.key < 7)
        this.data.set('toolIndex', +e.key - 1)
    })
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

      await new Promise((resolve) => this.time.delayedCall(20000, resolve))

      this.virusAlert.show()

      await new Promise((resolve) => this.time.delayedCall(2000, resolve))

      await this.tacky.say('Oh, looks like we need to remove some viruses')

      await new Promise((resolve) => this.time.delayedCall(1000, resolve))

      await this.tacky.say(
        'Are you surprised? This is blundersoft painty-virus!',
      )
      await new Promise((resolve) => this.time.delayedCall(500, resolve))
      await this.tacky.say('Its supposed to do that!')
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))

      this.events.emit('virusalertshowbutton')

      await new Promise((resolve) => {
        this.events.once('virusokclicked', resolve)
      })
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))
    }

    if (DEBUG) {
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
      frameRate: 5,
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

  async loseLife() {
    if (this.data.get('gameovered') || this.data.get('lives') === 0) return

    this.data.set('lives', this.data.get('lives') - 1)

    if (this.data.get('lives') <= 0) {
      this.gameover()
    } else {
      await this.tacky.say(`whoops!\n${this.data.get('lives')} lives left`)
      this.antivirus.checkNextWave()
    }
  }

  gameover() {
    if (this.data.get('gameovered')) return

    this.data.set('gameovered', true)

    this.add
      .graphics()
      .fillStyle(0x0000ff)
      .fillRect(0, 0, 320, 200)
      .setDepth(99998)

    this.add
      .bitmapText(
        160,
        100,
        'clarity',
        'An Error has occured!\n\n\n\nError: 0E : 06F : GAMEOVER\n\n\n\n\nPress any key to continue...',
        8,
      )
      .setDepth(99999)
      .setOrigin(0.5)
      .setCenterAlign()

    this.input.once('pointerdown', () => {
      window.location.reload()
      // this.scene.restart()
    })
  }

  update() {
    this.antivirus?.update()
    this.paint?.update()
  }
}
