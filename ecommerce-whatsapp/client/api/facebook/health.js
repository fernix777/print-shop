export default async function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    message: 'Facebook CAPI serverless is running',
    timestamp: new Date().toISOString(),
    env: {
      hasPixelId: !!process.env.FB_PIXEL_ID,
      hasAccessToken: !!process.env.FB_ACCESS_TOKEN,
      hasTestCode: !!process.env.FB_TEST_EVENT_CODE
    }
  })
}
