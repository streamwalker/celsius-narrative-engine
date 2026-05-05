/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'celsius-narrative-engine'

interface NotificationProps {
  name?: string
  title?: string
  message?: string
  actionUrl?: string
  actionLabel?: string
}

const NotificationEmail = ({
  name,
  title = 'You have a new notification',
  message = 'There is an update waiting for you.',
  actionUrl,
  actionLabel = 'View details',
}: NotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{title}</Heading>
        <Text style={text}>{name ? `Hi ${name},` : 'Hi there,'}</Text>
        <Text style={text}>{message}</Text>
        {actionUrl && (
          <Button style={button} href={actionUrl}>{actionLabel}</Button>
        )}
        <Text style={footer}>— The {SITE_NAME} team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NotificationEmail,
  subject: (data: Record<string, any>) => data?.title || 'You have a new notification',
  displayName: 'Notification',
  previewData: {
    name: 'Jane',
    title: 'Your panel render is ready',
    message: 'We finished generating your panel artwork. Hop in and take a look.',
    actionUrl: 'https://www.herolinc.com',
    actionLabel: 'Open panel',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const button = {
  backgroundColor: 'hsl(330, 90%, 50%)', color: '#ffffff', fontSize: '14px',
  fontWeight: 'bold' as const, borderRadius: '12px', padding: '12px 22px',
  textDecoration: 'none', letterSpacing: '0.03em',
}
const footer = { fontSize: '12px', color: '#9a9aa5', margin: '32px 0 0', lineHeight: '1.5' }
