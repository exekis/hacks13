from pydantic import BaseModel
from typing import Optional

class CreatePostIn(BaseModel):
    author_id: int  # int to match database
    content: str
    is_event: bool = False

class PostOut(BaseModel):
    id: str
    author_id: str
    content: str
    is_event: bool
