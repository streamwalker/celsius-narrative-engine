/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Row, Column, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'celsius-narrative-engine'

interface OrderItem {
  name: string
  quantity: number
  price: string
}

interface OrderConfirmationProps {
  name?: string
  orderId?: string
  items?: OrderItem[]
  total?: string
}

const OrderConfirmationEmail = ({
  name,
  orderId,
  items = [],
  total,
}: OrderConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your order from {SITE_NAME} is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Order confirmed</Heading>
        <Text style={text}>
          {name ? `Thanks for your order, ${name}!` : 'Thanks for your order!'} We've received it
          and will let you know once it ships.
        </Text>
        {orderId && <Text style={meta}>Order #{orderId}</Text>}

        {items.length > 0 && (
          <Section>
            <Hr style={hr} />
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column>
                  <Text style={itemText}>
                    {item.name} × {item.quantity}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={itemText}>{item.price}</Text>
                </Column>
              </Row>
            ))}
            <Hr style={hr} />
            {total && (
              <Row>
                <Column>
                  <Text style={totalText}>Total</Text>
                </Column>
                <Column align="right">
                  <Text style={totalText}>{total}</Text>
                </Column>
              </Row>
            )}
          </Section>
        )}

        <Text style={footer}>
          Reply to this email if anything looks off and we'll sort it out.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderConfirmationEmail,
  subject: (data: Record<string, any>) =>
    data?.orderId ? `Order #${data.orderId} confirmed` : 'Your order is confirmed',
  displayName: 'Order confirmation',
  previewData: {
    name: 'Jane',
    orderId: 'A1029',
    items: [
      { name: 'Issue #1 — Children of Aquarius', quantity: 1, price: '$9.99' },
      { name: 'Issue #2 — Darker Ages', quantity: 2, price: '$19.98' },
    ],
    total: '$29.97',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const meta = { fontSize: '13px', color: '#9a9aa5', margin: '0 0 12px' }
const itemRow = { margin: '0' }
const itemText = { fontSize: '14px', color: '#0a0a14', margin: '6px 0' }
const totalText = { fontSize: '15px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '6px 0' }
const hr = { borderColor: '#e6e6ea', margin: '16px 0' }
const footer = { fontSize: '12px', color: '#9a9aa5', margin: '32px 0 0', lineHeight: '1.5' }
