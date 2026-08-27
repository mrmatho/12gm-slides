// Starter JSON shown in the editor when a diagram type is first selected (see app.js).
export const EXAMPLES = {
  simple: `{
  "width": 420,
  "height": 240,
  "nodeRadius": 22,
  "labelPosition": "left",
  "nodes": [
    { "id": "A", "label": "A", "x": 60, "y": 120 },
    { "id": "B", "label": "B", "x": 210, "y": 50 },
    { "id": "C", "label": "C", "x": 210, "y": 190 },
    { "id": "D", "label": "D", "x": 360, "y": 120 }
  ],
  "edges": [
    { "from": "A", "to": "B", "label": 4 },
    { "from": "A", "to": "C", "label": 7 },
    { "from": "B", "to": "D", "label": 3 },
    { "from": "C", "to": "D", "label": 5 },
    { "from": "B", "to": "C", "label": 2 }
  ]
}`,

  simpleDirected: `{
  "width": 420,
  "height": 240,
  "nodeRadius": 22,
  "labelPosition": "left",
  "nodes": [
    { "id": "A", "label": "A", "x": 60, "y": 120 },
    { "id": "B", "label": "B", "x": 210, "y": 50 },
    { "id": "C", "label": "C", "x": 210, "y": 190 },
    { "id": "D", "label": "D", "x": 360, "y": 120 }
  ],
  "edges": [
    { "from": "A", "to": "B", "label": 4 },
    { "from": "A", "to": "C", "label": 7 },
    { "from": "B", "to": "D", "label": 3 },
    { "from": "C", "to": "D", "label": 5 },
    { "from": "B", "to": "C", "label": 2 }
  ]
}`,

  flow: `{
  "width": 480,
  "height": 240,
  "nodeRadius": 22,
  "labelPosition": "left",
  "nodes": [
    { "id": "S", "label": "Source", "x": 70, "y": 120 },
    { "id": "A", "label": "A", "x": 230, "y": 60 },
    { "id": "B", "label": "B", "x": 230, "y": 180 },
    { "id": "T", "label": "Sink", "x": 410, "y": 120 }
  ],
  "edges": [
    { "from": "S", "to": "A", "capacity": 6 },
    { "from": "S", "to": "B", "capacity": 4 },
    { "from": "A", "to": "T", "capacity": 5 },
    { "from": "B", "to": "T", "capacity": 5 },
    { "from": "A", "to": "B", "capacity": 2 }
  ],
  "cuts": [
    { "x1": 150, "y1": 10, "x2": 150, "y2": 230, "label": "Cut 1" }
  ]
}`,

  bipartite: `{
  "width": 360,
  "height": 240,
  "labelPosition": "left",
  "leftLabel": "People",
  "rightLabel": "Tasks",
  "leftNodes": [
    { "id": "A", "label": "A" },
    { "id": "B", "label": "B" },
    { "id": "C", "label": "C" }
  ],
  "rightNodes": [
    { "id": "1", "label": "1" },
    { "id": "2", "label": "2" },
    { "id": "3", "label": "3" }
  ],
  "edges": [
    { "from": "A", "to": "1" },
    { "from": "A", "to": "3" },
    { "from": "B", "to": "1" },
    { "from": "B", "to": "2" },
    { "from": "C", "to": "3" }
  ]
}`,

  activity: `{
  "showTimes": true,
  "highlightCriticalPath": true,
  "tasks": [
    { "id": "A", "duration": 3, "predecessors": [] },
    { "id": "B", "duration": 3, "predecessors": [] },
    { "id": "C", "duration": 2, "predecessors": ["A"] },
    { "id": "D", "duration": 4, "predecessors": ["B"] },
    { "id": "E", "duration": 2, "predecessors": ["C", "D"] }
  ]
}`
}
