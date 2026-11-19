import struct
import json

with open('d:/project/aeron-flying-car/public/models/tesla_roadster.glb', 'rb') as f:
    magic, version, length = struct.unpack('<4sII', f.read(12))
    print('Header:', magic.decode('ascii'), 'Version:', version, 'Total Length:', length)
    chunk_len, chunk_type = struct.unpack('<I4s', f.read(8))
    print('Chunk 0:', chunk_type.decode('ascii'), 'Length:', chunk_len)
    json_bytes = f.read(chunk_len)
    data = json.loads(json_bytes.decode('utf-8'))

nodes = data.get('nodes', [])
meshes = data.get('meshes', [])
materials = data.get('materials', [])
print(f'Total nodes: {len(nodes)}, Total meshes: {len(meshes)}, Total materials: {len(materials)}')

print('\n=== ALL MESHES (with primitives & materials) ===')
for i, m in enumerate(meshes):
    name = m.get('name', f'mesh_{i}')
    prims = m.get('primitives', [])
    mat_indices = [p.get('material') for p in prims]
    mat_names = [materials[idx].get('name', f'mat_{idx}') if idx is not None and idx < len(materials) else 'None' for idx in mat_indices]
    print(f'Mesh {i:02d}: "{name}" | Materials: {mat_names}')

print('\n=== ALL NODES (with translation/rotation/mesh) ===')
for i, n in enumerate(nodes):
    name = n.get('name', f'node_{i}')
    m_idx = n.get('mesh')
    m_name = meshes[m_idx].get('name', f'mesh_{m_idx}') if m_idx is not None else '-'
    trans = n.get('translation', None)
    children = n.get('children', [])
    print(f'Node {i:02d}: "{name}" | Mesh: {m_name} (idx: {m_idx}) | Trans: {trans} | Children: {children}')
