# Re-collect

*A social writing platform where another person's work is only partially visible until you rewrite it, and rewriting is what makes it more visible to everyone.*

Final year project, BA New Media Art, City University of Hong Kong, 2023. Designed and built solo, front to back.

**Frontend: this repo (Angular, TypeScript) · Backend: [fyp-api](https://github.com/BetaHsu/fyp-api) (Flask, MongoDB)**

---

## What it does

Every work carries a **reveal state**: how much of it is currently visible, and to whom. That state is not a stored flag, it is computed, and two different forces move it at once, so most of the build went into keeping it consistent.

- **Reveal score per work.** A work is stored as paragraphs, each tracking its own revealed and hidden intervals. The score is derived from those intervals rather than kept as a number, so it stays correct no matter what order changes arrive in.
- **Four resolved views of one document.** Owner, public, community, and interaction views each apply a different visibility rule to the same stored work. The server decides what a given viewer receives; hidden text never reaches the client.
- **Rewriting as a first-class object.** A rewrite is not a comment. It is its own work, with its own reveal state, and publishing one atomically updates the original: it reveals the sections the rewriter selected and grants that rewriter full access.
- **Time-based decay.** Revealed sections return to hidden over elapsed time, which means the score has to be recomputed on read rather than written once.
- **An interaction cap.** A work closes to new interaction once it is nearly fully revealed, and reopens after decay brings it back down.

## Stack

`Angular` `TypeScript` `Flask` `MongoDB Atlas` `gunicorn`

## Structure

```
src/app/starter        landing
src/app/onboarding     sign in and sign up
src/app/home           all works, card view
src/app/work           the work page and its four visibility views
```

Talks to [fyp-api](https://github.com/BetaHsu/fyp-api) over REST. Database credentials live in environment variables on the backend and never reach the browser.

## Status

Built in 2023, no longer maintained. Public as a record of the project.

## License

© 2023 Beta HSU Yun Chu. All rights reserved. The code is readable here for reference. The system design and the concept behind it are not licensed for reuse, and I am still developing them.
