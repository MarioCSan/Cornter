# Video Travel Manager (Corn(ter))

A self-hosted, private YouTube-like application for your personal travel videos. Run it entirely offline within your home network with a beautiful, responsive interface.

## Features

- 🎬 **YouTube-like Interface** — Browse videos with thumbnails, play counts, and categories
- 📚 **Multi-Category Support** — Organize videos with multiple categories per video
- 🔍 **Full-Text Search** — Search videos by title and filter by categories
- 📊 **Analytics** — Track most viewed, recently added, and random video selections
- 🎥 **Fast Streaming** — Native HTML5 player with HTTP range request support for seeking large files
- 📦 **Easy Import** — Upload individual videos or import entire folders recursively
- 🐳 **Fully Dockerized** — Run with a single `docker compose up` command
- 🚀 **Responsive Design** — Works perfectly on desktop, tablet, and mobile
- 🌙 **Dark Theme** — Easy on the eyes for extended viewing sessions

## System Requirements

- Docker & Docker Compose
- 2GB+ RAM
- ~10GB disk space per 100 hours of video

## Quick Start

### 1. Clone the Repository

```bash
git clone <repo-url> cornter
cd cornter
```

### 2. Create Video Directories

```bash
mkdir -p data videos
```

### 3. Start the Application

```bash
docker compose up -d
```

This will:
- Build the backend (ASP.NET Core 8) service
- Build the frontend (React + Vite) service
- Create SQLite database in `./data`
- Mount video storage at `./videos`

### 4. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

## Usage

### Importing Videos

#### Option A: Upload Through the UI

1. Navigate to **Import** tab
2. Click **Upload File**
3. Select a video file (mp4, mov, mkv, avi, webm)
4. Optionally assign categories
5. Click **Upload Video**

#### Option B: Import an Existing Folder

1. Navigate to **Import** tab
2. Click **Import Folder**
3. Enter the absolute path to your videos folder
   - Linux/Mac: `/home/user/videos` or `/mnt/nas/travel`
   - Windows: `D:\Videos` or `\\nas\videos`
4. Click **Import Folder**

The system will:
- Recursively scan all subdirectories
- Detect supported video formats
- Avoid duplicate imports
- Generate thumbnails automatically

### Managing Videos

**Home Page:**
- View most viewed videos
- View recently added videos
- Click "🎲 Show 20 Random Videos" for discovery
- Filter by category using chips
- Search by title

**Watch Page:**
- Play video with HTML5 player (supports seeking with range requests)
- View play count and last played date
- See related video recommendations
- View assigned categories
- Delete video if needed

**Categories:**
- Automatically created when assigning to videos
- Can filter multiple categories with AND logic
- Example: "Zurich" AND "Water" shows videos with both tags

## Architecture

```
frontend/                    # React + Vite + TypeScript + TailwindCSS
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/              # Full page views
│   ├── services/           # API integration
│   └── types/              # TypeScript interfaces

backend/                     # ASP.NET Core 8 Web API
├── Controllers/            # API endpoints
├── Services/               # Business logic
├── Models/                 # EF Core entities
├── DTOs/                   # Data transfer objects
└── Data/                   # Database context

docker-compose.yml         # Multi-container orchestration
nginx.conf                 # Frontend reverse proxy
Dockerfile.backend         # Backend container image
Dockerfile.frontend        # Frontend container image
```

## Database Schema

### Video
- `Id` (PK)
- `Title` (string)
- `FilePath` (string) — absolute path to video file
- `DurationSeconds` (int)
- `FileSizeBytes` (long)
- `ThumbnailPath` (string, nullable)
- `ImportedAt` (DateTime)
- `PlayCount` (int)
- `LastPlayedAt` (DateTime, nullable)

### Category
- `Id` (PK)
- `Name` (string, unique)

### VideoCategory
- `VideoId` (FK)
- `CategoryId` (FK)

### VideoFolder
- `Id` (PK)
- `Path` (string)
- `LastScanAt` (DateTime, nullable)

## API Endpoints

### Videos
- `GET /api/videos` — List all videos (paginated)
- `GET /api/videos/{id}` — Get video details
- `GET /api/videos/top` — Most viewed videos
- `GET /api/videos/latest` — Recently added videos
- `GET /api/videos/random?count=20` — Random selection
- `GET /api/videos/search?text=title&categories=1,2` — Search & filter
- `GET /api/videos/{id}/stream` — Stream video file (HTTP 206 support)
- `POST /api/videos/{id}/play` — Record a play event
- `POST /api/videos/upload` — Upload video file
- `POST /api/videos/import-folder` — Import from folder
- `PUT /api/videos/{id}/categories` — Update video categories
- `DELETE /api/videos/{id}` — Delete video

### Categories
- `GET /api/categories` — List all categories
- `POST /api/categories` — Create category
- `DELETE /api/categories/{id}` — Delete category

## Video Formats

Supported formats:
- **mp4** (h.264 codec recommended)
- **mov** (QuickTime)
- **mkv** (Matroska)
- **avi** (AVI)
- **webm** (VP8/VP9)

Recommended for best browser compatibility:
- **Format:** MP4
- **Video Codec:** H.264
- **Audio Codec:** AAC
- **Bitrate:** 2-8 Mbps

## Storage

### Data Directory (`./data`)
- Contains SQLite database (`videos.db`)
- Persisted across container restarts
- ~10MB per 1000 videos

### Videos Directory (`./videos`)
- Stores uploaded video files
- Symlinked from imported folders
- Mount as external volume for large collections

## Performance Tips

1. **For Large Video Collections (>5000 videos)**
   - Use NAS/network storage mounted in `/videos`
   - Increase Docker memory to 2GB+

2. **For Seeking in Large Files**
   - HTTP range requests are fully supported
   - No streaming bottleneck for 4K videos

3. **Thumbnail Generation**
   - Automatic on upload/import
   - Takes ~1-2 seconds per video
   - Stored at `./videos/thumbnails/`

## Troubleshooting

### Videos Won't Play
- Check file format is supported
- Verify file exists at path in video record
- Check browser developer console for errors
- Test: `curl -I http://localhost:5000/api/videos/1/stream`

### Import Fails
- Verify folder path is correct and readable
- Check Docker has permission to access mounted volumes
- Review container logs: `docker compose logs backend`

### Thumbnails Missing
- ffmpeg may not be installed (check Dockerfile.backend)
- Video codec unsupported by ffmpeg
- Manually move image files to `./videos/thumbnails/`

### Database Issues
- Reset: `rm data/videos.db` (loses all data)
- Container logs: `docker compose logs backend`

## Stopping the Application

```bash
# Stop containers
docker compose down

# Stop and remove all data
docker compose down -v
```

## Environment Variables

**Backend:**
- `DATA_PATH` — Database storage (default: `/app/data`)
- `VIDEO_PATH` — Video storage (default: `/videos`)
- `ASPNETCORE_ENVIRONMENT` — `Development` or `Production`

Edit `docker-compose.yml` to customize.

## Development

### Run Backend Locally

```bash
cd backend
dotnet restore
dotnet run
```

### Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Then access at [http://localhost:5173](http://localhost:5173) (dev server proxies API to localhost:5000).

## License

MIT

## Future Enhancements

- [ ] User accounts & authentication
- [ ] Watch history and bookmarks
- [ ] Playlist creation
- [ ] Advanced video filtering (duration, size)
- [ ] Video transcoding pipeline
- [ ] Mobile app (React Native)
- [ ] Subtitle support
- [ ] Multi-user sharing (private links)