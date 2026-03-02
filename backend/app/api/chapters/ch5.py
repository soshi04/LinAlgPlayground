from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def chapter_home() -> dict:
    return {"chapterId": "ch5", "status": "placeholder"}
