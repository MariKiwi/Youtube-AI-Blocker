# API

## Endpoints

### `GET /health`

Returns server health.

### `GET /videos/:youtubeVideoId`

Returns one video record.

Behavior:
- Known videos return their stored score, votes, confidence, and status
- Unknown videos return `status: "unknown"`
- Invalid YouTube IDs return `400`

### `POST /videos/bulk-lookup`

Looks up up to 100 video IDs in a single request.

Request:

```json
{
  "youtubeVideoIds": ["dQw4w9WgXcQ", "aaaaaaaaaaa"]
}
```

Behavior:
- Response order matches request order
- Unknown videos are returned explicitly as `unknown`
- Invalid IDs return `400`

### `POST /videos/:youtubeVideoId/flag`

Marks a video as AI and counts as the first positive vote from that device.

Request:

```json
{
  "deviceId": "device-123"
}
```

Behavior:
- Creates the video record if it does not exist
- Adds one positive point
- Rejects repeated identical device votes with `409`

### `POST /videos/:youtubeVideoId/vote`

Votes on an already known video.

Request:

```json
{
  "deviceId": "device-123",
  "vote": "up"
}
```

Behavior:
- `up` adds one point
- `down` subtracts one point
- Vote changes by the same device replace the previous vote
- Voting on an unknown video returns `404`
- Repeating the same vote returns `409`

## Status model

- `unknown`: no database record
- `flagged`: positive score
- `disputed`: score from `-5` to `0`
- `unflagged`: score below `-5`

## Confidence model

- `low`: score from `1` to `4`
- `medium`: score from `5` to `14`
- `high`: score `15` or greater
- `disputed`: score from `-5` to `0`
- `unflagged`: score below `-5`

