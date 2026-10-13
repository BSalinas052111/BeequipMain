# Beequip API server (MongoDB)

The React Native app **cannot** connect to MongoDB directly — a phone has no
Node.js Mongo driver and can't hold the TCP connection. This small Express +
Mongoose server is the bridge:

```
React Native app  --HTTP-->  this API  --->  MongoDB (localhost:27017)
```

Requests submitted with the **Request Quote** button are stored in the
`beequip` database, in the `quotes` collection.

## Prerequisites

- MongoDB **Community Edition** installed and running on this PC (default port
  `27017`). On Windows it runs as the "MongoDB Server" service.
- Node.js 18+.

### Check MongoDB is running

```powershell
# Should print the running mongod service
Get-Service -Name MongoDB

# Optional: open a shell and list databases
mongosh
```

If `mongosh` isn't installed, the free **MongoDB Compass** GUI works too —
connect to `mongodb://127.0.0.1:27017`.

## Setup

```powershell
cd server
npm install
copy .env.example .env
```

The defaults in `.env` already match a local MongoDB Community install:

```
MONGODB_URI=mongodb://127.0.0.1:27017/beequip
PORT=3000
```

## Run

```powershell
npm run dev     # restarts on file changes (Node 18.11+)
# or
npm start
```

You should see:

```
[db] Connected to MongoDB at mongodb://127.0.0.1:27017/beequip
[api] Beequip API listening on http://localhost:3000
```

## Endpoints

| Method | Path          | Description                                  |
| ------ | ------------- | -------------------------------------------- |
| GET    | `/api/health` | Health check.                                |
| POST   | `/api/quotes` | Create a quote request (used by the app).    |
| GET    | `/api/quotes` | List quote requests. `?email=` to filter.    |
| GET    | `/api/items`  | Product catalogue (seeded, optional).        |

Create a quote request from a terminal:

```powershell
curl -X POST http://localhost:3000/api/quotes `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Jane\",\"email\":\"jane@example.com\",\"item\":\"120 VV Electric Cooler\",\"specifications\":\"Need delivery in March\"}'
```

## Seed the items collection (optional)

```powershell
npm run seed
```

## If you see `ECONNREFUSED 127.0.0.1:27017` / `ECONNREFUSED ::1:27017`

That error means `mongod` is **not running**, so nothing is listening on the
port. A fresh Windows install sometimes ships a `mongod.cfg` that still has the
installer placeholders (`%MONGO_DATA_PATH%`, `%MONGO_LOG_PATH%`) instead of real
paths — `mongod` then exits immediately on startup.

Start it with the helper script (no admin required):

```powershell
powershell -ExecutionPolicy Bypass -File ..\scripts\start-mongodb.ps1
```

It creates `C:\data\db` (data) and `C:\data\log\mongod.log`, and skips starting
if MongoDB is already up. A corrected config lives at `C:\data\mongod.cfg`.

Or start it manually:

```powershell
& "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --config "C:\data\mongod.cfg"
```

### Start MongoDB automatically on boot (one-time, run PowerShell as Administrator)

Stop any manually started `mongod` first, then:

```powershell
& "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --config "C:\data\mongod.cfg" --install
Start-Service MongoDB
```

## Notes

- **Use `127.0.0.1`, not `localhost`,** in `MONGODB_URI`. On modern Node,
  `localhost` may resolve to IPv6 (`::1`) and MongoDB does not listen on IPv6
  by default, which causes `ECONNREFUSED ::1:27017`.
- CORS is open for development. Restrict it before putting this on a server.
