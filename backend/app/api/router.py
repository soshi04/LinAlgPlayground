from fastapi import APIRouter

from app.api.chapters import CHAPTERS, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9

api_router = APIRouter()


@api_router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@api_router.get("/api/chapters")
def list_chapters() -> dict:
    return {"chapters": CHAPTERS}


api_router.include_router(ch1.router, prefix="/api/chapters/ch1", tags=["ch1"])
api_router.include_router(ch2.router, prefix="/api/chapters/ch2", tags=["ch2"])
api_router.include_router(ch3.router, prefix="/api/chapters/ch3", tags=["ch3"])
api_router.include_router(ch4.router, prefix="/api/chapters/ch4", tags=["ch4"])
api_router.include_router(ch5.router, prefix="/api/chapters/ch5", tags=["ch5"])
api_router.include_router(ch6.router, prefix="/api/chapters/ch6", tags=["ch6"])
api_router.include_router(ch7.router, prefix="/api/chapters/ch7", tags=["ch7"])
api_router.include_router(ch8.router, prefix="/api/chapters/ch8", tags=["ch8"])
api_router.include_router(ch9.router, prefix="/api/chapters/ch9", tags=["ch9"])
