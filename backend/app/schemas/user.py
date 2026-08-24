from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: EmailStr
    google_id: str | None = None
    profile_picture: str | None = None
    role: RoleRead
    job_title: str
    organization: str | None = None
    phone: str | None = None
    country: str
    workspace_name: str
    terms_accepted: bool
    is_active: bool
    created_at: datetime