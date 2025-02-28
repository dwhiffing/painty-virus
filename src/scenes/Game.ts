import { Scene } from 'phaser'
import { Icon } from '../entities/Icon'
import { AntiVirusWindow } from '../entities/AntiVirusWindow'

import { PaintWindow } from '../entities/PaintWindow'
import { x, y, w, h, CURSOR_ORIGINS, CURSOR_DEPTH } from '../constants'
import { Tacky } from '../entities/Tacky'
import { Alert } from '../entities/Alert'
import { Enemy } from '../entities/Enemy'

const SKIP_MENU = false
const MUTED = false
let SKIP_DESKTOP = false
export const TIMESCALE = 1

export const isInCanvas = (p: { x: number; y: number }) => {
  if (p.x < x + 29 || p.x > x + h + 11) return false
  if (p.y < y + 16 || p.y > h + y - 3) return false
  return true
}

export class Game extends Scene {
  antivirus: AntiVirusWindow
  paint: PaintWindow
  virusAlert: Alert
  aboutAlert: Alert
  tacky: Tacky
  cursor: Phaser.GameObjects.Sprite

  constructor() {
    super('Game')
  }

  create() {
    this.cameras.main.setRoundPixels(false)
    this.sound.pauseOnBlur = false

    this.sound.setMute(MUTED)

    this.cursor = this.add
      .sprite(0, 0, 'icons', 6)
      .setOrigin(0.2, 0.1)
      .setDepth(CURSOR_DEPTH + 2)

    this.data.set('gameovered', false)
    this.data.set('wave', 0)
    this.data.set('level', 0)
    this.data.set('lives', 3)

    this.input.keyboard?.on('keydown', (e: any) => {
      if (typeof +e.key === 'number' && +e.key < 7) {
        this.data.set('toolIndex', +e.key - 1)
      }

      if (e.key === 'm') {
        this.sound.setMute(!this.sound.mute)
      }
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

    this.input.on('pointermove', this.setCursor.bind(this))
    this.data.events.on('changedata-toolIndex', this.setCursor.bind(this))

    if (SKIP_MENU) {
      this.showDesktop()
    } else {
      this.tweens.addCounter({
        from: 0,
        to: 10,
        delay: 100,
        ease: Phaser.Math.Easing.Quadratic.In,
        duration: 1200,
        onUpdate: (_, b) => title.setAlpha(Math.floor(b.value) / 10),
        onComplete: async () => {
          const blink = this.tweens.addCounter({
            from: 1,
            to: 0,
            repeat: -1,
            onUpdate: (_, b) =>
              clickToStart.setAlpha(Math.round(b.value) + 0.3),
          })

          await new Promise((resolve) => this.input.on('pointerdown', resolve))

          blink.destroy()
          clickToStart.setAlpha(1)

          this.tweens.addCounter({
            from: 10,
            to: 0,
            delay: 0,
            ease: Phaser.Math.Easing.Quadratic.In,
            duration: 1200,
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

  setCursor() {
    this.cursor.setPosition(
      Math.floor(this.input.activePointer.x),
      Math.floor(this.input.activePointer.y),
    )

    const inCanvas = isInCanvas(this.input.activePointer)
    const frame =
      inCanvas &&
      !this.data.get('gameovered') &&
      !this.data.get('forcecursor') &&
      !this.aboutAlert.open
        ? this.data.get('toolIndex') ?? 6
        : 6

    this.cursor.setFrame(frame).setOrigin(...CURSOR_ORIGINS[frame])
  }

  async showDesktop() {
    this.game.events.on('blur', () => {
      this.scene.pause()
    })

    this.game.events.on('focus', () => {
      this.scene.resume()
    })

    new Icon(this, 5, 2, 'help', 'about', () => {
      if (!this.virusAlert.open) this.aboutAlert.show()
    })

    if (!SKIP_DESKTOP) {
      this.sound.play('startup', { volume: 0.6, rate: 1 })

      await this.sleep(1000)
    }

    new Icon(this, 5, 55, 'painty', 'painty', () => {
      if (!this.data.get('showfullintro')) SKIP_DESKTOP = true

      if (!this.aboutAlert.open && !this.paint) {
        this.paint = new PaintWindow(this, x, y, w, h)
        this.events.emit('paintopened')
      }
    })

    if (!SKIP_DESKTOP) await this.sleep(1000)

    this.tacky = new Tacky(this)

    if (!SKIP_DESKTOP) await this.sleep(1000)

    this.runIntro()
  }

  async runIntro() {
    if (!SKIP_DESKTOP) await this.tacky.say('Welcome!')
    if (!SKIP_DESKTOP) {
      await this.tacky.say('My name is Tacky.')
      this.data.set('showfullintro', true)

      await this.sleep(1000)

      await this.tacky.say(
        "To get to know each other, why don't you Open painty and draw me a picture?",
      )

      if (!this.paint) {
        await new Promise((resolve) => this.events.once('paintopened', resolve))
      }

      await this.sleep(5000)

      await this.tacky.say(
        'Make sure you try all the different colors and tools!',
      )

      await this.sleep(10000)

      await this.tacky.say(
        this.data.get('drewapicture')
          ? "Wow, that's really coming along!"
          : "It looks like you haven't started your painting yet.  Would you like some help with that?",
      )

      await this.sleep(10000)

      this.data.set('forcecursor', true)
      this.setCursor()
      this.sound.play('alert')
      this.virusAlert.show()

      await this.sleep(2000)

      await this.tacky.say('Oh, looks like painty detected some viruses')

      await this.sleep(500)

      await this.tacky.say(
        'Are you surprised? This is blundersoft painty-virus!',
      )
      await this.tacky.say("It's supposed to do that!")
      await this.sleep(500)

      await this.tacky.say(
        'Use the different paint tools to eliminate the viruses.',
      )
      await this.tacky.say(
        'Be sure not to let them out of the canvas, I can only handle a few escapees...',
      )

      this.events.emit('virusalertshowbutton')

      await new Promise((resolve) =>
        this.events.once('virusokclicked', resolve),
      )
      await this.sleep(1000)
      this.data.set('forcecursor', false)
      this.setCursor()
    }

    if (SKIP_DESKTOP && !this.paint) {
      this.paint = new PaintWindow(this, x, y, w, h)
    }

    this.paint.clear()
    this.antivirus = new AntiVirusWindow(this)
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

    this.cameras.main.shake(400, 0.01, true)

    this.data.set('lives', this.data.get('lives') - 1)
    const lives = this.data.get('lives')

    if (lives < 0) {
      this.gameover()
    } else {
      this.sound.play('lose-life', { rate: 1.3, volume: 0.6 })
      await this.sleep(300)
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
      .setDepth(CURSOR_DEPTH + 3)
      .setAlpha(0)

    const enemies = this.antivirus.enemies.getChildren() as Enemy[]
    enemies.forEach((c) => {
      c.stunned = true
    })
    this.tweens.add({ targets: black, alpha: 1 })

    await this.sleep(3000)
    black.setAlpha(0)

    this.setCursor()
    this.sound.play('bsod')

    this.add
      .graphics()
      .fillStyle(0x0000ff)
      .fillRect(0, 0, 320, 200)
      .setDepth(CURSOR_DEPTH)

    this.add
      .bitmapText(
        160,
        100,
        'clarity',
        'An Error has occured!\n\n\n\nError: 0E : 06F : GAMEOVER\n\n\n\n\nClick to continue...',
        8,
      )
      .setDepth(CURSOR_DEPTH + 1)
      .setOrigin(0.5)
      .setCenterAlign()

    this.input.once('pointerdown', () => {
      window.location.reload()
      // this.scene.restart()
    })
  }

  sleep(amount: number) {
    return new Promise((resolve) => {
      const event = this.time.delayedCall(amount, resolve)

      this.tacky?.once('pointerdown', () => {
        event.destroy()
        resolve(null)
      })
    })
  }

  update() {
    this.antivirus?.update()
    this.paint?.update()
  }
}
