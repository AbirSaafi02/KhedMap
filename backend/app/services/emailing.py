import smtplib
from email.message import EmailMessage

from flask import current_app


def _mail_enabled() -> bool:
    return bool(current_app.config.get("SMTP_HOST")) and bool(current_app.config.get("MAIL_FROM_EMAIL"))


def _send_email(recipient: str, subject: str, body: str) -> bool:
    if not recipient or not _mail_enabled():
        return False

    message = EmailMessage()
    from_email = current_app.config["MAIL_FROM_EMAIL"]
    from_name = current_app.config.get("MAIL_FROM_NAME", "").strip()
    message["Subject"] = subject
    message["From"] = f"{from_name} <{from_email}>" if from_name else from_email
    message["To"] = recipient
    message.set_content(body)

    host = current_app.config["SMTP_HOST"]
    port = current_app.config["SMTP_PORT"]
    username = current_app.config.get("SMTP_USERNAME", "")
    password = current_app.config.get("SMTP_PASSWORD", "")
    use_tls = current_app.config.get("SMTP_USE_TLS", True)
    timeout = current_app.config.get("SMTP_TIMEOUT_SEC", 10)

    try:
        with smtplib.SMTP(host, port, timeout=timeout) as server:
            server.ehlo()
            if use_tls:
                server.starttls()
                server.ehlo()
            if username:
                server.login(username, password)
            server.send_message(message)
        return True
    except (OSError, smtplib.SMTPException):
        current_app.logger.exception("Failed to send email to %s", recipient)
        return False


def send_pending_account_email(user: dict) -> bool:
    login_url = current_app.config["PUBLIC_LOGIN_URL"]
    body = (
        f"Hello {user['name']},\n\n"
        "Your KhedMap account has been created successfully.\n"
        "It is now waiting for admin approval before you can sign in.\n\n"
        f"Role: {user['role']}\n"
        f"Login URL: {login_url}\n\n"
        "We will email you again as soon as your account is approved or rejected.\n\n"
        "KhedMap"
    )
    return _send_email(user["email"], "Your KhedMap account is pending approval", body)


def send_account_status_email(user: dict) -> bool:
    status = user.get("status", "")
    login_url = current_app.config["PUBLIC_LOGIN_URL"]

    if status == "approved":
        subject = "Your KhedMap account has been approved"
        body = (
            f"Hello {user['name']},\n\n"
            "Good news: your KhedMap account has been approved.\n"
            "You can now sign in and use the platform.\n\n"
            f"Role: {user['role']}\n"
            f"Login URL: {login_url}\n\n"
            "KhedMap"
        )
    elif status == "rejected":
        subject = "Your KhedMap account has been rejected"
        body = (
            f"Hello {user['name']},\n\n"
            "Your KhedMap account request has been rejected by the admin team.\n"
            "If you believe this is a mistake, please contact support or an administrator.\n\n"
            "KhedMap"
        )
    else:
        return False

    return _send_email(user["email"], subject, body)
