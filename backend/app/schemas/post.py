from pydantic import BaseModel
from datetime import datetime

class PostCreate(BaseModel):
    user_id: int
    post_content: str
    capacity: int
    start_time: datetime
    end_time: datetime
    location_str: str

class CreatePostIn(BaseModel):
    author_id: int  # int to match database
    content: str
    is_event: bool = False

class PostOut(BaseModel):
    id: str
    author_id: str
    content: str
    is_event: bool
