from json import load, loads, dump
from typing import Sequence, Optional
import os
from encounter_generation.utils import to_numeric_cr

XP_AMOUNTS = {
    '0':10, '1/8':25, '1/4':50, '1/2':100, '1':200, '2':450, '3':700, '4':1100, '5': 1800, '6': 2300,
    '7': 2900, '8':3900, '9': 5000, '10': 5900, '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
    '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000,
    '24': 62000, '25': 75000, '26': 90000, '27': 105000,' 28': 120000, '30': 155000, '00': None}


def cleanup_downloaded_json():
    with open('assets/mob_data/stat_blocks/Monster Manual.JSON', 'r', encoding='utf8') as f:
        monsters = load(f)
    output = {}
    for _, monster_data in monsters.items():
        monster = loads(monster_data)
        if type(monster) == list:
            continue
        monster['CR'] = monster['Challenge']
        del monster['Challenge']
        monster['Name'] = monster['Name'].lower()
        monster['size'] = monster['Type'].split(' ')[0].lower()
        monster['category'] = monster['Type'].split(',')[0].split(' ')[1]
        monster['alignment'] = monster['Type'].split(',')[-1]
        monster['Source'] = 'Monster Manual'
        output[monster['Name']] = monster
    with open('assets/mob_data/stat_blocks/mm_monsters.json', 'w') as f:
        dump(output, f, indent=4)


class Mob:
    def __init__(self, Name, CR, **kwargs):
        self.name = Name
        self.cr = str(CR)
        self.num_cr = to_numeric_cr(CR)
        self.xp = XP_AMOUNTS[str(CR)]
        self.stat_block = kwargs

    def __repr__(self):
        return f"{self.name}(cr {self.cr})"

    def __hash__(self):
        return hash(f'{self.name}{self.cr}')

    def __eq__(self, other):
        if self.name == other.name and self.cr == other.cr:
            return True
        return False

    @property
    def five_e_tools_url(self) -> Optional[str]:
        if self.stat_block['Source'] == 'Monster Manual':
            url_name = self.name.replace(' ', '%20')
            full_url = f"https://5e.tools/bestiary.html#{url_name}_mm"
            return full_url
        return None


def _load_mobs() -> dict[str, Mob]:
    if not os.path.exists('assets/mob_data/stat_blocks/mm_monsters.json'):
        cleanup_downloaded_json()
    with open('assets/mob_data/stat_blocks/mm_monsters.json', 'r') as f:
        mm_mobs = load(f)

    with open('assets/mob_data/stat_blocks/homebrew_monsters.json', 'r') as f:
        homebrew_mobs = load(f)

    all_mobs = homebrew_mobs | mm_mobs
    output = {}
    for _, mob_data in all_mobs.items():
        output[mob_data['Name']] = Mob(**mob_data)

    return output


MOBS = _load_mobs()

with open('assets/mob_data/environment_sets.json', 'r') as f:
    ENVIRONMENT_SETS = load(f)

class MobSet:

    def __init__(self, name: str, mobs: Sequence[Mob]):
        self.name = name
        self.mobs = mobs

    def __repr__(self):
        return f'{self.name}({[str(x) for x in self.mobs]})'


with open('assets/mob_data/mob_sets.json', 'r') as f:
    _mob_sets = load(f)
    MOB_SETS: dict[str, MobSet] = {}
    for set_key, value in _mob_sets.items():
        set_name = value['name']
        set_mobs = [MOBS[mob_name] for mob_name in value['mobs']]
        MOB_SETS[set_key] = MobSet(set_name, set_mobs)

