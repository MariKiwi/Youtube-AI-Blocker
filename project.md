# YouTube AI Blocker

## Purpose

YouTube AI Blocker is a community-driven system for identifying, highlighting, and optionally blocking AI-generated YouTube videos.

The project is built around the idea that users can collectively flag videos that appear to be AI-made, vote on those flags, and help create a shared confidence score for each video. That score is then used by a browser add-on to warn users about likely AI-generated content or hide it entirely if they choose to enable blocking.

## Goals

- Help users recognize AI-generated YouTube videos quickly
- Let the community contribute to detection instead of relying on a closed system
- Provide transparent confidence levels based on user votes
- Give users control over whether flagged videos are only highlighted or fully blocked

## Core Architecture

The project has two main parts:

### 1. Server

The server is responsible for:

- Exposing the API used by the client
- Storing the video database
- Recording AI flags for videos
- Recording votes for and against a video's AI status
- Calculating confidence levels based on community input
- Serving settings or metadata needed by the browser client

### 2. Browser Add-on Client

The client is a browser extension that connects to the server API and applies the project logic directly to the YouTube interface.

The client is responsible for:

- Looking up videos in the shared database
- Showing whether a video is suspected to be AI-generated
- Highlighting flagged videos with different confidence levels
- Blocking flagged videos when the user enables that option
- Allowing users to submit flags and votes
- Providing a settings page for user preferences and server configuration

## Community-Driven Detection Model

This project uses a community moderation model instead of a fully automated classifier.

Users can:

- Mark a video as AI-generated, creating the initial database entry
- Vote in favor of the AI flag if they agree
- Vote against the AI flag if they disagree

Over time, the number and balance of votes should make the system more reliable. Videos with stronger agreement from the community can be shown with a higher confidence level.

The core score model is point-based:

- An upvote adds `+1`
- A downvote adds `-1`
- Scores can go negative
- If a video's score drops below `-5`, it becomes unflagged

## Client Features

### Mark a Video as AI

Users should be able to mark a YouTube video as AI-generated. This creates the initial entry in the shared database and starts the review process for that video.

### Vote for or Against the AI Flag

If a video has already been flagged, users should be able to vote:

- For the AI flag
- Against the AI flag

This helps refine the video's confidence score and keeps the system community-driven.

### Highlight AI-Flagged Videos

The browser add-on should visually highlight videos that have been flagged as AI-generated.

The highlight should indicate different confidence levels based on community votes. For example:

- Low confidence: score from `1` to `4`
- Medium confidence: score from `5` to `14`
- High confidence: score of `15` or more

Videos with scores from `-5` to `0` can be treated as disputed, while videos below `-5` should be treated as unflagged.

This allows users to judge the signal strength instead of seeing only a binary yes/no label.

### Optional Blocking

Users should be able to enable a setting that blocks or hides videos that are flagged as AI-generated.

Blocking should be optional. Some users may prefer only to see warnings or highlights, while others may want AI-generated videos removed from view entirely.

### Settings Page

The client should include a settings page for configuration such as:

- Enabling or disabling blocking
- Changing the database or API server
- Adjusting display behavior for highlights
- Supporting future configuration options

## Example User Flow

1. A user visits YouTube.
2. The browser add-on checks visible videos against the API.
3. Videos that exist in the database are highlighted based on their confidence level.
4. If blocking is enabled, flagged videos are hidden or filtered from view.
5. The user can mark a new video as AI-generated or vote on an existing flag.
6. The server updates the shared record and recalculates confidence.

## Initial Scope

The first version of the project should focus on:

- A working API and video database
- A browser add-on that reads and displays AI flags
- Community submission of new AI flags
- Community voting for and against flags
- Confidence-based highlighting
- Optional blocking through client settings

## Future Expansion Ideas

- User reputation or trust weighting
- Anti-abuse and vote-spam protection
- Moderator tools for disputed videos
- Import/export or federation between community servers
- More detailed confidence explanations
- Support for additional video platforms

## Summary

YouTube AI Blocker is a server-and-extension system that lets a community identify AI-generated YouTube videos, vote on them, and surface that information directly in the browsing experience. Its core value is user control: videos can be highlighted with transparent confidence levels or blocked entirely based on personal settings.
