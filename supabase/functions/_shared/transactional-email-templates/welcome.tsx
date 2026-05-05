/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'celsius-narrative-engine'
const SITE_URL = 'https://www.herolinc.com'

interface WelcomeProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{name ? `Welcome, ${name}!` : 'Welcome!'}</Heading>
        <Text style={text}>
          Thanks for joining{' '}
          <Link href={SITE_URL} style={link}><strong>{SITE_NAME}</strong></Link>.
          We're glad to have you here.
        </Text>
        <Text style={text}>
          Jump in and start writing, formatting, and generating your first comic panels.
        </Text>
        <Button style={button} href={SITE_URL}>Get started</Button>
        <Text style={footer}>If you have any questions, just reply to this email.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: (data: Record<string, any>) =>
    data?.name ? `Welcome to ${SITE_NAME}, ${data.name}!` : `Welcome to ${SITE_NAME}!`,
  displayName: 'Welcome',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: 'hsl(330, 90%, 50%)', textDecoration: 'none' }
const button = {
  backgroundColor: 'hsl(330, 90%, 50%)', color: '#ffffff', fontSize: '14px',
  fontWeight: 'bold' as const, borderRadius: '12px', padding: '12px 22px',
  textDecoration: 'none', letterSpacing: '0.03em',
}
const footer = { fontSize: '12px', color: '#9a9aa5', margin: '32px 0 0', lineHeight: '1.5' }
