from sqlmodel import SQLModel


class OrderRequestCreate(SQLModel):
    product_id: int
    buyer_id: int


class OrderRequestRead(SQLModel):
    id: int
    product_id: int
    buyer_id: int
    status: str
