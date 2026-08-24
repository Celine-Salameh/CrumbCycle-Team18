from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.crud.auth import get_valid_refresh_token, revoke_refresh_token, store_refresh_token
from app.crud.user import get_role_by_name, get_user_by_email, get_user_by_google_id, get_user_by_id
from app.models.user import User
from app.schemas.auth import GoogleSignupRequest, LoginRequest, RegisterRequest, TokenResponse
from app.services.email_service import send_welcome_email


def _issue_token_pair(db: Session, user: User) -> TokenResponse:
    access_token, _, _ = create_access_token(str(user.id))
    refresh_token, refresh_jti, refresh_expires_at = create_refresh_token(str(user.id))
    store_refresh_token(db, user_id=user.id, jti=refresh_jti, token=refresh_token, expires_at=refresh_expires_at)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


def _default_account_role(db: Session):
    account_role = get_role_by_name(db, "user")
    if not account_role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Default user role is not configured.")
    return account_role


def _send_welcome_safely(user: User) -> None:
    try:
        send_welcome_email(user)
    except Exception as exc:
        print(f"Welcome email failed for {user.email}: {exc}")


def register_user(db: Session, payload: RegisterRequest) -> TokenResponse:
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered.")
    account_role = _default_account_role(db)
    user = User(
        full_name=payload.name.strip(),
        email=payload.email.lower(),
        password=hash_password(payload.password),
        role_id=account_role.id,
        job_title="Google account",
        organization=None,
        phone=None,
        country="Unknown",
        workspace_name=f"{full_name}'s Workspace",
        terms_accepted=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user, attribute_names=["role"])
    _send_welcome_safely(user)
    return _issue_token_pair(db, user)


def google_signup_user(db: Session, payload: GoogleSignupRequest) -> TokenResponse:
    if not settings.google_client_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Google OAuth is not configured.")
    try:
        google_payload = google_id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google credential.") from exc

    google_id = google_payload.get("sub")
    email = google_payload.get("email")
    full_name = google_payload.get("name") or email
    profile_picture = google_payload.get("picture")
    if not google_id or not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google account did not provide the required profile information.")

    user = get_user_by_google_id(db, google_id) or get_user_by_email(db, email)
    if user:
        if not user.google_id:
            user.google_id = google_id
        if profile_picture and not user.profile_picture:
            user.profile_picture = profile_picture
        db.add(user)
        db.commit()
        db.refresh(user, attribute_names=["role"])
        return _issue_token_pair(db, user)

    account_role = _default_account_role(db)
    user = User(
        full_name=full_name,
        email=email.lower(),
        password=hash_password(f"google:{google_id}"),
        role_id=account_role.id,
        job_title="Google account",
        organization=None,
        phone=None,
        country="Unknown",
        workspace_name=f"{full_name}'s Workspace",
        terms_accepted=True,
        google_id=google_id,
        profile_picture=profile_picture,
    )
    db.add(user)
    db.commit()
    db.refresh(user, attribute_names=["role"])
    _send_welcome_safely(user)
    return _issue_token_pair(db, user)


def login_user(db: Session, payload: LoginRequest) -> TokenResponse:
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive.")
    return _issue_token_pair(db, user)


def refresh_tokens(db: Session, refresh_token: str) -> TokenResponse:
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")
    db_token = get_valid_refresh_token(db, jti=payload["jti"], token=refresh_token)
    if not db_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")
    user = get_user_by_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists.")
    revoke_refresh_token(db, db_token)
    return _issue_token_pair(db, user)


def revoke_refresh_if_present(db: Session, refresh_token: str | None) -> None:
    if not refresh_token:
        return
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        return
    db_token = get_valid_refresh_token(db, jti=payload["jti"], token=refresh_token)
    if db_token:
        revoke_refresh_token(db, db_token)