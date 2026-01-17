from typing import AsyncGenerator

async def get_db() -> AsyncGenerator[None, None]:
    """
    Mock dependency to satisfy imports.
    In a real app, this would yield a database session.
    """
    yield None
