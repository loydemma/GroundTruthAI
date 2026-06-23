/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'groundtruthai',
      // Production resources are retained on `sst remove`; dev stages are torn down.
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: { aws: { region: 'us-east-1' } },
    }
  },
  async run() {
    // Required server secrets — deploy fails loudly if unset (`sst secret set <Name> <value>`).
    const databaseUrl = new sst.Secret('DatabaseUrl')
    const googleApiKey = new sst.Secret('GoogleApiKey') // Summarizer (Gemini)
    const groqApiKey = new sst.Secret('GroqApiKey') // Judge (Llama 3.3 via Groq)
    // Optional password gate (see README "Password gate"). Empty default → gate is
    // dormant / site fully public. Set it to lock the site, clear it to unlock:
    //   sst secret set SitePassword "<pw>" --stage production   # lock
    //   sst secret set SitePassword "" --stage production       # unlock (go public)
    const sitePassword = new sst.Secret('SitePassword', '')

    new sst.aws.Nextjs('GroundTruthAI', {
      // Mapped into the Lambda runtime as process.env.* (read at request time).
      environment: {
        DATABASE_URL: databaseUrl.value,
        GOOGLE_API_KEY: googleApiKey.value,
        GROQ_API_KEY: groqApiKey.value,
        SITE_PASSWORD: sitePassword.value,
        // Model names are config, not secrets — change here to swap models in prod.
        MODEL_NAME: 'gemini-2.5-flash',
        JUDGE_MODEL_NAME: 'llama-3.3-70b-versatile',
      },
    })
  },
})
