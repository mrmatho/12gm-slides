// Starter JSON shown in the editor when a diagram type is first selected (see app.js). Every
// configuration prop the matching renderer in diagrams.js reads is included here explicitly, set
// to its actual default, so the whole set of knobs is visible without checking the field
// reference or diagrams.js — editing one is then just changing a value already in front of you,
// not adding a new key from scratch.
export const EXAMPLES = {
  simple: `{
  "width": 420,
  "height": 240,
  "nodeRadius": 22,
  "directed": false,
  "labelPosition": "left",
  "dotRadius": 6,
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
  "directed": true,
  "labelPosition": "left",
  "dotRadius": 6,
  "arrowSize": 7,
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
  "height": 220,
  "nodeRadius": 22,
  "labelPosition": "left",
  "dotRadius": 6,
  "arrowSize": 7,
  "nodes": [
    { "id": "S", "label": "Source", "x": 70, "y": 110 },
    { "id": "A", "label": "A", "x": 230, "y": 55 },
    { "id": "B", "label": "B", "x": 230, "y": 165 },
    { "id": "T", "label": "Sink", "x": 410, "y": 110 }
  ],
  "edges": [
    { "from": "S", "to": "A", "capacity": 6 },
    { "from": "S", "to": "B", "capacity": 4 },
    { "from": "A", "to": "T", "capacity": 5 },
    { "from": "B", "to": "T", "capacity": 5 },
    { "from": "A", "to": "B", "capacity": 2 }
  ],
  "cuts": [
    { "x1": 150, "y1": 10, "x2": 150, "y2": 210, "label": "Cut 1" }
  ]
}`,

  bipartite: `{
  "width": 360,
  "height": 240,
  "nodeRadius": 20,
  "columnInset": 70,
  "labelPosition": "left",
  "dotRadius": 6,
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
  "showTimes": false,
  "highlightCriticalPath": false,
  "nodeRadius": 26,
  "dotRadius": 6,
  "arrowSize": 7,
  "tasks": [
    { "id": "A", "duration": 3, "predecessors": [] },
    { "id": "B", "duration": 3, "predecessors": [] },
    { "id": "C", "duration": 2, "predecessors": ["A"] },
    { "id": "D", "duration": 4, "predecessors": ["B"] },
    { "id": "E", "duration": 2, "predecessors": ["C", "D"] }
  ]
}`,

  forwardScan: `{
  "highlightCriticalPath": false,
  "showValues": true,
  "dotRadius": 6,
  "boxWidth": 48,
  "boxHeight": 20,
  "arrowSize": 7,
  "tasks": [
    { "id": "A", "duration": 3, "predecessors": [] },
    { "id": "B", "duration": 3, "predecessors": [] },
    { "id": "C", "duration": 2, "predecessors": ["A"] },
    { "id": "D", "duration": 4, "predecessors": ["B"] },
    { "id": "E", "duration": 2, "predecessors": ["C", "D"] }
  ]
}`
}
