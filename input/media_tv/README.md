# TV Media Files

This folder stores uploaded TV video files.

## Structure

```
input/media_tv/
├── YYYY/
│   ├── MM/
│   │   └── DD/
│   │       └── [video files]
```

## Path Format

Video files are stored with the following path format:
- `input/media_tv/{year}/{month}/{day}/{filename}.mp4`

Example: `input/media_tv/2026/05/12/news_clip.mp4`

## Notes

- Video files should be in MP4 format
- Maximum file size depends on server configuration
- Files are organized by upload date (year/month/day)
