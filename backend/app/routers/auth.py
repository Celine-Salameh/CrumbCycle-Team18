from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.auth import blacklist_access_token
from app.db.session import get_db
from app.dependencies import get_current_access_payload, get_current_user, token_expiration_from_payload
from app.models.user import User
from app.schemas.auth import GoogleSignupRequest, LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserRead
from app.services.auth_service import google_signup_user, login_user, refresh_tokens, register_user, revoke_refresh_if_present

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return login_user(db, payload)


@router.post("/google", response_model=TokenResponse)
def google_signup(payload: GoogleSignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return google_signup_user(db, payload)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return refresh_tokens(db, payload.refresh_token)


@router.post("/logout")
def logout(payload: LogoutRequest, access_payload: dict = Depends(get_current_access_payload), db: Session = Depends(get_db)) -> dict[str, str]:
    blacklist_access_token(db, jti=access_payload["jti"], expires_at=token_expiration_from_payload(access_payload))
    revoke_refresh_if_present(db, payload.refresh_token)
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user