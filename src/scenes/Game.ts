import { Scene } from 'phaser'
import { Icon } from '../entities/Icon'
import { AntiVirus } from '../entities/AntiVirus'

import { PaintWindow } from '../entities/PaintWindow'
import { x, y, w, h } from '../constants'
import { Tacky } from '../entities/Tacky'
import { Alert } from '../entities/Alert'
import { Enemy } from '../entities/Enemy'

const SKIP_MENU = false
let SKIP_DESKTOP = false
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

    this.sound.pauseOnBlur = false

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
    const clickToStart = this.add
      .bitmapText(117, 150, 'clarity', 'Click to start', 8)
      .setAlpha(0)

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

    this.input.on('pointerdown', () =>
      this.sound.play('mouse-click', { rate: 1.5 + Phaser.Math.RND.frac() }),
    )

    if (SKIP_MENU) {
      this.showDesktop()
    } else {
      this.tweens.addCounter({
        from: 0,
        to: 10,
        delay: 800,
        ease: Phaser.Math.Easing.Quadratic.In,
        duration: 2000,
        onUpdate: (_, b) => title.setAlpha(Math.floor(b.value) / 10),
        onComplete: async () => {
          const blink = this.tweens.addCounter({
            from: 1,
            to: 0,
            repeat: -1,
            onUpdate: (_, b) =>
              clickToStart.setAlpha(Math.round(b.value) + 0.3),
          })

          await new Promise((resolve) => {
            this.input.on('pointerdown', resolve)
          })

          blink.destroy()
          clickToStart.setAlpha(1)

          this.tweens.addCounter({
            from: 10,
            to: 0,
            delay: 0,
            ease: Phaser.Math.Easing.Quadratic.In,
            duration: 1500,
            onUpdate: (_, b) => {
              clickToStart.setAlpha(Math.floor(b.value) / 10)
              title.setAlpha(Math.floor(b.value) / 10)
            },
            onComplete: () => {
              clickToStart.destroy()
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

    if (!SKIP_DESKTOP) {
      this.sound.play('startup', { volume: 0.6, rate: 1 })

      await new Promise((resolve) => this.time.delayedCall(1000, resolve))
    }

    new Icon(this, 5, 55, 'painty', 'painty', () => {
      SKIP_DESKTOP = true

      if (!this.aboutAlert.open && !this.paint) {
        this.paint = new PaintWindow(this, x, y, w, h)
        this.events.emit('paintopened')
      }
    })

    if (!SKIP_DESKTOP)
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))

    this.tacky = new Tacky(this)

    if (!SKIP_DESKTOP)
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))

    this.runIntro()
  }

  async runIntro() {
    if (!SKIP_DESKTOP) await this.tacky.say('Welcome!')
    if (!SKIP_DESKTOP) {
      await this.tacky.say('My name is Tacky.')
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))
      await this.tacky.say(
        "To get to know each other, why don't you Open painty and draw me a picture?",
      )

      if (!this.paint) {
        await new Promise((resolve) => {
          this.events.once('paintopened', resolve)
        })
      }

      await new Promise((resolve) => this.time.delayedCall(5000, resolve))

      await this.tacky.say(
        'Make sure you try all the different colors and tools!',
      )

      await new Promise((resolve) => this.time.delayedCall(10000, resolve))

      await this.tacky.say(
        this.data.get('drewapicture')
          ? "Wow, that's really coming along!"
          : "It looks like you haven't started your painting yet.  Would you like some help with that?",
      )

      await new Promise((resolve) => this.time.delayedCall(10000, resolve))

      this.sound.play('alert')
      this.virusAlert.show()

      await new Promise((resolve) => this.time.delayedCall(2000, resolve))

      await this.tacky.say('Oh, looks like painty detected some viruses')

      await new Promise((resolve) => this.time.delayedCall(1000, resolve))

      await this.tacky.say('Are you surprised?')

      await this.tacky.say('This is blundersoft painty-virus!')
      await new Promise((resolve) => this.time.delayedCall(500, resolve))
      await this.tacky.say("It's supposed to do that!")
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))

      await this.tacky.say(
        'Use the different paint tools to eliminate the viruses.',
      )
      await this.tacky.say(
        'Be sure not to let them out of the canvas, I can only handle a few escapees...',
      )

      this.events.emit('virusalertshowbutton')

      await new Promise((resolve) => {
        this.events.once('virusokclicked', resolve)
      })
      await new Promise((resolve) => this.time.delayedCall(1000, resolve))
    }

    if (SKIP_DESKTOP && !this.paint) {
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
    if (this.data.get('gameovered')) return

    this.data.set('lives', this.data.get('lives') - 1)
    const lives = this.data.get('lives')

    if (lives < 0) {
      this.gameover()
    } else {
      this.sound.play('lose-life', { rate: 1.3, volume: 0.6 })
      await new Promise((resolve) => this.time.delayedCall(300, resolve))
      await this.tacky.say(`whoops!`, 1000)
      await this.tacky.say(
        `${lives} ${lives === 1 ? 'life' : 'lives'} left`,
        1500,
      )
      this.antivirus.checkNextWave()
    }
  }

  async gameover() {
    if (this.data.get('gameovered')) return

    this.data.set('gameovered', true)

    this.sound.play('shutdown')
    const black = this.add
      .graphics()
      .fillStyle(0x000000)
      .fillRect(0, 0, 320, 200)
      .setDepth(99997)
      .setAlpha(0)

    const enemies = this.antivirus.enemies.getChildren() as Enemy[]
    enemies.forEach((c) => {
      c.stunned = true
    })
    this.tweens.add({ targets: black, alpha: 1 })

    await new Promise((resolve) => this.time.delayedCall(3000, resolve))
    this.sound.play('bsod')

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
        'An Error has occured!\n\n\n\nError: 0E : 06F : GAMEOVER\n\n\n\n\nClick to continue...',
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
