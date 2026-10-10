import { z } from 'zod'
import { DEFAULT_SITE_URL } from './site.ts'

/** An empty variable (`SITE_URL=`) means unset, as it did before validation existed. */
const emptyAsUnset = (value: unknown) => (value === '' ? undefined : value)

/** Build-time variables read by `vite.config.ts`. None reach the client bundle. */
const buildEnvSchema = z.object({
  SITE_URL: z.preprocess(
    emptyAsUnset,
    z.url({ protocol: /^https?$/, error: 'expected an http:// or https:// URL' }).optional(),
  ),
})

export type BuildEnv = {
  /** Canonical origin of the site, used for SEO tags and the sitemap. */
  SITE_URL: string
}

/** Validates the build environment once, so a bad value fails the build with the variable's name. */
export function parseBuildEnv(raw: Record<string, string | undefined>): BuildEnv {
  const result = buildEnvSchema.safeParse(raw)
  if (!result.success) throw new Error(`Invalid build environment:\n${z.prettifyError(result.error)}`)
  return { SITE_URL: result.data.SITE_URL ?? DEFAULT_SITE_URL }
}
