from fastapi import APIRouter

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/")
async def settings_root():
    return {
        "status": "ok",
        "message": "Settings endpoint placeholder. Add user preferences, notification toggles, privacy, etc."
    }
