import { Client, Environment } from 'squareup'

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
})

export async function POST(request) {
  try {
    const { packageType, playerName, playerEmail, playerPhone, sourceId } = await request.json()

    const packages = {
      '3shots': { amount: 3000n, label: '3 Shots' },
      '6shots': { amount: 5000n, label: '6 Shots' },
      '10shots': { amount: 8000n, label: '10 Shots' },
    }

    const pkg = packages[packageType]
    if (!pkg) {
      return Response.json({ error: 'Invalid package' }, { status: 400 })
    }

    const { result } = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: pkg.amount,
        currency: 'USD',
      },
      note: `Million Dollar Mountain Challenge - ${pkg.label} - ${playerName}`,
    })

    return Response.json({ success: true, paymentId: result.payment.id })
  } catch (error) {
    console.error('Payment error:', error)
    return Response.json({ error: 'Payment failed' }, { status: 500 })
  }
}
