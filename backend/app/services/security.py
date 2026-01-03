from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _truncate(password: str) -> str:
    # bcrypt accepts up to 72 bytes; enforce soft truncation to avoid runtime errors
    return password[:72]


def hash_password(password: str) -> str:
    return pwd_context.hash(_truncate(password))


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(_truncate(password), hashed)
