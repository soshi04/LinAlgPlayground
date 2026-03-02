from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def chapter_home() -> dict:
    return {"chapterId": "ch4", "status": "placeholder"}
