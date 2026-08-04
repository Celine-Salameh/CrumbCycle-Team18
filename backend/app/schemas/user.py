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
    role: RoleRead
    is_active: bool
    created_at: datetime
