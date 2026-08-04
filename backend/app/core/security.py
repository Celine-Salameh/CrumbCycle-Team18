from datetime import UTC, datetime, timedelta
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(plain_password: str, password_hash: str | None) -> bool:
    return bool(password_hash) and password_context.verify(plain_password, password_hash)


def create_token(subject: str, expires_delta: timedelta, token_type: str) -> tuple[str, str, datetime]:
    expires_at = datetime.now(UTC) + expires_delta
    jti = str(uuid4())
    payload = {"sub": subject, "type": token_type, "jti": jti, "exp": expires_at, "iat": datetime.now(UTC)}
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, jti, expires_at


def create_access_token(subject: str) -> tuple[str, str, datetime]:
    return create_token(subject, timedelta(minutes=settings.access_token_expire_minutes), "access")


def create_refresh_token(subject: str) -> tuple[str, str, datetime]:
    return create_token(subject, timedelta(days=settings.refresh_token_expire_days), "refresh")


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid or expired token.") from exc
