# AGENTS.md

## Project Overview

Build a self-hosted local web application that behaves like a private YouTube instance for personal travel videos stored on a local server or NAS inside a home network.

The application must:

* Store and manage personal travel videos.
* Allow videos to have zero, one, or multiple categories.
* Provide a YouTube-like browsing and playback experience.
* Include integrated video streaming and playback.
* Work entirely offline inside the local network.
* Be fully dockerized.
* Be delivered as a single unified application.

Examples of categories:

* Sports
* Boat
* Water
* Zurich
* Family
* Mountain
* Christmas

A single video may have multiple categories simultaneously:

```text
Sports, Boat, Water, Zurich
```

---

# Primary Goal

The main objective is to recreate the core experience of YouTube, but entirely local and private.

The application should feel similar to YouTube in the following areas:

* Home page with a thumbnail grid.
* Video cards containing thumbnail, title, categories, play count and upload date.
* Dedicated video watch page.
* Search bar always visible.
* Related video recommendations.
* Most viewed videos section.
* Recently added videos section.
* "20 Random Videos" section.
* Fast navigation and smooth scrolling.
* Category chips/tags under each video.
* Responsive layout for desktop, tablet and mobile.
* User accounts or authentication are required initially.

Unlike YouTube:

* Everything runs only inside the local network.
* No ads.
* No comments.
* No public sharing.
* All content belongs to the local user.

Visual inspiration:

* YouTube Home
* YouTube Watch Page
* Plex
* Jellyfin

The interface should use:

* Dark theme
* Clean modern layout
* Large thumbnails
* Smooth transitions
* Minimalistic UI

---

# Required Technology Stack

Claude should generate a complete production-ready project using:

* Backend: ASP.NET Core 8 Web API
* Frontend: React + Vite + TypeScript
* Database: SQLite
* ORM: Entity Framework Core
* Styling: TailwindCSS
* Video Player: Native HTML5 video player
* Containerization: Docker + Docker Compose

The entire project should be easy to run with:

```bash
docker compose up -d
```

---

# Claude Responsibilities

Claude must:

1. Generate the entire project structure.
2. Create all backend and frontend files.
3. Generate Docker configuration.
4. Create a README with setup instructions.
5. Include Entity Framework migrations.
6. Produce complete and working code, not pseudocode.
7. Keep the implementation simple, maintainable and extendable.
8. Add comments where useful.
9. Prioritize local-network performance.
10. Ensure video streaming works correctly for large files.

---

# Core Features

## 1. Video Management

Each video must contain:

* Id
* Title
* Physical file path
* Imported date
* Duration
* File size
* Optional thumbnail
* Number of plays
* Last played date
* Categories

Example:

```json
{
  "id": 1,
  "title": "zurich-lake-trip.mp4",
  "path": "/videos/switzerland/zurich-lake-trip.mp4",
  "playCount": 12,
  "categories": ["Zurich", "Water", "Boat"]
}
```

---

## 2. Multi-Category Support

Videos may have:

* No category
* One category
* Multiple categories

Database relationship:

* Video
* Category
* VideoCategory

The search system must support:

* Search by title
* Search by one category
* Search by multiple categories
* Combined title + category search

Example query:

```text
Find videos that contain both Water and Boat
```

---

## 3. Home Page

The home page should display:

1. Most viewed videos (`playCount DESC`)
2. Recently added videos
3. Button: "🎲 Show 20 Random Videos"
4. Search bar
5. Category filters
6. Infinite-scroll or paginated video grid

Suggested layout:

```text
------------------------------------------------------
| Video Travel Manager                               |
| [Search...] [Categories ▼] [🎲 20 Random Videos]   |
------------------------------------------------------
| Most Viewed                                         |
| [Video Card] [Video Card] [Video Card]             |
------------------------------------------------------
| Recently Added                                      |
| [Video Card] [Video Card] [Video Card]             |
------------------------------------------------------
| All Videos                                          |
| [Grid of thumbnails]                               |
------------------------------------------------------
```

---

## 4. Video Watch Page

The watch page must behave similarly to YouTube.

It should contain:

* Large integrated video player
* Video title
* Categories as clickable chips
* Play count
* Last watched date
* Related videos sidebar or section
* Edit categories button
* Remove video button

Technical requirements:

* HTML5 video player
* Large file support
* HTTP range request support
* No full file loading in memory
* Browser-compatible playback for mp4, webm, mov and other supported formats

Whenever a video starts playing:

* Increment `playCount`
* Update `lastPlayedAt`

---

## 5. Related Videos

The watch page should recommend videos based on:

1. Shared categories
2. Similar title keywords
3. Fallback to random videos if nothing matches

Example:

If the current video has categories:

```text
Zurich, Water, Boat
```

Recommended videos should prioritize other videos sharing those categories.

---

## 6. Importing Videos

Two import methods are required.

### Option A: Upload Through Browser

Users can upload a video directly from the web UI.

The application must:

* Save the file to the configured storage folder
* Extract metadata
* Register the video in the database

### Option B: Import Existing Local Folder

The user may register local paths such as:

```text
D:\Videos
/media/videos
/mnt/nas/travel
```

The system must:

* Scan the folder recursively
* Detect supported video files
* Register new videos
* Avoid duplicates
* Store folder registrations for future rescans

Duplicate detection should use:

* SHA256 hash OR
* Combination of path + size + last modified date

Supported formats:

* mp4
* mov
* mkv
* avi
* webm

---

## 7. Random Videos Button

Visible on the home page:

```text
🎲 Show 20 Random Videos
```

When clicked:

* Fetch 20 random unique videos
* Display them in the standard grid layout

---

# Expected Database Model

```text
Video
- Id
- Title
- FilePath
- DurationSeconds
- FileSizeBytes
- ThumbnailPath
- ImportedAt
- PlayCount
- LastPlayedAt

Category
- Id
- Name

VideoCategory
- VideoId
- CategoryId

VideoFolder
- Id
- Path
- LastScanAt
```

---

# Required API Endpoints

```text
GET    /api/videos
GET    /api/videos/{id}
GET    /api/videos/top
GET    /api/videos/latest
GET    /api/videos/random?count=20
GET    /api/videos/search?text=&categories=
POST   /api/videos/upload
POST   /api/videos/import-folder
POST   /api/videos/{id}/play
PUT    /api/videos/{id}/categories
DELETE /api/videos/{id}
GET    /api/videos/{id}/stream
```

```text
GET    /api/categories
POST   /api/categories
DELETE /api/categories/{id}
```

---

# Required Backend Services

Claude must implement:

* VideoScannerService
* VideoStreamingService
* ThumbnailService
* VideoRecommendationService

The backend must:

* Support HTTP range requests
* Stream files efficiently
* Persist SQLite database in Docker volume
* Log imports and playback activity
* Validate paths and uploads

---

# Required Frontend Components

```text
/components
- Header
- SearchBar
- CategoryFilter
- VideoCard
- VideoGrid
- VideoPlayer
- RelatedVideos
- RandomButton
```

```text
/pages
- HomePage
- VideoPage
- ImportPage
- SettingsPage
```

Video cards must display:

* Thumbnail
* Title
* Categories
* Play count
* Imported date

---

# Required Project Structure

```text
/VideoTravelManager
│
├── backend/
│   ├── Controllers/
│   ├── Services/
│   ├── Models/
│   ├── DTOs/
│   ├── Data/
│   ├── Migrations/
│   ├── Program.cs
│   └── appsettings.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── vite.config.ts
│
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── README.md
└── AGENTS.md
```

---

# Docker Requirements

Claude must generate a working `docker-compose.yml`.

Example:

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:8080"
    volumes:
      - ./data:/app/data
      - ./videos:/videos

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
```

Requirements:

* Persistent database volume
* Persistent video storage volume
* Local network access from other devices
* Frontend and backend connected through Docker network

---

# Priority Order

1. Local usability
2. Smooth video playback
3. Fast category search
4. Easy video importing
5. YouTube-like browsing experience
6. Easy future extension

---

# Final Instruction To Claude Code

Use this AGENTS.md as the source of truth.

Generate the project in this order:

1. Folder structure
2. Database models
3. Entity Framework migrations
4. Backend API
5. Video streaming implementation
6. React frontend
7. Search and category filters
8. Related videos system
9. Docker setup
10. README

Do not generate pseudocode.

Generate complete files and fully working code.
