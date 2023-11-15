import json
import os
from copy import deepcopy


def update_map(map_data: dict):
    map_data = deepcopy(map_data)

    if 'offset' not in map_data:
        map_data['offset'] = [0, 0]

    for row in range(len(map_data['array'])):
        for col in range(len(map_data['array'][0])):
            hexa = map_data['array'][row][col]
            if 'position' not in hexa:
                hexa['position'] = {'col': col+map_data['offset'][0], 'row': row+map_data['offset'][1]}
            if 'rivers' not in hexa or not isinstance(hexa['rivers'], list):
                hexa['rivers'] = [False] * 6
    return map_data
