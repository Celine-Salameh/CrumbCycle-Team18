from datetime import UTC, datetime

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.crud.auth import is_access_token_blacklisted
from app.crud.user import get_user_by_id
from app.db.session import get_db
from app.models.user import User

bearer_scheme = HTTPBearer()


def get_current_access_payload(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    try:
        payload = decode_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token.")
    return payload


def get_current_user(payload: dict = Depends(get_current_access_payload), db: Session = Depends(get_db)) -> User:
    if is_access_token_blacklisted(db, jti=payload["jti"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked.")
    user = get_user_by_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive.")
    return user


def token_expiration_from_payload(payload: dict) -> datetime:
    return datetime.fromtimestamp(payload["exp"], tz=UTC)
