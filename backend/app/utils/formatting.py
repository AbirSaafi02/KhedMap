from datetime import UTC, date, datetime, timedelta


def coerce_float(value) -> float:
    if value in (None, ""):
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)

    cleaned = []
    dot_seen = False
    for character in str(value).replace(",", "."):
        if character.isdigit():
            cleaned.append(character)
        elif character == "." and not dot_seen:
            cleaned.append(character)
            dot_seen = True

    try:
        return float("".join(cleaned)) if cleaned else 0.0
    except ValueError:
        return 0.0


def coerce_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def format_money(value, currency: str = "DT") -> str:
    amount = coerce_float(value)
    formatted = f"{amount:,.2f}".replace(",", " ")
    if formatted.endswith(".00"):
        formatted = formatted[:-3]
    return f"{formatted} {currency}".strip()


def friendly_date(value) -> str:
    if not value:
        return ""

    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return value

    if isinstance(value, date) and not isinstance(value, datetime):
        value = datetime.combine(value, datetime.min.time(), tzinfo=UTC)

    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)

    today = datetime.now(UTC).date()
    if value.date() == today:
        return "Today"
    if value.date() == today - timedelta(days=1):
        return "Yesterday"
    return value.strftime("%d %b %Y")
