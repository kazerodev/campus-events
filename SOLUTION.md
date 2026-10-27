# Week 3: backend improvements

Live: https://lavenderblush-sardine-764877.hostingersite.com

## 1. Clean up and split the logic

The big `app.mjs` is split into the layers from the README:

- `routes/`: which URL goes to which controller, plus the zod validation
- `controllers/`: read the request, call a service, send the status code
- `services/`: the rules (event full, already registered, stats). No Express and no Sequelize here
- `repositories/`: the only place that uses the Sequelize models
- `models/`, `db/`: tables, connection and demo data
- `config/env.mjs`: the only file that reads `process.env`
- `middleware/`: validation, request logging and the error handler

The validation code was copied in every route, now it is one `validate()` middleware. Services throw an `AppError` and the error handler turns it into the same `{ error: { code, message, details } }` format as before. Express 5 sends errors from async handlers to the error handler by itself, so the controllers don't need try/catch.

The original integration tests were not changed and still pass.

Bugs I found and fixed (each one has a test):

- The capacity check used `count > capacity`, so an event with 2 seats accepted 3 people. Now it is `>=`.
- When 5 people registered at the same moment for the last seat, all 5 got in, and the same email sent 3 times at once was stored 3 times. The code first checks and then saves, and other requests could run in between. Now registrations run one by one (a small queue in `registrationService`), so the check and the save always happen together. This works because the app runs as one process, the same reason the cache can live in memory.
- When a field was missing, the message was technical ("expected string, received undefined"). Now it says "Enter a title", like the other messages.

## 2. Confirmation mail

In `registrationService.register()` the registration is saved first. After that the mail is started without `await`, and `.catch()` only logs a warning if it fails. So if the mail provider is slow or offline, the registration is already stored and the user still gets a `201`.

`mail/mailer.mjs` uses nodemailer when `SMTP_URL` is set. Without it, it uses the slow lab mailer from `api/lab/mail.mjs`, which only writes to the log. That is what the live version uses.

What is not solved: if the server crashes while a mail is being sent, that mail is lost. A queue (RabbitMQ, part 4) would fix that.

## 3. Caching the GET endpoints

`cache/memoryCache.mjs` is a `Map` with an expiry time (30 seconds). The services use it for:

- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/events/:id/registrations`
- `GET /api/stats`

To stay correct after changes, every write (create, update or delete an event, new registration) clears the whole cache before the response is sent. I clear everything because one registration changes the event, the registration list and the stats at the same time, so clearing only one key would leave old data. A 404 or a database error is not cached.

One more case: a GET can still be loading from the database while a registration happens. Its result is then already old, so it should not go into the cache. The cache keeps a version number that goes up on every `clear()`, and it only saves a value when the version did not change during the load.

I used an in-memory cache and not Redis because the app runs as one process, so no extra service is needed. With more servers, Redis would be the next step.

## 4. Online

The app runs on Hostinger as a Node.js app. One Express server serves the API on `/api` and the built Vue app on the other routes, so there is no CORS. Routes like `/stats` fall back to `index.html` so Vue Router works after a refresh.

Problems I had while deploying:

- Hostinger loads the start file with `require()`, which doesn't work with top-level `await`. I moved the startup code into a `start()` function.
- `vite build` failed on the server because a native file of Rolldown was missing (an npm bug with optional dependencies). Now I build the frontend before uploading, and the server only checks that `web/dist` exists (`npm run build:check`).
- The database is stored outside the app folder (`DB_STORAGE`), so a new deploy doesn't delete the data.

## Stack Overflow

- https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
  How errors from async routes reach the error middleware. I used it to understand why I can throw errors in the services and handle them in one place.
- https://stackoverflow.com/questions/61834275/what-happens-to-the-promise-if-we-dont-await-for-it
  A promise without `await` still runs, but it needs `.catch()`. This is how the confirmation mail is sent in the background.
- https://stackoverflow.com/questions/52327143/serving-vuejs-builds-via-express-js-using-history-mode
  How to serve the Vue build from Express without breaking the `/api` routes.
- https://stackoverflow.com/questions/78067630/error-cannot-find-module-rollup-rollup-linux-x64-gnu-on-docker-container
  Explained why the build failed on the server.
