"""
Run all collectors: create collector_runs record, execute collectors, upload to S3, insert evidence, update status.
Usage: from backend dir: python -m runner.run_collector
       or: python runner/run_collector.py (with PYTHONPATH=.)
"""
import sys
from pathlib import Path

# Ensure backend root is on path
_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from services.collector_service import run_all_collectors


def main():
    print("Starting SWIFT AWS evidence collection...")
    run_id = run_all_collectors(trigger_type="manual")
    print(f"Run completed. run_id={run_id}")


if __name__ == "__main__":
    main()
