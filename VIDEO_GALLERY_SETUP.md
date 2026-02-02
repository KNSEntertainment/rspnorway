# Video Gallery Setup Guide

## Overview

Complete video management system with database integration and Cloudinary storage.

## What Was Created

### 1. **Database Model** (`/models/Video.Model.js`)

- Video URL (Cloudinary)
- Thumbnail image (optional)
- Title, category, duration
- Description, creator
- Timestamps

### 2. **API Endpoints**

#### `/api/videos` (GET)

- Fetches all active videos from database
- Returns sorted by newest first

#### `/api/videos/create` (POST)

- Uploads video file to Cloudinary folder: `rsp-videos`
- Uploads optional thumbnail to folder: `rsp-video-thumbnails`
- Creates database record
- **FormData fields:**
  - `video` (File) - Required
  - `thumbnail` (File) - Optional
  - `title` (String) - Required
  - `category` (String) - Required
  - `duration` (String) - Optional (e.g., "2:45")
  - `description` (String) - Optional
  - `creator` (String) - Default: "RSP Norway"

#### `/api/videos/[id]` (GET, PUT, DELETE)

- **GET**: Fetch single video
- **PUT**: Update video (can replace video file and/or thumbnail)
- **DELETE**: Delete from both Cloudinary and database

### 3. **Admin Dashboard** (`/app/[locale]/dashboard/videos/page.tsx`)

- Upload new videos with form
- View all videos in grid
- Edit existing videos
- Delete videos (with confirmation)
- Shows video thumbnails/previews
- Displays metadata (title, category, duration, creator)

### 4. **Video Upload Form** (`/components/VideoForm.tsx`)

- Drag & drop or click to upload video
- Optional thumbnail upload
- Title, category, duration fields
- Description textarea
- Creator field
- Video preview before upload
- Edit mode support

### 5. **Public Video Gallery** (`/app/[locale]/video-gallery/page.tsx`)

- Fetches videos from database (no hardcoded data)
- Grid layout with hover effects
- Play/pause in grid view
- Click to open fullscreen modal
- **Navigation features:**
  - Left/Right arrow buttons in modal
  - Keyboard navigation (←/→ arrows, Escape)
  - Loops through videos seamlessly
- Loading states
- Thumbnail support

## Setup Instructions

### 1. Environment Variables

Make sure you have in your `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Cloudinary Setup

- Videos will be uploaded to folder: `rsp-videos`
- Thumbnails will be uploaded to folder: `rsp-video-thumbnails`
- Automatic video/image detection
- Automatic cleanup on delete

### 3. Add to Dashboard Menu

Update `/components/DashboardMenuItems.js` to include:

```javascript
{
  label: "Videos",
  href: "/dashboard/videos",
  icon: <VideoIcon />
}
```

### 4. Database

- Model automatically creates collection: `videos`
- No migration needed - Mongoose handles it
- Indexes on `createdAt` for sorting

## Usage

### For Admins:

1. Go to `/dashboard/videos`
2. Click "Upload Video" button
3. Select video file (MP4, MOV, AVI, etc.)
4. Optionally add thumbnail image
5. Fill in title, category, duration
6. Click "Upload Video"
7. Video uploads to Cloudinary and saves to database

### For Users:

1. Visit `/video-gallery`
2. Browse videos in grid
3. Hover to see info
4. Click play button or video to play
5. Click video again for fullscreen
6. Use arrow buttons or keyboard to navigate
7. Press Escape or X button to close

## Video Navigation Features

- **Left/Right Arrow Buttons**: Navigate between videos in modal
- **Keyboard Shortcuts**:
  - `←` Previous video
  - `→` Next video
  - `Esc` Close modal
- **Circular Navigation**: Last video → First video (and vice versa)

## Features

### Cloudinary Integration

- ✅ Automatic video upload
- ✅ Automatic thumbnail upload
- ✅ File type detection (video/image)
- ✅ Organized folder structure
- ✅ Automatic deletion on remove
- ✅ Secure URL generation

### Admin Features

- ✅ Upload multiple videos
- ✅ Edit video metadata
- ✅ Replace video file
- ✅ Replace thumbnail
- ✅ Delete videos
- ✅ View all videos in grid
- ✅ Loading states
- ✅ Error handling

### User Features

- ✅ Responsive grid layout
- ✅ Hover animations
- ✅ Play/pause in grid
- ✅ Fullscreen video player
- ✅ Video controls
- ✅ Mute/unmute toggle
- ✅ Category badges
- ✅ Duration display
- ✅ Loading spinner
- ✅ Arrow navigation in modal
- ✅ Keyboard navigation

## File Structure

```
models/
  └── Video.Model.js

app/
  ├── api/
  │   └── videos/
  │       ├── route.js (GET all)
  │       ├── create/
  │       │   └── route.js (POST)
  │       └── [id]/
  │           └── route.js (GET, PUT, DELETE)
  └── [locale]/
      ├── dashboard/
      │   └── videos/
      │       └── page.tsx (Admin management)
      └── video-gallery/
          └── page.tsx (Public gallery)

components/
  └── VideoForm.tsx

utils/
  └── saveFileToCloudinaryUtils.js (Already exists)
```

## Alternative: Using Gallery Model

If you want to reuse the Gallery model instead:

1. Change video uploads to use `/api/gallery/create`
2. Store video URLs in `media` array field
3. Use `alt` field for video title
4. Less structured but simpler

**Pros of Gallery Model:**

- Reuse existing code
- Single table for media

**Pros of Video Model:** ✅ Recommended

- Video-specific fields (duration, creator)
- Better data organization
- Separate thumbnail field
- More flexible for future features

## Testing

1. **Upload Test:**
   - Go to `/dashboard/videos`
   - Upload a small test video
   - Check Cloudinary dashboard for upload
   - Verify database record

2. **Display Test:**
   - Go to `/video-gallery`
   - Should see uploaded video
   - Test play/pause
   - Test fullscreen modal
   - Test arrow navigation

3. **Edit Test:**
   - Edit video metadata
   - Update thumbnail
   - Verify changes

4. **Delete Test:**
   - Delete video
   - Check Cloudinary (should be deleted)
   - Check database (should be removed)

## Troubleshooting

### Videos not showing:

- Check API response: `/api/videos`
- Check database connection
- Check `isActive: true` filter

### Upload fails:

- Check Cloudinary credentials
- Check file size limits (100MB default)
- Check file format (MP4, MOV, AVI, etc.)
- Check network connection

### Cloudinary not deleting:

- Check `CLOUDINARY_API_SECRET` is set
- Check public_id extraction in utils
- Check resource_type (video vs image)

## Next Steps

1. Add video search/filter
2. Add video categories management
3. Add video statistics (views)
4. Add video sharing features
5. Add video playlists
6. Add video comments
7. Add video likes/favorites

## Security Notes

- ✅ File type validation
- ✅ Size limits enforced
- ✅ Secure Cloudinary URLs
- ✅ Server-side uploads only
- ⚠️ Add authentication checks to API routes
- ⚠️ Add role-based access control
- ⚠️ Add rate limiting for uploads

## Performance Tips

1. Use thumbnail images for better loading
2. Lazy load videos on scroll
3. Compress videos before upload
4. Use Cloudinary transformations for optimization
5. Cache API responses
6. Paginate video list for large collections
