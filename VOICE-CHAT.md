# In-match messages and voice

Deploy both the API and UI for this version. The two players must be authenticated participants of an active match to send messages or exchange voice signals.

Text chat and WebRTC setup use short authenticated HTTP requests backed by MongoDB. They do not require the players' WebSocket connections to share an API instance. The UI polls for messages/signals approximately every 1–1.5 seconds. Audio itself travels over WebRTC, not through MongoDB or HTTP.

Microphones and speakers start off. Turning on a speaker never requests microphone access. Turning off a microphone stops its captured tracks. Leaving or finishing the match closes the peer and releases the microphone. There is no ring/pickup flow and no audio recording.

The most recent 100 messages are displayed and expire after 24 hours. Voice signalling records expire after two minutes. MongoDB TTL cleanup is asynchronous; queries also exclude expired records.

## Deployment checks

- Set the UI's API URL to the deployed API's HTTPS address, including /api.
- Set CLIENT_ORIGIN on the API to the UI's exact origin.
- Use HTTPS on phones. Plain HTTP on a LAN IP cannot request a microphone.
- Deploy the new communication endpoints. The UI reports API/permission/playback failures and provides a Retry voice control.
- Test between two devices on different networks, not only two local tabs.

STUN-only voice can fail on restrictive mobile networks. This update does not make a paid service mandatory, but reliable connectivity across those networks requires a TURN relay. You can supply a self-hosted Coturn-compatible server with TURN_URLS and TURN_SECRET (see .env.voice.example). The API issues short-lived credentials; the shared secret stays on the server. Hosting and relay bandwidth may incur costs.

## Metered / managed TURN configuration

Copy the dashboard's comma-separated `turn:` and `turns:` URLs into `TURN_URLS`,
its `username` into `TURN_USERNAME`, and its `credential` into `TURN_PASSWORD`.
Keep all supplied transports, including TLS. Leave `TURN_SECRET` unset for this mode.
A complete username/password pair takes precedence over Coturn authentication.
Without a complete pair or a Coturn secret, the API returns STUN only.

Set these variables in `chess-api/.env` for local development and separately in
the deployed API's environment, then restart/redeploy the API. No frontend
environment changes are needed: the existing authenticated configuration request
already passes the returned ICE servers to WebRTC. Reload both players and retry voice.
`relayAvailable: true` means credentials were configured, not that the relay was tested.

Do not commit credentials. Rotate any credentials exposed in screenshots or chat.
The authenticated participant's browser necessarily receives the TURN username/password
to connect to the relay; use provider quotas and rotate credentials as appropriate.
Never use the provider's account API secret as a TURN password.

## Verification

API: npm run build, then node --test tests/communication.test.cjs

UI: npx playwright test tests/communication.spec.ts

The browser test uses two isolated players, mock API transport, and Chrome's synthetic microphone. It verifies real local WebRTC audio; it does not prove connectivity through a deployed host or restrictive mobile networks.
