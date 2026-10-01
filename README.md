# Nocturne Chess API

Independent NestJS API for authentication, friends, realtime multiplayer chess, website invitations, presence, and WebRTC signalling.

## Run locally

1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.
2. Start MongoDB locally or provide a MongoDB Atlas URI.
3. Run `npm install`.
4. Run `npm run start:dev`.

HTTP endpoints use the `/api` prefix. Socket.IO uses the `/game` namespace and accepts the JWT as `auth.token`.

## Architecture

Database calls are restricted to DAO implementations. Feature flow follows controller → abstract service → service → abstract DAO → DAO. `CoreModule` owns global configuration and JWT providers; `bootstrap.ts` owns application setup.

WebRTC voice is peer-to-peer. The API only relays signalling messages and does not record or transport audio.
