from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.refresh_token import RefreshToken
from app.models.token_blacklist import TokenBlacklist


def store_refresh_token(db: Session, *, user_id: int, jti: str, token: str, expires_at: datetime) -> RefreshToken:
    db_obj = RefreshToken(user_id=user_id, jti=jti, token_hash=hash_password(token), expires_at=expires_at)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_valid_refresh_token(db: Session, *, jti: str, token: str) -> RefreshToken | None:
    db_obj = db.scalar(select(RefreshToken).where(RefreshToken.jti == jti))
    if not db_obj or db_obj.revoked or db_obj.expires_at < datetime.now(UTC):
        return None
    return db_obj if verify_password(token, db_obj.token_hash) else None


def revoke_refresh_token(db: Session, db_obj: RefreshToken) -> RefreshToken:
    db_obj.revoked = True
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def blacklist_access_token(db: Session, *, jti: str, expires_at: datetime) -> None:
    exists = db.scalar(select(TokenBlacklist).where(TokenBlacklist.jti == jti))
    if not exists:
        db.add(TokenBlacklist(jti=jti, expires_at=expires_at))
        db.commit()


def is_access_token_blacklisted(db: Session, *, jti: str) -> bool:
    return db.scalar(select(TokenBlacklist).where(TokenBlacklist.jti == jti)) is not None
