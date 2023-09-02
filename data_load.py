import os
import json

with open('assets/mob_data/mob_sets.json', 'r') as f:
    MOB_SETS = json.load(f)

with open('assets/mob_data/environment_sets.json', 'r') as f:
    ENVIRONMENT_SETS = json.load(f)
