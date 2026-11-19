import struct
import json

with open('d:/project/aeron-flying-car/public/models/tesla_roadster.glb', 'rb') as f:
    f.seek(12)
    chunk_len, chunk_type = struct.unpack('<I4s', f.read(8))
    json_bytes = f.read(chunk_len)
    data = json.loads(json_bytes.decode('utf-8'))

accessors = data.get('accessors', [])
meshes = data.get('meshes', [])

# Inspect position accessor min/max for each mesh to find its bounding box
for i, m in enumerate(meshes):
    name = m.get('name')
    for prim in m.get('primitives', []):
        pos_acc_idx = prim.get('attributes', {}).get('POSITION')
        if pos_acc_idx is not None:
            acc = accessors[pos_acc_idx]
            min_val = [round(v, 3) for v in acc.get('min', [])]
            max_val = [round(v, 3) for v in acc.get('max', [])]
            center = [round((min_val[j] + max_val[j])/2, 3) for j in range(3)]
            size = [round(max_val[j] - min_val[j], 3) for j in range(3)]
            mat_idx = prim.get('material')
            mat_name = data['materials'][mat_idx].get('name') if mat_idx is not None and mat_idx < len(data['materials']) else 'None'
            print(f'Mesh {i:02d} ({name}) | Mat: {mat_name} | Center: {center} | Size: {size}')
