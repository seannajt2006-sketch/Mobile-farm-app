from sqlmodel import SQLModel


class UserCreate(SQLModel):
    name: str
    email: str
    password: str
    role: str


class UserLogin(SQLModel):
    email: str
    password: str


class UserRead(SQLModel):
    id: int
    name: str
    email: str
    role: str
