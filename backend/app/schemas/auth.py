import re

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import UserRead

PHONE_PATTERN = re.compile(r"^\+?[0-9\s().-]{7,20}$")
PASSWORD_RULES = [
    ("at least 8 characters", lambda password: len(password) >= 8),
    ("an uppercase letter", lambda password: re.search(r"[A-Z]", password)),
    ("a lowercase letter", lambda password: re.search(r"[a-z]", password)),
    ("a number", lambda password: re.search(r"[0-9]", password)),
    ("a symbol", lambda password: re.search(r"[^A-Za-z0-9]", password)),
]


def get_password_errors(password: str) -> list[str]:
    return [f"Needs {label}" for label, passes in PASSWORD_RULES if not passes(password)]


class RegistrationProfileFields(BaseModel):
    role: str = Field(min_length=1, max_length=120)
    organization: str | None = Field(default=None, max_length=160)
    phone: str | None = Field(default=None, max_length=30)
    country: str = Field(min_length=1, max_length=80)
    workspaceName: str = Field(min_length=1, max_length=120)
    termsAccepted: bool

    @field_validator("role", "country", "workspaceName")
    @classmethod
    def require_non_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("organization", "phone")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value and not PHONE_PATTERN.match(value):
            raise ValueError("Enter a valid phone number.")
        return value

    @field_validator("termsAccepted")
    @classmethod
    def require_terms(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Terms and privacy acceptance is required.")
        return value


class RegisterRequest(RegistrationProfileFields):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        errors = get_password_errors(value)
        if errors:
            raise ValueError(". ".join(errors))
        return value


class GoogleSignupRequest(BaseModel):
    credential: str = Field(min_length=1)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserRead