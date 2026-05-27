import sys
from orchestrator import MatchDayOrchestrator

def main():
    print("=" * 60)
    print("--- KhelMitra AI CLI ---")
    print("=" * 60)
    
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
    else:
        prompt = "I am staying in Mumbai, my match starts at 7PM, I hate crowds and I want some local food like Vada Pav."
        
    print(f"\nUser Input:\n\"{prompt}\"\n")
    print("Orchestrating agent workflows...")
    print("-" * 60)
    
    orchestrator = MatchDayOrchestrator()
    itinerary = orchestrator.process_fan_request(prompt)
    
    print("\nResulting Match-Day Plan:\n")
    print(itinerary)
    print("=" * 60)

if __name__ == "__main__":
    main()
