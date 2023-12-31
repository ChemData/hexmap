import os
import json
from flask import Flask, render_template, jsonify, request, make_response
from flask_cors import CORS
from encounter_generation import generator
from map_update import update_map

app = Flask(__name__)
CORS(app)

with open("static/info/terrain.json", 'r') as f:
    TERRAIN = json.load(f)

with open("static/info/rivers.json", 'r') as f:
    RIVERS = json.load(f)

with open("static/info/roads.json", 'r') as f:
    ROADS = json.load(f)


@app.route('/')
def index():
    return render_template(
        'index.html',
        terrain_list=[(key, value['display_name']) for key, value in TERRAIN.items()],
        river_list=[(key, key.title()) for key in RIVERS.keys()],
        road_list=[(key, key.title()) for key in ROADS.keys()])


@app.route('/save', methods=['POST'])
def save_map():
    data = request.form
    hex_grid = data['hex_map']
    save_name = data['save_name']
    os.makedirs('storage', exist_ok=True)
    with open(f'storage/{save_name}.txt', 'w') as f:
        f.write(hex_grid)
    return jsonify(True)


@app.route('/load', methods=['POST'])
def load_map():
    data = request.form
    save_name = data['save_name']
    try:
        with open(f'storage/{save_name}.txt', 'r') as f:
            map_data = json.load(f)
        updated_map = update_map(map_data)
        return jsonify(json.dumps(updated_map))
    except FileNotFoundError:
        return jsonify(False)


@app.route('/saved_map_names', methods=['GET'])
def saved_map_names():
    try:
        save_names = [os.path.splitext(x)[0] for x in os.listdir('storage') if x.endswith('txt')]
    except FileNotFoundError:
        return []
    return save_names

@app.route('/delete_save', methods=['POST'])
def delete_save():
    to_delete = request.form['to_delete']
    try:
        os.remove(os.path.join('storage', f'{to_delete}.txt'))
    except FileNotFoundError:
        return jsonify(False)
    return jsonify(True)


@app.route('/encounter', methods=['GET'])
def encounter():
    data = request.args
    party = int(data['party_size'])*[int(data['party_level'])]
    primary_enemy = data.get('primary_enemy', '')
    if primary_enemy == "":
        primary_enemy = None
    env_type = data.get('environment_type', '')
    if env_type == "":
        env_type = None
    max_enemies = data.get('max_enemies', '')
    if max_enemies == "":
        max_enemies = None
    else:
        max_enemies = int(max_enemies)
    min_cr = data.get('min_cr', '0')
    roll_hp = data.get('roll_hp', True)
    if isinstance(roll_hp, str):
        roll_hp = roll_hp == 'true'
    if primary_enemy is None and env_type is None:
        response = make_response(jsonify({"error": 'You must select either an environment or primary enemy.'}), 460)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    try:
        new_encounter, difficulty, mob_type = generator.hex_encounter(
            data['difficulty'], party, primary_enemy, environment_type=env_type, max_mobs=max_enemies, min_cr=min_cr)
    except generator.NoUniqueGroup as e:
        response = make_response(jsonify({"error": str(e)}), 461)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    encounter_html = new_encounter.html_with_links(roll_hp)
    encounter_html = f'<h3>{difficulty.capitalize()} {mob_type.capitalize()}</h3>\n' + encounter_html
    return jsonify(encounter_html)


@app.route('/mob_set_names', methods=['GET'])
def mob_set_names():
    set_names = [(key, x.name) for key, x in generator.MOB_SETS.items()]
    set_names.sort(key=lambda x: x[1])
    output = [{'value': x[0], 'name': x[1]} for x in set_names]
    return jsonify(output)


@app.route('/environment_set_names', methods=['GET'])
def environment_set_names():
    set_names = [(key, x['name']) for key, x in generator.ENVIRONMENT_SETS.items()]
    set_names.sort(key=lambda x: x[1])
    output = [{'value': x[0], 'name': x[1]} for x in set_names]
    return jsonify(output)


@app.route('/terrain', methods=['GET'])
def terrain():
    data = dict([(x['id'], x['color']) for x in TERRAIN])
    return jsonify(data)


@app.route('/json_data', methods=['GET'])
def json_data():
    data_type = request.form['type']
    with open(f'static/{data_type}.json', 'r') as f:
        data = json.load(f)
    return jsonify(data)


if __name__ == '__main__':
    app.debug = True
    app.run()
