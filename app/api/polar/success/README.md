# Polar Checkout Setup

Set these env vars in your project settings:

- `POLAR_ACCESS_TOKEN` — From Polar dashboard → Settings → API Keys
- `NEXT_PUBLIC_POLAR_CHECKOUT_URL` — Your Polar product checkout link (e.g. https://buy.polar.sh/nixio-pro)

The success route will be called automatically after payment:
`/api/polar/success?checkout_id=...`

Set this as the confirmation URL in your Polar product settings.
