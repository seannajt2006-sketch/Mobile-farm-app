from passlib.context import CryptContext

# Use pbkdf2_sha256 to avoid bcrypt backend issues and length limits.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def _truncate(password: str) -> str:
    return password[:256]


def hash_password(password: str) -> str:
    return pwd_context.hash(_truncate(password))


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(_truncate(password), hashed)
