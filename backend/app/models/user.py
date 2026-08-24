from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    google_id: Mapped[str | None] = mapped_column("googleId", String(255), unique=True)
    profile_picture: Mapped[str | None] = mapped_column("profilePicture", String(500))
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", onupdate="CASCADE"), nullable=False)
    job_title: Mapped[str] = mapped_column("role", String(120), nullable=False)
    organization: Mapped[str | None] = mapped_column(String(160))
    phone: Mapped[str | None] = mapped_column(String(30))
    country: Mapped[str] = mapped_column(String(80), nullable=False)
    workspace_name: Mapped[str] = mapped_column("workspaceName", String(120), nullable=False)
    terms_accepted: Mapped[bool] = mapped_column("termsAccepted", Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    role = relationship("Role", back_populates="users")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")