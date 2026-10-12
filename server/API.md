# Participant API

All routes are mounted under `/api`. JSON endpoints return `{ message }` for errors. Private routes require the `participantToken` HttpOnly cookie created by login; do not send bearer tokens from browser storage.

## Authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public, rate-limited | Create a participant; returns 201 and does not sign in automatically |
| POST | `/auth/login` | Public, rate-limited | Validate credentials and set the session cookie |
| GET | `/auth/me` | Participant | Return the current participant |
| POST | `/auth/logout` | Public | Clear the session cookie |

Registration JSON: `name`, `email`, `phone`, `college`, `department`, `studyYear`, `password`.

## Participant and hackathon

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/participants/me` | Participant | Read the current profile |
| PUT | `/participants/me` | Participant | Update validated profile fields |
| GET | `/hackathon/status` | Participant | Read safe event settings and configured deadlines |

Profile updates accept `name`, `email`, `phone`, `college`, `department`, `studyYear`, `githubUrl`, `linkedinUrl`, and `skills`.

## Teams and problems

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/teams` | Participant | Create a team and invitation code |
| GET | `/teams/me` | Participant | Read the current team; invitation code is leader-only |
| POST | `/teams/join` | Participant | Join with `invitationCode` |
| POST | `/teams/leave` | Participant | Leave if not the leader |
| GET | `/teams/:teamId` | Team member | Read team details |
| POST | `/teams/select-problem` | Team member | Select by published `problemId` before the configured deadline |
| GET | `/problems?page=1&limit=20&search=&category=&difficulty=` | Participant | List published challenges with filters and pagination |
| GET | `/problems/:problemId` | Participant | Read one published challenge |

## Submissions

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/submissions` | Team leader | Create the team's project before the deadline |
| GET | `/submissions/me` | Team member | List the current team's submission(s) |
| GET | `/submissions/:submissionId` | Team member | Read a submission belonging to the current team |
| PUT | `/submissions/:submissionId` | Team leader | Update an editable submission; prior values are preserved in history |
| POST | `/submissions/:submissionId/presentation` | Team leader | Upload a PDF up to 10 MB as multipart field `presentation` |
| GET | `/submissions/:submissionId/presentation` | Team member | Retrieve the attached PDF after membership validation |

Submission JSON fields: `projectTitle`, `abstract`, `solutionDescription`, `techStack` (array), `githubUrl`, optional `demoUrl`, optional `videoUrl`. Status, evaluation, score and rank fields are never accepted from participants.

## Announcements and results

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/announcements?page=1&limit=20` | Participant | List published announcements |
| GET | `/results?page=1&limit=20` | Participant | List results only after publication |
| GET | `/results/me` | Participant | Read published result for the current team |
| GET | `/health` | Public | Liveness check (`{ "status": "ok" }`) |

List endpoints return `pagination` metadata. Result APIs query `published: true`; there are intentionally no participant routes to set scores, evaluation status, publication state, or rankings. Admin and judge APIs are outside this project.
