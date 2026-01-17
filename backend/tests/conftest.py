"""backend test configuration"""

import sys
from pathlib import Path

# add backend directory to path for imports
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))
