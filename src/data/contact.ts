export const CONTACT = {
  email: 'pranavreddysirigireddy@gmail.com',
  github: 'https://github.com/pranav-reddy123',
  githubHandle: 'pranav-reddy123',
  linkedin: 'https://www.linkedin.com/in/pranav-reddy-sirigireddy-623752258/',
  linkedinHandle: 'pranav-reddy-sirigireddy',
} as const

/**
 * The form has no backend. It composes a prefilled mail draft instead, which works
 * everywhere and loses nothing. Point this at a Formspree/Resend endpoint to switch
 * to a real POST — `ContactForm` reads this constant and nothing else changes.
 */
export const CONTACT_ENDPOINT: string | null = null
