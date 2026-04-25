export async function POST(request) {
  try {
    const { packageType, playerName, sourceId } = await request.json()

    const packages = {
      '3shots': { amount: 3000, label: '3 Shots' },
      '6shots': { amount: 5000, label: '6 Shots' },
      '10shots': { amount: 8000, label: '10 Shots' },
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

    return Response.json({ success: true, paymentId: data.payment.id })
  } catch (error) {
    console.error('Payment error:', error)
    return Response.json({ error: error.message || 'Payment failed' }, { status: 500 })
  }
}