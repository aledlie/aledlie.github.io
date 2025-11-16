#!/usr/bin/env python3
"""
Build unified entity graph for Fisterra Dance Organization.
Extracts entities from all Schema.org JSON files and creates a single @graph.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Set
from collections import defaultdict

def extract_entities_from_schema(data: Any, parent_path: str = '') -> List[Dict[str, Any]]:
    """
    Recursively extract all entities (objects with @type and @id) from Schema.org JSON.
    Returns list of (entity_dict, parent_path) tuples.
    """
    entities = []

    if isinstance(data, dict):
        # If this is an entity (has @type and @id)
        if '@type' in data and '@id' in data:
            entity = {
                '@id': data['@id'],
                '@type': data['@type'],
                'parent_path': parent_path
            }

            # Copy all properties except nested entities
            for key, value in data.items():
                if key in ('@context', '@graph'):
                    continue

                # Handle relationships (objects with only @id)
                if isinstance(value, dict) and '@id' in value and len(value) == 1:
                    # This is a reference to another entity
                    entity[key] = {'@id': value['@id']}
                elif isinstance(value, dict) and '@type' in value and '@id' in value:
                    # This is a nested entity - extract it separately
                    nested_entities = extract_entities_from_schema(value, f"{parent_path}.{key}")
                    entities.extend(nested_entities)
                    # Store reference
                    entity[key] = {'@id': value['@id']}
                elif isinstance(value, list):
                    # Handle arrays
                    new_list = []
                    for i, item in enumerate(value):
                        if isinstance(item, dict) and '@id' in item and len(item) == 1:
                            # Reference
                            new_list.append({'@id': item['@id']})
                        elif isinstance(item, dict) and '@type' in item and '@id' in item:
                            # Nested entity
                            nested_entities = extract_entities_from_schema(item, f"{parent_path}.{key}[{i}]")
                            entities.extend(nested_entities)
                            new_list.append({'@id': item['@id']})
                        else:
                            new_list.append(item)
                    entity[key] = new_list
                else:
                    # Regular property
                    entity[key] = value

            entities.append(entity)
        else:
            # Not an entity, but might contain entities
            for key, value in data.items():
                if key in ('@context', '@graph'):
                    continue
                if isinstance(value, (dict, list)):
                    entities.extend(extract_entities_from_schema(value, f"{parent_path}.{key}"))

    elif isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, (dict, list)):
                entities.extend(extract_entities_from_schema(item, f"{parent_path}[{i}]"))

    return entities

def merge_duplicate_entities(entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Merge entities with the same @id, combining their properties.
    Keeps the most complete version of each entity.
    """
    entity_map = {}

    for entity in entities:
        entity_id = entity['@id']

        if entity_id not in entity_map:
            entity_map[entity_id] = entity
        else:
            # Merge properties - keep the one with more properties
            existing = entity_map[entity_id]
            if len(entity.keys()) > len(existing.keys()):
                # This entity has more properties, use it as base
                for key, value in existing.items():
                    if key not in entity and key != 'parent_path':
                        entity[key] = value
                entity_map[entity_id] = entity
            else:
                # Keep existing, but add any new properties
                for key, value in entity.items():
                    if key not in existing and key != 'parent_path':
                        existing[key] = value

    return list(entity_map.values())

def build_entity_graph(base_url: str, json_files: List[Path]) -> Dict[str, Any]:
    """
    Build a unified @graph structure from multiple Schema.org JSON files.
    """
    all_entities = []

    # Extract entities from all files
    for json_file in json_files:
        print(f"Processing {json_file.name}...")
        with open(json_file, 'r') as f:
            data = json.load(f)

        entities = extract_entities_from_schema(data)
        print(f"  Extracted {len(entities)} entities")
        all_entities.extend(entities)

    # Merge duplicate entities
    print(f"\nMerging duplicate entities...")
    unique_entities = merge_duplicate_entities(all_entities)
    print(f"  {len(all_entities)} entities -> {len(unique_entities)} unique entities")

    # Sort entities for consistent output
    unique_entities.sort(key=lambda e: e['@id'])

    # Remove parent_path helper field
    for entity in unique_entities:
        entity.pop('parent_path', None)

    # Build final graph
    graph = {
        '@context': 'https://schema.org',
        '@graph': unique_entities
    }

    return graph

def analyze_relationships(graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze the entity graph to identify relationships and connections.
    """
    entities = graph['@graph']

    # Count entities by type
    type_counts = defaultdict(int)
    for entity in entities:
        entity_type = entity['@type']
        if isinstance(entity_type, list):
            for t in entity_type:
                type_counts[t] += 1
        else:
            type_counts[entity_type] += 1

    # Find all relationships (properties with @id references)
    relationships = []
    for entity in entities:
        source_id = entity['@id']
        source_type = entity['@type']

        for key, value in entity.items():
            if key in ('@id', '@type', '@context'):
                continue

            # Check if property is a relationship
            if isinstance(value, dict) and '@id' in value:
                relationships.append({
                    'source': source_id,
                    'source_type': source_type,
                    'property': key,
                    'target': value['@id']
                })
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict) and '@id' in item:
                        relationships.append({
                            'source': source_id,
                            'source_type': source_type,
                            'property': key,
                            'target': item['@id']
                        })

    # Count relationships
    relationship_counts = defaultdict(int)
    for rel in relationships:
        relationship_counts[rel['property']] += 1

    return {
        'total_entities': len(entities),
        'entities_by_type': dict(type_counts),
        'total_relationships': len(relationships),
        'relationships': relationships,
        'relationships_by_property': dict(relationship_counts)
    }

def main():
    # Configuration
    base_url = 'https://fisterra-dance.com'
    test_samples_dir = Path(__file__).parent / 'test-samples'

    # Find all JSON files
    json_files = sorted(test_samples_dir.glob('*.json'))

    print("=" * 80)
    print("Building Fisterra Dance Organization Entity Graph")
    print("=" * 80)
    print(f"Base URL: {base_url}")
    print(f"Source files: {len(json_files)}")
    for f in json_files:
        print(f"  - {f.name}")
    print()

    # Build the graph
    graph = build_entity_graph(base_url, json_files)

    # Analyze relationships
    print("\n" + "=" * 80)
    print("Graph Analysis")
    print("=" * 80)
    analysis = analyze_relationships(graph)

    print(f"\nTotal entities: {analysis['total_entities']}")
    print(f"\nEntities by type:")
    for entity_type, count in sorted(analysis['entities_by_type'].items()):
        print(f"  {entity_type}: {count}")

    print(f"\nTotal relationships: {analysis['total_relationships']}")
    print(f"\nRelationships by property:")
    for prop, count in sorted(analysis['relationships_by_property'].items()):
        print(f"  {prop}: {count}")

    # Save the unified graph
    output_file = Path(__file__).parent / 'unified-entity-graph.json'
    with open(output_file, 'w') as f:
        json.dump(graph, f, indent=2)
    print(f"\n✅ Unified entity graph saved to: {output_file.name}")

    # Save the analysis
    analysis_file = Path(__file__).parent / 'entity-graph-analysis.json'
    with open(analysis_file, 'w') as f:
        json.dump(analysis, f, indent=2)
    print(f"✅ Graph analysis saved to: {analysis_file.name}")

    # Print relationship graph
    print("\n" + "=" * 80)
    print("Entity Relationship Map")
    print("=" * 80)

    # Group relationships by source entity
    relationships_by_source = defaultdict(list)
    for rel in analysis['relationships']:
        relationships_by_source[rel['source']].append(rel)

    for source_id in sorted(relationships_by_source.keys()):
        rels = relationships_by_source[source_id]
        source_type = rels[0]['source_type']
        if isinstance(source_type, list):
            source_type = ', '.join(source_type)

        print(f"\n{source_type}")
        print(f"  @id: {source_id}")
        print(f"  Relationships:")
        for rel in rels:
            target_short = rel['target'].replace(base_url, '')
            print(f"    - {rel['property']} → {target_short}")

if __name__ == '__main__':
    main()
