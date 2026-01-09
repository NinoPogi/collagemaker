import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import prisma  from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)
    const { id } = evt.data
    const eventType = evt.type

    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data

      await prisma.user.upsert({
        where: { id: id },
        update: {
          email: email_addresses[0].email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : null,
        },
        create: {
          id: id,
          email: email_addresses[0].email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : null,
        },
      })

      console.log(`User created in database: ${id}`)
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data

      await prisma.user.delete({
        where: { id: id as string },
      })

      console.log(`User deleted from database: ${id}`)
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}