import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          background: '#0B1120',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.5px',
            lineHeight: 1,
          }}
        >
          SR
        </span>
      </div>
    ),
    { ...size }
  )
}
