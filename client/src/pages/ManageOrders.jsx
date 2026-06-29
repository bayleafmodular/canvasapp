import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { getAdminOrders, updateAdminOrderStatus } from '../services/api';
import {
  Search, Eye, X, User, Phone, MapPin, Calendar,
  DollarSign, ClipboardList, ZoomIn, ZoomOut, Maximize2,
  ChevronLeft, ChevronRight, FileText, LayoutGrid
} from 'lucide-react';

// 12 Mock Orders according to requirements
const MOCK_ORDERS = [
  {
    id: "ORD-2026-001",
    customerName: "Robert Miller",
    email: "robert.miller@example.com",
    phone: "+1 (555) 382-9012",
    address: "124 Oak Ave, Austin, TX 78701",
    productName: "2BHK House Plan Layout",
    quantity: 1,
    totalPrice: 150.00,
    orderDate: "2026-06-15",
    status: "Completed",
    blueprintType: "house_2bhk"
  },
  {
    id: "ORD-2026-002",
    customerName: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "+1 (555) 019-2834",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    productName: "Modern Studio Apartment",
    quantity: 1,
    totalPrice: 99.00,
    orderDate: "2026-06-16",
    status: "Processing",
    blueprintType: "studio"
  },
  {
    id: "ORD-2026-003",
    customerName: "Alex Johnson",
    email: "alex.j@example.com",
    phone: "+1 (555) 728-1934",
    address: "893 Maple St, Seattle, WA 98101",
    productName: "Commercial Office Floorplan",
    quantity: 2,
    totalPrice: 450.00,
    orderDate: "2026-06-17",
    status: "Pending",
    blueprintType: "office"
  },
  {
    id: "ORD-2026-004",
    customerName: "Michael Chen",
    email: "m.chen@example.com",
    phone: "+1 (555) 392-1209",
    address: "550 Broadway, New York, NY 10012",
    productName: "Industrial Warehouse Blueprint",
    quantity: 1,
    totalPrice: 350.00,
    orderDate: "2026-06-18",
    status: "Completed",
    blueprintType: "warehouse"
  },
  {
    id: "ORD-2026-005",
    customerName: "Pamela Davis",
    email: "pamela.davis@example.com",
    phone: "+1 (555) 482-1928",
    address: "56 Pine Rd, Atlanta, GA 30309",
    productName: "Duplex Villa Foundation Plan",
    quantity: 1,
    totalPrice: 249.00,
    orderDate: "2026-06-19",
    status: "Pending",
    blueprintType: "duplex"
  },
  {
    id: "ORD-2026-006",
    customerName: "David Miller",
    email: "david.miller@example.com",
    phone: "+44 20 7946 0192",
    address: "Flat 12, Baker Street, London, NW1 6XE",
    productName: "Retail Store Floor Layout",
    quantity: 1,
    totalPrice: 180.00,
    orderDate: "2026-06-20",
    status: "Processing",
    blueprintType: "retail"
  },
  {
    id: "ORD-2026-007",
    customerName: "Steven Baker",
    email: "steven.baker@example.com",
    phone: "+1 (555) 891-0293",
    address: "12 Walnut Dr, Denver, CO 80202",
    productName: "3BHK Luxury Floorplan",
    quantity: 1,
    totalPrice: 280.00,
    orderDate: "2026-06-20",
    status: "Pending",
    blueprintType: "house_3bhk"
  },
  {
    id: "ORD-2026-008",
    customerName: "Emily Watson",
    email: "emily.w@example.com",
    phone: "+1 (555) 902-1245",
    address: "902 Pine Street, Seattle, WA 98101",
    productName: "Kitchen Renovation Plan",
    quantity: 1,
    totalPrice: 79.00,
    orderDate: "2026-06-21",
    status: "Completed",
    blueprintType: "kitchen"
  },
  {
    id: "ORD-2026-009",
    customerName: "Alan Green",
    email: "alan.green@example.com",
    phone: "+1 (555) 234-5678",
    address: "405 Birch Ave, Boston, MA 02108",
    productName: "Terrace Garden Layout",
    quantity: 1,
    totalPrice: 59.00,
    orderDate: "2026-06-21",
    status: "Processing",
    blueprintType: "garden"
  },
  {
    id: "ORD-2026-010",
    customerName: "Sophia Rodriguez",
    email: "sophia.r@example.com",
    phone: "+34 612 345 678",
    address: "Calle Mayor 14, Madrid, 28013",
    productName: "Boutique Hotel Suite Design",
    quantity: 3,
    totalPrice: 520.00,
    orderDate: "2026-06-22",
    status: "Pending",
    blueprintType: "hotel"
  },
  {
    id: "ORD-2026-011",
    customerName: "Vincent Stark",
    email: "vincent.stark@example.com",
    phone: "+1 (555) 678-9012",
    address: "10880 Malibu Point, Malibu, CA 90265",
    productName: "Penthouse Deck Design",
    quantity: 1,
    totalPrice: 199.00,
    orderDate: "2026-06-22",
    status: "Processing",
    blueprintType: "penthouse"
  },
  {
    id: "ORD-2026-012",
    customerName: "Olivia Taylor",
    email: "olivia.t@example.com",
    phone: "+61 2 9382 1234",
    address: "24 Alfred St, Milsons Point, Sydney, NSW 2061",
    productName: "Co-working Space Concept",
    quantity: 1,
    totalPrice: 399.00,
    orderDate: "2026-06-22",
    status: "Completed",
    blueprintType: "coworking"
  }
];

const statusStyles = {
  Pending: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  Processing: 'bg-blue-50 text-blue-800 border border-blue-200',
  Completed: 'bg-green-50 text-green-800 border border-green-200',
};

// Helper to compute bounding box of custom CAD drawings to auto-scale/center the preview
const getBoundingBox = (objects) => {
  if (!objects || objects.length === 0) return { minX: 0, minY: 0, width: 400, height: 300 };

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  objects.forEach(obj => {
    const ox = obj.x || 0;
    const oy = obj.y || 0;

    if (obj.points && Array.isArray(obj.points) && obj.points.length > 0) {
      for (let i = 0; i < obj.points.length; i += 2) {
        const px = obj.points[i] + ox;
        const py = obj.points[i+1] + oy;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    } else {
      if (obj.width != null && obj.height != null) {
        const x1 = Math.min(ox, ox + obj.width);
        const x2 = Math.max(ox, ox + obj.width);
        const y1 = Math.min(oy, oy + obj.height);
        const y2 = Math.max(oy, oy + obj.height);
        if (x1 < minX) minX = x1;
        if (x2 > maxX) maxX = x2;
        if (y1 < minY) minY = y1;
        if (y2 > maxY) maxY = y2;
      } else if (obj.radius != null) {
        const r = obj.radius;
        if (ox - r < minX) minX = ox - r;
        if (ox + r > maxX) maxX = ox + r;
        if (oy - r < minY) minY = oy - r;
        if (oy + r > maxY) maxY = oy + r;
      } else {
        if (ox < minX) minX = ox;
        if (ox > maxX) maxX = ox;
        if (oy < minY) minY = oy;
        if (oy > maxY) maxY = oy;
      }
    }
  });

  if (minX === Infinity || minY === Infinity) {
    return { minX: 0, minY: 0, width: 400, height: 300 };
  }

  const padding = 30; // Increased padding for text labels
  const width = Math.max(50, (maxX - minX) + padding * 2);
  const height = Math.max(50, (maxY - minY) + padding * 2);

  return {
    minX: minX - padding,
    minY: minY - padding,
    width,
    height
  };
};

const getDistance = (p1, p2) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
const formatMeasurement = (value) => Number(value || 0).toFixed(1);

// Custom Drawing SVG Renderer for displaying user CAD drawings in admin
function CustomDrawingRenderer({ objects }) {
  const bbox = useMemo(() => getBoundingBox(objects), [objects]);

  return (
    <svg
      viewBox={`${bbox.minX} ${bbox.minY} ${bbox.width} ${bbox.height}`}
      className="w-full h-full text-indigo-900 bg-[#0f172a]"
    >
      <defs>
        <pattern id="grid-custom" width="25" height="25" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#333f50" />
        </pattern>
      </defs>
      <rect
        x={bbox.minX}
        y={bbox.minY}
        width={bbox.width}
        height={bbox.height}
        fill="url(#grid-custom)"
      />

      {objects.map((obj, idx) => {
        const stroke = obj.stroke || "#38bdf8";
        const strokeWidth = obj.strokeWidth || 2;
        const ox = obj.x || 0;
        const oy = obj.y || 0;
        const rotation = obj.rotation || 0;

        let shapeElement = null;

        // 1. Draw shape vector components relative to (0,0) inside transform group
        switch (obj.type) {
          case "line":
            if (obj.points && obj.points.length >= 4) {
              shapeElement = (
                <line
                  x1={obj.points[0]}
                  y1={obj.points[1]}
                  x2={obj.points[2]}
                  y2={obj.points[3]}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              );
            }
            break;

          case "wall":
            if (obj.points && obj.points.length >= 4) {
              const [x1, y1, x2, y2] = obj.points;
              const dx = x2 - x1;
              const dy = y2 - y1;
              const len = Math.sqrt(dx * dx + dy * dy);
              if (len > 0) {
                const nx = -dy / len;
                const ny = dx / len;
                const offset = 6;
                const edgeStroke = stroke === "#9ca3af" ? "#d1d5db" : stroke;
                shapeElement = (
                  <g>
                    {/* Inner shaded wall body */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      opacity={0.3}
                      strokeLinecap="round"
                    />
                    {/* Parallel edge lines representing thickness */}
                    <line
                      x1={x1 + nx * offset}
                      y1={y1 + ny * offset}
                      x2={x2 + nx * offset}
                      y2={y2 + ny * offset}
                      stroke={edgeStroke}
                      strokeWidth={1.5}
                    />
                    <line
                      x1={x1 - nx * offset}
                      y1={y1 - ny * offset}
                      x2={x2 - nx * offset}
                      y2={y2 - ny * offset}
                      stroke={edgeStroke}
                      strokeWidth={1.5}
                    />
                  </g>
                );
              }
            }
            break;

          case "beam":
            if (obj.points && obj.points.length >= 4) {
              shapeElement = (
                <line
                  x1={obj.points[0]}
                  y1={obj.points[1]}
                  x2={obj.points[2]}
                  y2={obj.points[3]}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinecap="square"
                  strokeDasharray="12,6"
                />
              );
            }
            break;

          case "lintel":
            if (obj.points && obj.points.length >= 4) {
              const [x1, y1, x2, y2] = obj.points;
              const dx = x2 - x1;
              const dy = y2 - y1;
              const len = Math.sqrt(dx * dx + dy * dy);
              if (len > 0) {
                const nx = -dy / len;
                const ny = dx / len;
                const capLen = 5;
                shapeElement = (
                  <g>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeLinecap="square"
                    />
                    <line
                      x1={x1 + nx * capLen}
                      y1={y1 + ny * capLen}
                      x2={x1 - nx * capLen}
                      y2={y1 - ny * capLen}
                      stroke={stroke}
                      strokeWidth={3}
                    />
                    <line
                      x1={x2 + nx * capLen}
                      y1={y2 + ny * capLen}
                      x2={x2 - nx * capLen}
                      y2={y2 - ny * capLen}
                      stroke={stroke}
                      strokeWidth={3}
                    />
                  </g>
                );
              }
            }
            break;

          case "polyline":
          case "free_draw":
            if (obj.points && obj.points.length >= 2) {
              const pointsStr = obj.points
                .reduce((acc, val, i) => {
                  const coord = val;
                  return acc + (i === 0 ? "" : i % 2 === 0 ? " " : ",") + coord;
                }, "");
              shapeElement = (
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            }
            break;

          case "rectangle":
            if (obj.width != null && obj.height != null) {
              shapeElement = (
                <rect
                  x={Math.min(0, obj.width)}
                  y={Math.min(0, obj.height)}
                  width={Math.abs(obj.width)}
                  height={Math.abs(obj.height)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
              );
            }
            break;

          case "circle":
            if (obj.radius != null) {
              shapeElement = (
                <circle
                  cx={0}
                  cy={0}
                  r={obj.radius}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
              );
            }
            break;

          case "arc":
            if (obj.radius != null && obj.endAngle != null) {
              const radius = obj.radius;
              const startAngleRad = 0;
              const endAngleRad = (obj.endAngle) * Math.PI / 180;
              
              const startX = radius * Math.cos(startAngleRad);
              const startY = radius * Math.sin(startAngleRad);
              const endX = radius * Math.cos(endAngleRad);
              const endY = radius * Math.sin(endAngleRad);
              
              const largeArcFlag = obj.endAngle > 180 ? 1 : 0;
              const sweepFlag = 1;
              
              const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
              shapeElement = (
                <path
                  d={pathData}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
              );
            }
            break;

          default:
            break;
        }

        // 2. Draw Measurement Texts relative to (0,0) inside transform group
        if ((obj.type === "line" || obj.type === "wall" || obj.type === "beam" || obj.type === "lintel") && obj.points && obj.points.length === 4) {
          const pt1 = { x: obj.points[0], y: obj.points[1] };
          const pt2 = { x: obj.points[2], y: obj.points[3] };
          const dist = getDistance(pt1, pt2);
          shapeElement = (
            <g>
              {shapeElement}
              <text
                x={(pt1.x + pt2.x) / 2 + 10}
                y={(pt1.y + pt2.y) / 2 - 10}
                fill="#4a90e2"
                fontSize={10}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {formatMeasurement(dist)} mm
              </text>
            </g>
          );
        } else if (obj.type === "rectangle" && obj.width != null && obj.height != null) {
          const rw = Math.abs(obj.width);
          const rh = Math.abs(obj.height);
          const rx = Math.min(0, obj.width);
          const ry = Math.min(0, obj.height);
          shapeElement = (
            <g>
              {shapeElement}
              <text
                x={rx + rw / 2}
                y={ry - 8}
                fill="#4a90e2"
                fontSize={10}
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {formatMeasurement(rw)} mm
              </text>
              <text
                x={rx + rw + 8}
                y={ry + rh / 2}
                fill="#4a90e2"
                fontSize={10}
                fontFamily="monospace"
                fontWeight="bold"
                alignmentBaseline="middle"
              >
                {formatMeasurement(rh)} mm
              </text>
            </g>
          );
        } else if (obj.type === "circle" && obj.radius != null) {
          shapeElement = (
            <g>
              {shapeElement}
              <text
                x={obj.radius + 8}
                y={0}
                fill="#4a90e2"
                fontSize={10}
                fontFamily="monospace"
                fontWeight="bold"
                alignmentBaseline="middle"
              >
                R {formatMeasurement(obj.radius)} mm
              </text>
            </g>
          );
        }

        return (
          <g key={idx} transform={`translate(${ox}, ${oy}) rotate(${rotation})`}>
            {shapeElement}
          </g>
        );
      })}
    </svg>
  );
}

// Blueprint SVG Drawer to render real vector floorplans interactively
function BlueprintDrawing({ type, drawingData }) {
  if (drawingData && Array.isArray(drawingData) && drawingData.length > 0) {
    return <CustomDrawingRenderer objects={drawingData} />;
  }

  switch (type) {
    case 'house_2bhk':
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full text-indigo-900 bg-slate-900">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#grid)" />
          {/* External Walls */}
          <rect x="40" y="30" width="320" height="240" fill="none" stroke="#94a3b8" strokeWidth="4" />
          {/* Internal Room Divisions */}
          <line x1="200" y1="30" x2="200" y2="270" stroke="#94a3b8" strokeWidth="3" />
          <line x1="40" y1="150" x2="200" y2="150" stroke="#94a3b8" strokeWidth="3" />
          <line x1="200" y1="120" x2="360" y2="120" stroke="#94a3b8" strokeWidth="3" />

          {/* Room Labels */}
          <text x="120" y="90" fill="#38bdf8" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BEDROOM 1</text>
          <text x="120" y="210" fill="#38bdf8" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">LIVING ROOM</text>
          <text x="280" y="75" fill="#38bdf8" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BEDROOM 2</text>
          <text x="280" y="195" fill="#38bdf8" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">KITCHEN</text>

          {/* Door symbols (arcs) */}
          <path d="M 200 90 A 30 30 0 0 1 170 120" fill="none" stroke="#f43f5e" strokeWidth="2" />
          <line x1="200" y1="90" x2="200" y2="120" stroke="#f43f5e" strokeWidth="2" />
          <path d="M 200 210 A 30 30 0 0 0 230 240" fill="none" stroke="#f43f5e" strokeWidth="2" />
          <line x1="200" y1="210" x2="200" y2="240" stroke="#f43f5e" strokeWidth="2" />

          {/* Dimensions */}
          <line x1="40" y1="15" x2="360" y2="15" stroke="#475569" strokeWidth="1" strokeDasharray="4" />
          <text x="200" y="12" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">16.00 m</text>
          <line x1="20" y1="30" x2="20" y2="270" stroke="#475569" strokeWidth="1" strokeDasharray="4" />
          <text x="12" y="150" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 12 150)">12.00 m</text>
        </svg>
      );
    case 'office':
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full text-indigo-900 bg-slate-900">
          <defs>
            <pattern id="grid-office" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#grid-office)" />
          {/* Outer Boundary */}
          <rect x="30" y="30" width="340" height="240" fill="none" stroke="#94a3b8" strokeWidth="4" />

          {/* Office Rooms */}
          <rect x="30" y="30" width="120" height="100" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <rect x="30" y="170" width="120" height="100" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <rect x="250" y="30" width="120" height="240" fill="none" stroke="#94a3b8" strokeWidth="3" />

          {/* Cubicles in center */}
          <line x1="170" y1="100" x2="210" y2="100" stroke="#475569" strokeWidth="2" />
          <line x1="170" y1="150" x2="210" y2="150" stroke="#475569" strokeWidth="2" />
          <line x1="170" y1="200" x2="210" y2="200" stroke="#475569" strokeWidth="2" />
          <line x1="190" y1="100" x2="190" y2="200" stroke="#475569" strokeWidth="2" />

          {/* Labels */}
          <text x="90" y="80" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CONFERENCE</text>
          <text x="90" y="220" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MANAGER</text>
          <text x="310" y="150" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">OPEN OFFICE</text>
          <text x="190" y="70" fill="#a78bfa" fontSize="10" fontFamily="monospace" textAnchor="middle">CUBICLES</text>

          {/* Columns */}
          <rect x="185" y="45" width="10" height="10" fill="#38bdf8" />
          <rect x="185" y="245" width="10" height="10" fill="#38bdf8" />
        </svg>
      );
    case 'warehouse':
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full text-indigo-900 bg-slate-900">
          <rect width="400" height="300" fill="#0f172a" />
          <rect x="20" y="20" width="360" height="260" fill="none" stroke="#475569" strokeWidth="3" strokeDasharray="8 4" />
          {/* Main wall */}
          <rect x="30" y="30" width="340" height="240" fill="none" stroke="#94a3b8" strokeWidth="4" />

          {/* Racks */}
          <rect x="60" y="60" width="40" height="180" fill="none" stroke="#64748b" strokeWidth="2" />
          <rect x="140" y="60" width="40" height="180" fill="none" stroke="#64748b" strokeWidth="2" />
          <rect x="220" y="60" width="40" height="180" fill="none" stroke="#64748b" strokeWidth="2" />

          {/* Office section */}
          <rect x="300" y="200" width="70" height="70" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <text x="335" y="240" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">OFFICE</text>

          {/* Labels */}
          <text x="80" y="150" fill="#475569" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 80 150)">AISLE A</text>
          <text x="160" y="150" fill="#475569" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 160 150)">AISLE B</text>
          <text x="240" y="150" fill="#475569" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 240 150)">AISLE C</text>
          <text x="180" y="28" fill="#10b981" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">LOADING DOCK</text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full text-indigo-900 bg-slate-900">
          <defs>
            <pattern id="grid-default" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#grid-default)" />
          {/* General Blueprint Layout */}
          <rect x="50" y="40" width="300" height="220" fill="none" stroke="#94a3b8" strokeWidth="4" />
          <line x1="50" y1="150" x2="350" y2="150" stroke="#94a3b8" strokeWidth="3" />
          <line x1="200" y1="40" x2="200" y2="260" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="200" cy="150" r="30" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" />

          <text x="125" y="100" fill="#38bdf8" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ZONE A</text>
          <text x="275" y="100" fill="#38bdf8" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ZONE B</text>
          <text x="125" y="210" fill="#38bdf8" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ZONE C</text>
          <text x="275" y="210" fill="#38bdf8" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ZONE D</text>
        </svg>
      );
  }
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Zooming
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset to first page on search or filter update
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Load orders from database
  useEffect(() => {
    let cancelled = false;
    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await getAdminOrders();
        if (!cancelled) {
          setOrders(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load orders:", err);
          setError(err.response?.data?.message || "Failed to load orders.");
          toast.error("Failed to load orders.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadOrders();
    return () => { cancelled = true; };
  }, []);

  // Handle order status change in database
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await updateAdminOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order =>
        order.id === orderId ? res.data : order
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.data);
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Searching and Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Page index calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* Toggle between List and details View */}
        {!selectedOrder ? (
          <>
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Drawing Orders</h2>
                  <p className="text-gray-500 text-sm mt-0.5">Manage and review blueprints ordered by customers.</p>
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Order ID, customer, email..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex w-full md:w-auto items-center gap-3">
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-44 rounded-lg border border-gray-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="all">All Orders</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Responsive Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order ID</th>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Product Name</th>
                      <th className="px-6 py-4 font-semibold">Total Price</th>
                      <th className="px-6 py-4 font-semibold">Order Date</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-600">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-400 font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            Loading orders from database...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-red-500 font-medium">
                          {error}
                        </td>
                      </tr>
                    ) : paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-400 font-medium">
                          No orders matched your search filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-6 py-4 font-mono font-semibold text-gray-800">{order.id}</td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-800">{order.customerName}</div>
                              <div className="text-xs text-gray-400">{order.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-700">{order.productName}</td>
                          <td className="px-6 py-4 font-bold text-gray-800">{formatPrice(order.totalPrice)}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[order.status] || 'bg-gray-100'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setZoomLevel(100);
                              }}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-indigo-100"
                            >
                              <Eye size={13} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              {totalPages > 1 && (
                <div className="bg-white px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Showing Page <span className="font-bold text-gray-700">{currentPage}</span> of <span className="font-bold text-gray-700">{totalPages}</span> ({filteredOrders.length} total orders)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Detailed View Page */
          <div className="space-y-6">

            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-gray-600"
                  title="Back to Orders"
                >
                  <ChevronLeft size={18} />
                </button>
                <div>
                  <div className="text-xs uppercase font-bold tracking-widest text-gray-400">Order Inspection</div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mt-0.5">
                    {selectedOrder.id}
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusStyles[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  disabled={updatingId === selectedOrder.id}
                  className="w-full sm:w-40 rounded-lg border border-gray-200 py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold disabled:opacity-55"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Customer and Order metadata details */}
              <div className="lg:col-span-2 space-y-6">

                {/* Customer Information Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <User size={16} className="text-indigo-500" /> Customer Information
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400 block text-xs">Customer Name</span>
                      <span className="font-semibold text-gray-700">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Email Address</span>
                      <span className="font-medium text-gray-700 break-all">{selectedOrder.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Phone Number</span>
                      <span className="font-medium text-gray-700">{selectedOrder.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs flex items-center gap-1">
                        <MapPin size={12} /> Address
                      </span>
                      <span className="font-medium text-gray-600 leading-relaxed block mt-0.5">{selectedOrder.address}</span>
                    </div>
                  </div>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-indigo-500" /> Order Details
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400 block text-xs">Product Name</span>
                      <span className="font-semibold text-gray-700">{selectedOrder.productName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 block text-xs">Quantity</span>
                        <span className="font-semibold text-gray-700">{selectedOrder.quantity} units</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-xs">Order Date</span>
                        <span className="font-semibold text-gray-700">
                          {new Date(selectedOrder.orderDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800">Total Price</span>
                      <span className="text-lg font-extrabold text-indigo-600">{formatPrice(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawing Preview Area */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-full flex flex-col">

                  {/* Drawing Toolbar */}
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <LayoutGrid size={16} className="text-indigo-500" /> Blueprint Preview
                    </h3>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                        className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Zoom Out"
                      >
                        <ZoomOut size={14} /> Zoom Out
                      </button>
                      <span className="px-3 py-2 text-xs font-mono font-bold text-gray-600 flex items-center justify-center min-w-[50px]">
                        {zoomLevel}%
                      </span>
                      <button
                        onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                        className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Zoom In"
                      >
                        <ZoomIn size={14} /> Zoom In
                      </button>
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Fullscreen Preview"
                      >
                        <Maximize2 size={14} /> Fullscreen
                      </button>
                    </div>
                  </div>

                  {/* SVG Blueprint Canvas Viewport */}
                  <div className="flex-1 bg-slate-950 min-h-[350px] relative overflow-hidden flex items-center justify-center p-4">
                    <div
                      className="w-full max-w-[450px] aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 shadow-2xl transition-transform duration-200"
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                    >
                      <BlueprintDrawing type={selectedOrder.blueprintType} drawingData={selectedOrder.drawingData} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Fullscreen drawing viewer modal */}
      {isFullscreen && selectedOrder && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col overflow-hidden">

          {/* Fullscreen header */}
          <div className="px-6 py-4 border-b border-slate-850 flex justify-between items-center bg-slate-900 text-white shrink-0">
            <div>
              <h3 className="font-semibold text-base">{selectedOrder.productName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Fullscreen View • Drawing ID: {selectedOrder.id}</p>
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Close Fullscreen"
            >
              <X size={20} />
            </button>
          </div>

          {/* Fullscreen contents */}
          <div className="flex-1 overflow-hidden relative flex items-center justify-center p-6 bg-slate-950">

            {/* Scale controls */}
            <div className="absolute bottom-6 right-6 flex gap-2 z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-2xl backdrop-blur-sm">
              <button
                onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ZoomOut size={16} />
              </button>
              <span className="px-3 text-xs font-mono font-bold text-slate-200 flex items-center justify-center min-w-[60px]">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(300, prev + 25))}
                className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* SVG */}
            <div
              className="w-full max-w-[800px] aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-slate-800 transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
            >
              <BlueprintDrawing type={selectedOrder.blueprintType} drawingData={selectedOrder.drawingData} />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
