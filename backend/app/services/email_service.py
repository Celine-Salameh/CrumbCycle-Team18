from email.message import EmailMessage
import smtplib

from app.core.config import settings
from app.models.user import User


def send_welcome_email(user: User) -> None:
    if not settings.smtp_host or not settings.smtp_from:
        print(f"Welcome email skipped for {user.email}: SMTP is not configured.")
        return

    message = EmailMessage()
    message["Subject"] = "Welcome to CrumbCycle"
    message["From"] = settings.smtp_from
    message["To"] = user.email
    message.set_content(
        f"Hi {user.full_name},\n\n"
        "Your CrumbCycle account was created successfully.\n\n"
        "Welcome aboard,\n"
        "The CrumbCycle Team"
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
        if settings.smtp_use_tls:
            smtp.starttls()
        if settings.smtp_user and settings.smtp_password:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(message)