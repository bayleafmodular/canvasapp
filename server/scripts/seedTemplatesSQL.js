const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const ShapeType = {
  WALL: "WALL",
  RECTANGLE: "RECTANGLE"
};

const defaultTemplates = [
  {
    name: "Small Office Layout (10x8m)",
    category: "Commercial",
    description: "Default Commercial template layout.",
    layers: [
      { id: "layer-walls", name: "Walls", visible: true, locked: true, color: "#AAAAAA" },
      { id: "layer-furniture", name: "Furniture", visible: true, locked: false, color: "#4a90e2" }
    ],
    objects: [
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [0, 0, 10000, 0], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [10000, 0, 10000, 8000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [10000, 8000, 0, 8000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [0, 8000, 0, 0], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [0, 3000, 7000, 3000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [7000, 0, 7000, 3000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [4000, 0, 4000, 3000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [7000, 3000, 7000, 8000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.RECTANGLE, x: 1000, y: 1000, width: 2000, height: 1000, layerId: "layer-furniture" },
      { id: uuidv4(), type: ShapeType.RECTANGLE, x: 7500, y: 1000, width: 1500, height: 800, layerId: "layer-furniture" },
      { id: uuidv4(), type: ShapeType.RECTANGLE, x: 1000, y: 4000, width: 1200, height: 800, layerId: "layer-furniture" },
      { id: uuidv4(), type: ShapeType.RECTANGLE, x: 2500, y: 4000, width: 1200, height: 800, layerId: "layer-furniture" },
      { id: uuidv4(), type: ShapeType.RECTANGLE, x: 4000, y: 4000, width: 1200, height: 800, layerId: "layer-furniture" },
      { id: uuidv4(), type: ShapeType.RECTANGLE, x: 1000, y: 5500, width: 1200, height: 800, layerId: "layer-furniture" },
      { id: uuidv4(), type: ShapeType.RECTANGLE, x: 2500, y: 5500, width: 1200, height: 800, layerId: "layer-furniture" },
      { id: uuidv4(), type: ShapeType.RECTANGLE, x: 4000, y: 5500, width: 1200, height: 800, layerId: "layer-furniture" }
    ]
  },
  {
    name: "2BHK Apartment",
    category: "Residential",
    description: "Default Residential template layout.",
    layers: [
      { id: "layer-walls", name: "Walls", visible: true, locked: true, color: "#FFFFFF" }
    ],
    objects: [
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [0, 0, 8000, 0], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [8000, 0, 8000, 10000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [8000, 10000, 0, 10000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [0, 10000, 0, 0], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 0, y: 0, points: [0, 4000, 4000, 4000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 4000, y: 0, points: [4000, 0, 4000, 4000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 4000, y: 4000, points: [4000, 4000, 8000, 4000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 4000, y: 4000, points: [4000, 4000, 4000, 6000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 4000, y: 6000, points: [4000, 6000, 6000, 6000], layerId: "layer-walls" },
      { id: uuidv4(), type: ShapeType.WALL, x: 6000, y: 4000, points: [6000, 4000, 6000, 6000], layerId: "layer-walls" },
    ]
  }
];

let sql = `\n-- Seed Default Templates\ninsert into public.templates (name, category, description, status, layers, objects)\nvalues\n`;

const values = defaultTemplates.map(t => {
  const name = t.name.replace(/'/g, "''");
  const category = t.category.replace(/'/g, "''");
  const desc = t.description.replace(/'/g, "''");
  const layersJson = JSON.stringify(t.layers).replace(/'/g, "''");
  const objectsJson = JSON.stringify(t.objects).replace(/'/g, "''");
  
  return `('${name}', '${category}', '${desc}', 'active', '${layersJson}'::jsonb, '${objectsJson}'::jsonb)`;
});

sql += values.join(',\n') + ';';

const sqlPath = path.join(__dirname, '../sql/templates.sql');
fs.appendFileSync(sqlPath, sql, 'utf8');
console.log('Appended default templates to templates.sql');
