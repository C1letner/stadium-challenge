import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { packageType, playerName, playerEmail, playerPhone, sourceId } = await request.json()

    const packages = {
      '3shots': { amount: 3000, label: '3 Shots', shots: 3, price: '$30' },
      '6shots': { amount: 5000, label: '6 Shots', shots: 6, price: '$50' },
      '10shots': { amount: 8000, label: '10 Shots', shots: 10, price: '$80' },
    }

    const pkg = packages[packageType]
    if (!pkg) {
      return Response.json({ error: 'Invalid package' }, { status: 400 })
    }

    const response = await fetch('https://connect.squareup.com/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: crypto.randomUUID(),
        amount_money: {
          amount: pkg.amount,
          currency: 'USD',
        },
        location_id: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
        note: `Million Dollar Mountain Challenge - ${pkg.label} - ${playerName}`,
      }),
    })

    const data = await response.json()

    if (data.errors) {
      console.error('Square errors:', data.errors)
      return Response.json({ error: data.errors[0].detail }, { status: 500 })
    }

    // Send confirmation email
    await resend.emails.send({
      from: 'Million Dollar Mountain Challenge <info@mrluckysgolf.com>',
      to: playerEmail,
      subject: '🏌️ You\'re registered for the Million Dollar Mountain Challenge!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111827; color: #ffffff; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4ade80; font-size: 28px; margin-bottom: 8px;">⛳ Million Dollar Mountain Challenge</h1>
            <p style="color: #9ca3af; font-size: 16px;">Mr Lucky's Golf</p>
          </div>
          
          <h2 style="color: #ffffff; font-size: 22px;">You're registered, ${playerName}! 🎉</h2>
          
          <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #4ade80; font-weight: bold; margin: 0 0 8px 0;">Your Package</p>
            <p style="color: #ffffff; font-size: 20px; margin: 0;">${pkg.label} — ${pkg.price}</p>
          </div>

          <h3 style="color: #4ade80;">📍 Next Steps</h3>
          <ol style="color: #d1d5db; line-height: 2;">
            <li>Visit Mr Lucky's Golf simulator at your scheduled time</li>
            <li>Check in at the front desk and show this email</li>
            <li>Take your ${pkg.shots} shots at the closest-to-the-pin challenge</li>
            <li>Your best shot will appear on the live leaderboard</li>
          </ol>

          <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #4ade80; font-weight: bold; margin: 0 0 8px 0;">🏆 The Prize</p>
            <p style="color: #ffffff; margin: 0;">The top 20 qualifiers will compete for <strong>$1,000,000</strong> at the live in-person finale!</p>
          </div>

          <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
            Questions? Contact us at info@mrluckysgolf.com<br>
            Mr Lucky's Golf | 1327 E. White Mountain Blvd
          </p>
        </div>
      `,
    })

    return Response.json({ success: true, paymentId: data.payment.id })
  } catch (error) {
    console.error('Payment error:', error)
    return Response.json({ error: error.message || 'Payment failed' }, { status: 500 })
  }
}