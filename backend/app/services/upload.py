from typing import Optional

import cloudinary
import cloudinary.uploader

from app.core.config import get_settings

settings = get_settings()

if settings.cloudinary_url:
    cloudinary.config(cloudinary_url=settings.cloudinary_url)


def upload_image(file_bytes: bytes, filename: str) -> Optional[str]:
    if not settings.cloudinary_url:
        return None
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            filename=filename,
            resource_type="image",
        )
        return result.get("secure_url")
    except Exception:
        return None
