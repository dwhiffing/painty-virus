export const x = 50
export const y = 10
export const w = 221
export const h = 180

const COLORS = [0x000000, 0xff0000, 0x00ff00, 0x0000ff]

const e = (type: number, color: number) => ({
  type,
  color: COLORS[color],
})

export const LEVELS = [
  [{ enemies: [e(0, 0)] }],
  [
    {
      enemies: [e(1, 1), e(2, 2)],
    },
  ],
  [
    {
      enemies: [e(3, 3), e(4, 0), e(4, 0)],
    },
  ],
]
