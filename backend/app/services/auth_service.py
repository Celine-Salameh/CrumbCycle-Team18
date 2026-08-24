from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.crud.auth import get_valid_refresh_token, revoke_refresh_token, store_refresh_token
from app.crud.user import get_role_by_name, get_user_by_email, get_user_by_id
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


def _issue_token_pair(db: Session, user: User) -> TokenResponse:
    access_token, _, _ = create_access_token(str(user.id))
    refresh_token, refresh_jti, refresh_expires_at = create_refresh_token(str(user.id))
    store_refresh_token(db, user_id=user.id, jti=refresh_jti, token=refresh_token, expires_at=refresh_expires_at)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


def register_user(db: Session, payload: RegisterRequest) -> TokenResponse:
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered.")
    role = get_role_by_name(db, payload.role)
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role.")
    user = User(full_name=payload.name.strip(), email=payload.email.lower(), password=hash_password(payload.password), role_id=role.id)
    db.add(user)
    db.commit()
    db.refresh(user, attribute_names=["role"])
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
