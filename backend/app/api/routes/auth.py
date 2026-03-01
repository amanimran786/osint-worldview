from fastapi import APIRouter
from app.schemas.schemas import TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=TokenOut)
def login():
    """Stub JWT endpoint — returns a fake token for dev/testing."""
    return TokenOut(
        access_token="dev-token-replace-in-production",
        token_type="bearer",
    )
