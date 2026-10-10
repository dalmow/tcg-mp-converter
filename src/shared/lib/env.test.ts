import { describe, expect, it } from 'vitest'
import { parseBuildEnv } from './env.ts'
import { DEFAULT_SITE_URL } from './site.ts'

describe('parseBuildEnv', () => {
  it('falls back to the production origin when SITE_URL is unset or empty', () => {
    expect(parseBuildEnv({}).SITE_URL).toBe(DEFAULT_SITE_URL)
    expect(parseBuildEnv({ SITE_URL: '' }).SITE_URL).toBe(DEFAULT_SITE_URL)
  })

  it('accepts an https or http origin', () => {
    expect(parseBuildEnv({ SITE_URL: 'https://preview.example.com' }).SITE_URL).toBe('https://preview.example.com')
    expect(parseBuildEnv({ SITE_URL: 'http://localhost:4173' }).SITE_URL).toBe('http://localhost:4173')
  })

  it('fails with a message naming SITE_URL when the value has no scheme', () => {
    expect(() => parseBuildEnv({ SITE_URL: 'ptcgtools.dalm.dev' })).toThrow(/Invalid build environment[\s\S]*SITE_URL/)
  })

  it('fails when SITE_URL is not an http(s) URL', () => {
    expect(() => parseBuildEnv({ SITE_URL: 'ftp://example.com' })).toThrow(/SITE_URL/)
  })

  it('ignores variables it does not declare', () => {
    expect(parseBuildEnv({ PATH: '/usr/bin', CI: 'true' })).toEqual({ SITE_URL: DEFAULT_SITE_URL })
  })
})
