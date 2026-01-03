from passlib.context import CryptContext

# bcrypt_sha256 hashes a SHA-256 of the password, removing the 72-byte limit and
# avoiding backend detection issues seen with plain bcrypt in some environments.
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")


def _truncate(password: str) -> str:
    # bcrypt_sha256 removes the 72-byte limit, but keep a soft guard to be safe
    return password[:256]


def hash_password(password: str) -> str:
    return pwd_context.hash(_truncate(password))


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(_truncate(password), hashed)
